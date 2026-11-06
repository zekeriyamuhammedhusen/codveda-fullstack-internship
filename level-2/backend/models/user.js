    const mongoose = require("mongoose");
    const bcrypt = require("bcryptjs");

    const userSchema = new mongoose.Schema(
    {
        name: {
        type: String,
        required: [true, "Name is required"],
        trim: true,
        minlength: [2, "Name must be at least 2 characters"],
        },
        email: {
        type: String,
        required: [true, "Email is required"],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, "Email is not valid"],
        },
        password: {
        type: String,
        required: [true, "Password is required"],
        minlength: [6, "Password must be at least 6 characters"],
        select: false,
        },
        role: {
        type: String,
        enum: ["user", "admin"],
        default: "user",
        },
    },
    { timestamps: true }
    );

    // Hash the password before saving, only when it was set or changed
    userSchema.pre("save", async function () {
    if (!this.isModified("password")) return;
    this.password = await bcrypt.hash(this.password, 10);
    });

    // Compare a login attempt with the stored hash
    userSchema.methods.comparePassword = function (plainPassword) {
    return bcrypt.compare(plainPassword, this.password);
    };

    module.exports = mongoose.model("User", userSchema);