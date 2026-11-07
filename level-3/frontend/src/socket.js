import { io } from "socket.io-client";

const socket = io(import.meta.env.VITE_SOCKET_URL || "http://localhost:5000", {
  withCredentials: true,
  autoConnect: false,
});

socket.on("connect", () => console.log("socket connected", socket.id));
socket.on("connect_error", (err) => console.log("socket error:", err.message));
socket.on("disconnect", (reason) =>
  console.log("socket disconnected:", reason),
);
socket.onAny((event, data) => console.log("socket event:", event, data));

export default socket;
