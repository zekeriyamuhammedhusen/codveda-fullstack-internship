const API_URL = "http://localhost:3000/api/products";

const productsEl = document.getElementById("products");
const form = document.getElementById("product-form");
const idInput = document.getElementById("product-id");
const nameInput = document.getElementById("name");
const priceInput = document.getElementById("price");
const categoryInput = document.getElementById("category");
const formTitle = document.getElementById("form-title");
const submitBtn = document.getElementById("submit-btn");
const cancelBtn = document.getElementById("cancel-btn");
const messageEl = document.getElementById("message");

function showMessage(text, type) {
  messageEl.textContent = text;
  messageEl.className = "message " + (type || "");
}

// READ: fetch all products and show them
async function loadProducts() {
  productsEl.textContent = "Loading...";
  try {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error("Server returned " + res.status);
    const products = await res.json();
    renderProducts(products);
  } catch (err) {
    productsEl.textContent = "Could not load products. Is the API running?";
    console.error(err);
  }
}

function renderProducts(products) {
  productsEl.textContent = "";

  if (products.length === 0) {
    productsEl.textContent = "No products yet. Add one above.";
    return;
  }

  products.forEach((product) => {
    const card = document.createElement("div");
    card.className = "product";

    const title = document.createElement("h3");
    title.textContent = product.name;

    const price = document.createElement("p");
    price.textContent = "Price: $" + product.price;

    const category = document.createElement("p");
    category.textContent = "Category: " + product.category;

    const actions = document.createElement("div");
    actions.className = "actions";

    const editBtn = document.createElement("button");
    editBtn.className = "edit";
    editBtn.textContent = "Edit";
    editBtn.addEventListener("click", () => startEdit(product));

    const deleteBtn = document.createElement("button");
    deleteBtn.className = "delete";
    deleteBtn.textContent = "Delete";
    deleteBtn.addEventListener("click", () => deleteProduct(product.id));

    actions.append(editBtn, deleteBtn);
    card.append(title, price, category, actions);
    productsEl.appendChild(card);
  });
}

// CREATE or UPDATE: depends on whether the hidden id field is filled
form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const id = idInput.value;
  const payload = {
    name: nameInput.value,
    price: Number(priceInput.value),
    category: categoryInput.value.trim() || undefined,
  };

  const url = id ? API_URL + "/" + id : API_URL;
  const method = id ? "PUT" : "POST";

  try {
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const data = await res.json();
      showMessage(data.error || "Something went wrong", "error");
      return;
    }

    showMessage(id ? "Product updated" : "Product added", "success");
    resetForm();
    loadProducts();
  } catch (err) {
    showMessage("Could not reach the API. Is it running?", "error");
    console.error(err);
  }
});

// Put a product's values into the form for editing
function startEdit(product) {
  idInput.value = product.id;
  nameInput.value = product.name;
  priceInput.value = product.price;
  categoryInput.value = product.category;
  formTitle.textContent = "Edit product";
  submitBtn.textContent = "Save changes";
  cancelBtn.hidden = false;
  showMessage("", "");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function resetForm() {
  form.reset();
  idInput.value = "";
  formTitle.textContent = "Add a product";
  submitBtn.textContent = "Add product";
  cancelBtn.hidden = true;
}

cancelBtn.addEventListener("click", () => {
  resetForm();
  showMessage("", "");
});

// DELETE
async function deleteProduct(id) {
  if (!confirm("Delete this product?")) return;

  try {
    const res = await fetch(API_URL + "/" + id, { method: "DELETE" });

    if (!res.ok) {
      const data = await res.json();
      showMessage(data.error || "Could not delete", "error");
      return;
    }

    showMessage("Product deleted", "success");
    loadProducts();
  } catch (err) {
    showMessage("Could not reach the API. Is it running?", "error");
    console.error(err);
  }
}

// Load the list when the page opens
loadProducts();