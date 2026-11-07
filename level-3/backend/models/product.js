    const mongoose = require("mongoose");

    const productSchema = new mongoose.Schema(
    {
        name: {
        type: String,
        required: [true, "Product name is required"],
        trim: true,
        minlength: [2, "Product name must be at least 2 characters"],
        maxlength: [100, "Product name must be at most 100 characters"],
        },
        price: {
        type: Number,
        required: [true, "Price is required"],
        min: [0, "Price cannot be negative"],
        },
        category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
        required: [true, "Category is required"],
        },
        inStock: {
        type: Boolean,
        default: true,
        },
    },
    { timestamps: true }
    );

    // Indexes to speed up common queries
    productSchema.index({ category: 1, price: 1 });
    productSchema.index({ name: "text" });

    module.exports = mongoose.model("Product", productSchema);