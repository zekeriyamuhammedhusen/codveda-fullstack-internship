    import { useState } from "react";
    import { Link, useNavigate } from "react-router-dom";
    import { useAuth } from "../context/AuthContext";

    export default function Signup() {
    const { signup } = useAuth();
    const navigate = useNavigate();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);

    async function handleSubmit(e) {
        e.preventDefault();
        setError("");
        setSubmitting(true);
        try {
        await signup(name, email, password);
        navigate("/");
        } catch (err) {
        setError(err.response?.data?.error || "Could not reach the server");
        } finally {
        setSubmitting(false);
        }
    }

    return (
        <div className="card auth-card">
        <h2>Sign up</h2>
        <form onSubmit={handleSubmit}>
            <label>
            Name
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
            </label>
            <label>
            Email
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </label>
            <label>
            Password
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </label>
            <button type="submit" disabled={submitting}>
            {submitting ? "Creating account..." : "Create account"}
            </button>
        </form>
        {error && <p className="message error">{error}</p>}
        <p>
            Already have an account? <Link to="/login">Login</Link>
        </p>
        </div>
    );
    }