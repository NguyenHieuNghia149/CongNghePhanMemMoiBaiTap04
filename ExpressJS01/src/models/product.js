const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: String,
    price: Number,
    description: String,
    image: String,
    category: String,
    brand: String,
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

// Tạo text index cho fuzzy search trên các trường name, description, brand, category
productSchema.index({ 
    name: 'text', 
    description: 'text', 
    brand: 'text', 
    category: 'text' 
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;

