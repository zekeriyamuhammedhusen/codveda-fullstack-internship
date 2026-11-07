    import { useEffect, useState } from "react";
    import api from "../api";
    import socket from "../socket";
    import { useAuth } from "../context/AuthContext";
    import ProductForm from "../components/ProductForm";
    import ProductCard from "../components/ProductCard";

    // Small helpers that change one item in a list. They are safe to run twice,
    // which matters because the person who made a change also receives the event.
    function addProduct(list, product) {
    if (list.some((p) => p._id === product._id)) return list;
    return [product, ...list];
    }

    function replaceProduct(list, product) {
    return list.map((p) => (p._id === product._id ? product : p));
    }

    function removeProduct(list, id) {
    return list.filter((p) => p._id !== id);
    }

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

    async function loadCategories() {
        try {
        const res = await api.get("/categories");
        setCategories(res.data);
        } catch {
        // keep the current list if this fails
        }
    }

    useEffect(() => {
        loadData();

        // Each event changes just one item in the list
        function onCreated(product) {
        setProducts((prev) => addProduct(prev, product));
        }
        function onUpdated(product) {
        setProducts((prev) => replaceProduct(prev, product));
        }
        function onDeleted(data) {
        setProducts((prev) => removeProduct(prev, data._id));
        setEditing((current) => (current && current._id === data._id ? null : current));
        }

        socket.on("product:created", onCreated);
        socket.on("product:updated", onUpdated);
        socket.on("product:deleted", onDeleted);
        socket.on("categories:changed", loadCategories);

        // After a dropped connection comes back, reload once to catch missed events
        socket.io.on("reconnect", loadData);

        return () => {
        socket.off("product:created", onCreated);
        socket.off("product:updated", onUpdated);
        socket.off("product:deleted", onDeleted);
        socket.off("categories:changed", loadCategories);
        socket.io.off("reconnect", loadData);
        };
    }, []);

    function showMessage(text, type) {
        setMessage({ text, type });
    }

    // Used by the form for both create and update. Errors go back to the form.
    async function handleSave(values) {
        if (editing) {
        const res = await api.put("/products/" + editing._id, values);
        setProducts((prev) => replaceProduct(prev, res.data));
        showMessage("Product updated", "success");
        setEditing(null);
        } else {
        const res = await api.post("/products", values);
        setProducts((prev) => addProduct(prev, res.data));
        showMessage("Product added", "success");
        }
    }

    async function handleDelete(product) {
        if (!window.confirm("Delete " + product.name + "?")) return;
        try {
        await api.delete("/products/" + product._id);
        setProducts((prev) => removeProduct(prev, product._id));
        showMessage("Product deleted", "success");
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
        await loadCategories();
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