    export default function ProductCard({ product, isAdmin, onEdit, onDelete }) {
    return (
        <div className="product">
        <h3>{product.name}</h3>
        <p className="price">${product.price}</p>
        <p>{product.category ? product.category.name : "No category"}</p>
        <span className={product.inStock ? "badge in" : "badge out"}>
            {product.inStock ? "In stock" : "Out of stock"}
        </span>

        <div className="product-actions">
            <button onClick={() => onEdit(product)}>Edit</button>
            {isAdmin && (
            <button className="danger" onClick={() => onDelete(product)}>
                Delete
            </button>
            )}
        </div>
        </div>
    );
    }