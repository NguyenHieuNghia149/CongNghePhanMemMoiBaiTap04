const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema(
  {
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true },
    items: [orderItemSchema],
    status: { type: String, default: 'completed' }, // đơn demo: luôn completed
  },
  { timestamps: true }
);

orderSchema.index({ 'items.productId': 1 });

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;


