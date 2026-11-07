    import { useEffect, useState } from "react";
    import api from "../api";
    import socket from "../socket";
    import { useAuth } from "../context/AuthContext";
    import ProductForm from "../components/ProductForm";
    import ProductCard from "../components/ProductCard";

    export default function Products() {
    const { user } = useAuth();
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [message, setMessage] = useState({ text: "", type: "" });
    const [editing, setEditing] = useState(null);
    const [newCategory, setNewCategory] = useState("");

    async function loadData() {
        try {
        const [productsRes, categoriesRes] = await Promise.all([
            api.get("/products"),
            api.get("/categories"),
        ]);
        setProducts(productsRes.data);
        setCategories(categoriesRes.data);
        setError("");
        } catch {
        setError("Could not load data. Is the API running?");
        } finally {
        setLoading(false);
        }
    }

    useEffect(() => {
    loadData();

        // Refresh the list whenever anyone adds, edits, or deletes a product
        function onChanged() {
        loadData();
        }
        socket.on("products:changed", onChanged);

        return () => socket.off("products:changed", onChanged);
    }, []);
    function showMessage(text, type) {
        setMessage({ text, type });
    }

    // Used by the form for both create and update. Errors go back to the form.
    async function handleSave(values) {
        if (editing) {
        await api.put("/products/" + editing._id, values);
        showMessage("Product updated", "success");
        setEditing(null);
        } else {
        await api.post("/products", values);
        showMessage("Product added", "success");
        }
        await loadData();
    }

    async function handleDelete(product) {
        if (!window.confirm("Delete " + product.name + "?")) return;
        try {
        await api.delete("/products/" + product._id);
        showMessage("Product deleted", "success");
        await loadData();
        } catch (err) {
        showMessage(err.response?.data?.error || "Could not delete", "error");
        }
    }

    async function handleAddCategory(e) {
        e.preventDefault();
        try {
        await api.post("/categories", { name: newCategory });
        setNewCategory("");
        showMessage("Category added", "success");
        await loadData();
        } catch (err) {
        showMessage(err.response?.data?.error || "Could not add category", "error");
        }
    }

    function handleEdit(product) {
        setEditing(product);
        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    if (loading) return <p className="center">Loading...</p>;
    if (error) return <p className="message error">{error}</p>;

    return (
        <div>
        <h2>Products</h2>

        <div className="card">
            <h3>{editing ? "Edit product" : "Add a product"}</h3>
            <ProductForm
            key={editing ? editing._id : "new"}
            categories={categories}
            editing={editing}
            onSave={handleSave}
            onCancel={() => setEditing(null)}
            />
        </div>

        <div className="card">
            <h3>Add a category</h3>
            <form className="inline-form" onSubmit={handleAddCategory}>
            <input
                type="text"
                placeholder="Category name"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                required
            />
            <button type="submit">Add</button>
            </form>
        </div>

        {message.text && <p className={"message " + message.type}>{message.text}</p>}

        <h3>All products ({products.length})</h3>
        {products.length === 0 ? (
            <p>No products yet. Add a category first, then add a product.</p>
        ) : (
            <div className="grid">
            {products.map((product) => (
                <ProductCard
                key={product._id}
                product={product}
                isAdmin={user.role === "admin"}
                onEdit={handleEdit}
                onDelete={handleDelete}
                />
            ))}
            </div>
        )}
        </div>
    );
    }