    import { useEffect, useState } from "react";
    import { Outlet } from "react-router-dom";
    import Sidebar from "./Sidebar";
    import socket from "../socket";

    export default function Layout() {
    const [toasts, setToasts] = useState([]);

    useEffect(() => {
        function onNotification(data) {
        const id = Date.now() + Math.random();
        setToasts((prev) => [...prev, { id, message: data.message }]);
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 5000);
        }

        socket.on("notification", onNotification);
        socket.connect();

        return () => {
        socket.off("notification", onNotification);
        socket.disconnect();
        };
    }, []);

    return (
        <div className="layout">
        <Sidebar />
        <main className="content">
            <div className="container">
            <Outlet />
            </div>
        </main>

        <div className="toasts">
            {toasts.map((t) => (
            <div key={t.id} className="toast">
                {t.message}
            </div>
            ))}
        </div>
        </div>
    );
    }