require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const Category = require("./models/category");
const Product = require("./models/product");
const cookieParser = require("cookie-parser");
const authRoutes = require("./routes/auth");
const { protect, restrictTo } = require("./middleware/auth");
const http = require("http");
const compression = require("compression");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const { initSocket, getIO } = require("./socket");

const app = express();
app.set("trust proxy", 1);
const PORT = process.env.PORT || 3000;

// Turn a Mongoose document into a plain object that is safe to send over a socket
function plain(doc) {
  return JSON.parse(JSON.stringify(doc));
}

app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(helmet());
app.use(compression());
app.use(express.json({ limit: "10kb" }));
app.use(cookieParser());
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 50,
  message: { error: "Too many attempts, please try again later" },
});
app.use("/api/auth", authLimiter, authRoutes);

app.get("/", (req, res) => {
  res.json({ message: "Products API (MongoDB) is running" });
});

// ---------- Categories ----------

app.get("/api/categories", async (req, res) => {
  const categories = await Category.find().sort({ name: 1 });
  res.status(200).json(categories);
});

app.post("/api/categories", protect, async (req, res) => {
  const { name } = req.body || {};
  const category = await Category.create({ name });

  getIO().emit("categories:changed");

  res.status(201).json(category);
});

app.delete("/api/categories/:id", protect, restrictTo("admin"), async (req, res) => {
  const inUse = await Product.exists({ category: req.params.id });
  if (inUse) {
    return res.status(409).json({ error: "Category still has products" });
  }
  const category = await Category.findByIdAndDelete(req.params.id);
  if (!category) {
    return res.status(404).json({ error: "Category not found" });
  }

  getIO().emit("categories:changed");

  res.status(204).send();
});

// ---------- Products ----------

// READ all (optional filters: ?category=<id>&search=<text>&sort=price or -price)
app.get("/api/products", async (req, res) => {
  const { category, search, sort } = req.query;

  const filter = {};
  if (category) filter.category = category;
  if (search) filter.$text = { $search: search };

  let sortOption = { createdAt: -1 };
  if (sort === "price") sortOption = { price: 1 };
  if (sort === "-price") sortOption = { price: -1 };

  const products = await Product.find(filter)
    .sort(sortOption)
    .populate("category", "name")
    .lean();

  res.status(200).json(products);
});

// READ one
app.get("/api/products/:id", async (req, res) => {
  const product = await Product.findById(req.params.id)
    .populate("category", "name")
    .lean();
  if (!product) {
    return res.status(404).json({ error: "Product not found" });
  }
  res.status(200).json(product);
});

// CREATE
app.post("/api/products", protect, async (req, res) => {
  const { name, price, category, inStock } = req.body || {};

  if (category) {
    const categoryExists = await Category.exists({ _id: category });
    if (!categoryExists) {
      return res.status(400).json({ error: "Category does not exist" });
    }
  }

  const product = await Product.create({ name, price, category, inStock });
  await product.populate("category", "name");

  // Send the new product itself, so clients can add it without reloading
  const io = getIO();
  io.emit("product:created", plain(product));

  // A private message only for admins
  if (req.user.role !== "admin") {
    io.to("admins").emit("notification", {
      message: req.user.name + " added a product: " + product.name,
    });
  }

  res.status(201).json(product);
});

// UPDATE
app.put("/api/products/:id", protect, async (req, res) => {
  const { name, price, category, inStock } = req.body || {};

  const updates = {};
  if (name !== undefined) updates.name = name;
  if (price !== undefined) updates.price = price;
  if (inStock !== undefined) updates.inStock = inStock;
  if (category !== undefined) {
    const categoryExists = await Category.exists({ _id: category });
    if (!categoryExists) {
      return res.status(400).json({ error: "Category does not exist" });
    }
    updates.category = category;
  }

  const product = await Product.findByIdAndUpdate(req.params.id, updates, {
    new: true,
    runValidators: true,
  }).populate("category", "name");

  if (!product) {
    return res.status(404).json({ error: "Product not found" });
  }

  getIO().emit("product:updated", plain(product));

  res.status(200).json(product);
});

// DELETE
app.delete("/api/products/:id", protect, restrictTo("admin"), async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) {
    return res.status(404).json({ error: "Product not found" });
  }

  // For a delete, the id is all the clients need
  getIO().emit("product:deleted", { _id: String(product._id) });

  res.status(204).send();
});

// ---------- Errors ----------

app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

app.use((err, req, res, next) => {
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({ error: "Invalid JSON in request body" });
  }
  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ error: messages.join(", ") });
  }
  if (err.name === "CastError") {
    return res.status(400).json({ error: "Invalid id format" });
  }
  if (err.code === 11000) {
    return res.status(409).json({ error: "Duplicate value, that already exists" });
  }
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

// Connect to the database first, then start listening
connectDB().then(() => {
  const server = http.createServer(app);
  initSocket(server);

  server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
});