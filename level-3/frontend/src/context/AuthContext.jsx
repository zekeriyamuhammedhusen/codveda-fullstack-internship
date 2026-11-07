    import { createContext, useContext, useEffect, useState } from "react";
    import api from "../api";

    const AuthContext = createContext(null);

    export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // On page load, ask the server whether we are already logged in
    useEffect(() => {
        api
        .get("/auth/me")
        .then((res) => setUser(res.data))
        .catch(() => setUser(null))
        .finally(() => setLoading(false));
    }, []);

    async function signup(name, email, password) {
        const res = await api.post("/auth/signup", { name, email, password });
        setUser(res.data.user);
    }

    async function login(email, password) {
        const res = await api.post("/auth/login", { email, password });
        setUser(res.data.user);
    }

    async function logout() {
        await api.post("/auth/logout");
        setUser(null);
    }

    return (
        <AuthContext.Provider value={{ user, loading, signup, login, logout }}>
        {children}
        </AuthContext.Provider>
    );
    }

    export function useAuth() {
    return useContext(AuthContext);
    }