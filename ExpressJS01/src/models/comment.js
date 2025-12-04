const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    content: { type: String, required: true },
    rating: { type: Number, min: 1, max: 5 },
  },
  { timestamps: true }
);

commentSchema.index({ productId: 1, createdAt: -1 });

const Comment = mongoose.model('Comment', commentSchema);

module.exports = Comment;


