    const jwt = require("jsonwebtoken");
    const User = require("../models/user");

    // Only lets logged-in users through
    async function protect(req, res, next) {
    const token = req.cookies && req.cookies.token;
    if (!token) {
        return res.status(401).json({ error: "Not logged in" });
    }

    let decoded;
    try {
        decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
        return res.status(401).json({ error: "Invalid or expired token" });
    }

    const user = await User.findById(decoded.id);
    if (!user) {
        return res.status(401).json({ error: "User no longer exists" });
    }

    req.user = user;
    next();
    }

    // Only lets users with one of the given roles through (use after protect)
    function restrictTo(...roles) {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
        return res.status(403).json({ error: "You do not have permission to do this" });
        }
        next();
    };
    }

    module.exports = { protect, restrictTo };