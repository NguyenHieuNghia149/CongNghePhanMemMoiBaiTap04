const mongoose = require('mongoose');

const favoriteSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  },
  { timestamps: true }
);

favoriteSchema.index({ userId: 1, productId: 1 }, { unique: true });

const Favorite = mongoose.model('Favorite', favoriteSchema);

module.exports = Favorite;


