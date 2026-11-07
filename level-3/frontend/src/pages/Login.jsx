import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);

    async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
        await login(email, password);
        navigate("/");
        } catch (err) {
        setError(err.response?.data?.error || "Could not reach the server");
        } finally {
        setSubmitting(false);
        }
    }

    return (
    <div className="card auth-card">
        <h2>Login</h2>
        <form onSubmit={handleSubmit}>
            <label>
            Email
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </label>
            <label>
            Password
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </label>
            <button type="submit" disabled={submitting}>
            {submitting ? "Logging in..." : "Login"}
            </button>
        </form>
        {error && <p className="message error">{error}</p>}
        <p>
        No account? <Link to="/signup">Sign up</Link>
        </p>
        </div>
    );
    }