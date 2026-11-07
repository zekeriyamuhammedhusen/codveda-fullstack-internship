    const express = require("express");
    const jwt = require("jsonwebtoken");
    const User = require("../models/user");
    const { protect } = require("../middleware/auth");

    const router = express.Router();

    const cookieOptions = {
    httpOnly: true,
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 1000,
    };

    // Create a JWT, store it in an HTTP-only cookie, and reply with the user
    function sendToken(user, status, res) {
    const token = jwt.sign(
        { id: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || "1h" }
    );

    res.cookie("token", token, cookieOptions);
    res.status(status).json({
        user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
    }

    // SIGNUP (role is never read from the request, so everyone starts as "user")
    router.post("/signup", async (req, res) => {
    const { name, email, password } = req.body || {};
    const user = await User.create({ name, email, password });
    sendToken(user, 201, res);
    });

    // LOGIN
    router.post("/login", async (req, res) => {
    const { email, password } = req.body || {};

    if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required" });
    }

    const user = await User.findOne({ email: String(email).toLowerCase() }).select("+password");

    if (!user || !(await user.comparePassword(password))) {
        return res.status(401).json({ error: "Invalid email or password" });
    }

    sendToken(user, 200, res);
    });

    // LOGOUT
    router.post("/logout", (req, res) => {
    res.clearCookie("token", cookieOptions);
    res.status(200).json({ message: "Logged out" });
    });

    // WHO AM I (protected)
    router.get("/me", protect, (req, res) => {
    const { _id, name, email, role } = req.user;
    res.status(200).json({ id: _id, name, email, role });
    });

    module.exports = router;