const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  selected: {
    type: Boolean,
    default: true, // Mặc định được chọn để thanh toán
  },
}, { _id: true });

const cartSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users',
    required: true,
    unique: true, // Mỗi user chỉ có 1 giỏ hàng
  },
  items: [cartItemSchema],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true });

// Index để tìm kiếm nhanh theo userId
cartSchema.index({ userId: 1 });

const Cart = mongoose.model('Cart', cartSchema);

module.exports = Cart;

