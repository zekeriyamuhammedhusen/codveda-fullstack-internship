const express = require("express");

const app = express();
const PORT = process.env.PORT || 3000;

// Parse JSON request bodies
app.use(express.json());

// In-memory data (we'll replace this with MongoDB in Level 2)
let products = [
  { id: 1, name: "Laptop", price: 1200, category: "Electronics" },
  { id: 2, name: "Notebook", price: 5, category: "Stationery" },
];
let nextId = 3;

// Health check
app.get("/", (req, res) => {
  res.json({ message: "Products API is running" });
});

// READ all
app.get("/api/products", (req, res) => {
  res.status(200).json(products);
});

// READ one
app.get("/api/products/:id", (req, res) => {
  const product = products.find((p) => p.id === Number(req.params.id));
  if (!product) {
    return res.status(404).json({ error: "Product not found" });
  }
  res.status(200).json(product);
});

// CREATE
app.post("/api/products", (req, res) => {
  const { name, price, category } = req.body || {};

  if (typeof name !== "string" || name.trim() === "") {
    return res.status(400).json({ error: "name is required" });
  }
  if (typeof price !== "number" || price < 0) {
    return res.status(400).json({ error: "price must be a non-negative number" });
  }

  const product = { id: nextId++, name: name.trim(), price, category: category || "General" };
  products.push(product);
  res.status(201).json(product);
});

// UPDATE
app.put("/api/products/:id", (req, res) => {
  const product = products.find((p) => p.id === Number(req.params.id));
  if (!product) {
    return res.status(404).json({ error: "Product not found" });
  }

  const { name, price, category } = req.body || {};

  if (name !== undefined) {
    if (typeof name !== "string" || name.trim() === "") {
      return res.status(400).json({ error: "name must be a non-empty string" });
    }
    product.name = name.trim();
  }
  if (price !== undefined) {
    if (typeof price !== "number" || price < 0) {
      return res.status(400).json({ error: "price must be a non-negative number" });
    }
    product.price = price;
  }
  if (category !== undefined) {
    product.category = category;
  }

  res.status(200).json(product);
});

// DELETE
app.delete("/api/products/:id", (req, res) => {
  const index = products.findIndex((p) => p.id === Number(req.params.id));
  if (index === -1) {
    return res.status(404).json({ error: "Product not found" });
  }
  products.splice(index, 1);
  res.status(204).send();
});

// 404 for unknown routes
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Error handler (invalid JSON, unexpected errors)
app.use((err, req, res, next) => {
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({ error: "Invalid JSON in request body" });
  }
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
