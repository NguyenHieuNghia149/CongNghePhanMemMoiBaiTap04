const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: String,
    price: Number,
    description: String,
    image: String,
    category: String,
    brand: String,
    // Thống kê cơ bản cho trang chi tiết (chỉ giữ lượt xem, còn mua & comment dùng collection riêng)
    viewCount: { type: Number, default: 0 },       // số lượt xem
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

