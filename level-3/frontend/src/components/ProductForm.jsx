    import { useState } from "react";

    export default function ProductForm({ categories, editing, onSave, onCancel }) {
    const [name, setName] = useState(editing ? editing.name : "");
    const [price, setPrice] = useState(editing ? editing.price : "");
    const [category, setCategory] = useState(editing && editing.category ? editing.category._id : "");
    const [inStock, setInStock] = useState(editing ? editing.inStock : true);
    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);

    async function handleSubmit(e) {
        e.preventDefault();
        setError("");
        setSubmitting(true);
        try {
        await onSave({ name, price: Number(price), category, inStock });
        if (!editing) {
            setName("");
            setPrice("");
            setInStock(true);
        }
        } catch (err) {
        setError(err.response?.data?.error || "Could not reach the server");
        } finally {
        setSubmitting(false);
        }
    }

    return (
        <form onSubmit={handleSubmit}>
        <label>
            Name
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
        </label>
        <label>
            Price
            <input
            type="number"
            min="0"
            step="0.01"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
            />
        </label>
        <label>
            Category
            <select value={category} onChange={(e) => setCategory(e.target.value)} required>
            <option value="">Choose a category</option>
            {categories.map((c) => (
                <option key={c._id} value={c._id}>
                {c.name}
                </option>
            ))}
            </select>
        </label>
        <label className="checkbox">
            <input type="checkbox" checked={inStock} onChange={(e) => setInStock(e.target.checked)} />
            In stock
        </label>

        <div className="buttons">
            <button type="submit" disabled={submitting}>
            {submitting ? "Saving..." : editing ? "Save changes" : "Add product"}
            </button>
            {editing && (
            <button type="button" className="secondary" onClick={onCancel}>
                Cancel
            </button>
            )}
        </div>
        {error && <p className="message error">{error}</p>}
        </form>
    );
    }