    import { NavLink, Link, useNavigate } from "react-router-dom";
    import { useAuth } from "../context/AuthContext";

    export default function Sidebar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    async function handleLogout() {
        await logout();
        navigate("/login");
    }

    return (
        <aside className="sidebar">
        <Link to="/" className="brand">Products Manager</Link>

        <nav className="sidebar-links">
            <NavLink to="/" end>Products</NavLink>
        </nav>

        <div className="sidebar-footer">
            <p className="sidebar-user">
            {user.name}
            <span>{user.role}</span>
            </p>
            <button onClick={handleLogout}>Logout</button>
        </div>
        </aside>
    );
    }