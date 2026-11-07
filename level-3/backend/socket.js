const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const User = require("./models/user");

let io;

// Turn a cookie header like "a=1; token=xyz" into { a: "1", token: "xyz" }
function parseCookies(header) {
  const result = {};
  if (!header) return result;

  header.split(";").forEach((part) => {
    const index = part.indexOf("=");
    if (index === -1) return;
    const key = part.slice(0, index).trim();
    const value = part.slice(index + 1).trim();
    try {
      result[key] = decodeURIComponent(value);
    } catch {
      result[key] = value;
    }
  });

  return result;
}

function initSocket(httpServer) {
  io = new Server(httpServer, {
    cors: { origin: process.env.CLIENT_URL, credentials: true },
  });

  // Runs once for every connection attempt: only logged-in users get through
  io.use(async (socket, next) => {
    try {
      const cookies = parseCookies(socket.handshake.headers.cookie);
      if (!cookies.token) {
        return next(new Error("Not logged in"));
      }

      const decoded = jwt.verify(cookies.token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);
      if (!user) {
        return next(new Error("User no longer exists"));
      }

      socket.user = user;
      next();
    } catch (err) {
      console.log("Socket auth failed:", err.name, "-", err.message);
      next(new Error("Invalid or expired token"));
    }
  });

  io.on("connection", (socket) => {
    const user = socket.user;

    // Private room for this user, and a shared room for all admins
    socket.join("user:" + user._id);
    if (user.role === "admin") {
      socket.join("admins");
    }

    console.log("Socket connected: " + user.name + " (" + socket.id + ")");

    socket.on("disconnect", () => {
      console.log("Socket disconnected: " + user.name);
    });
  });

  return io;
}

function getIO() {
  if (!io) {
    throw new Error("Socket.io is not initialised");
  }
  return io;
}

module.exports = { initSocket, getIO };
