const Favorite = require('../models/favorite');

const toggleFavorite = async (userId, productId) => {
  try {
    const existing = await Favorite.findOne({ userId, productId });
    if (existing) {
      await Favorite.deleteOne({ _id: existing._id });
      return { EC: 0, EM: 'Đã bỏ yêu thích sản phẩm', data: { isFavorite: false } };
    }

    const fav = await Favorite.create({ userId, productId });
    return { EC: 0, EM: 'Đã thêm vào yêu thích', data: { isFavorite: true, favoriteId: fav._id } };
  } catch (error) {
    console.log('Error toggling favorite:', error);
    return { EC: 1, EM: 'Có lỗi xảy ra khi cập nhật yêu thích', data: null };
  }
};

const getFavoritesByUser = async (userId) => {
  try {
    const favorites = await Favorite.find({ userId })
      .populate('productId')
      .lean();

    const products = favorites
      .map((f) => f.productId)
      .filter(Boolean);

    return {
      EC: 0,
      EM: 'Lấy danh sách sản phẩm yêu thích thành công',
      data: products,
    };
  } catch (error) {
    console.log('Error getting favorites:', error);
    return { EC: 1, EM: 'Có lỗi xảy ra khi lấy danh sách yêu thích', data: null };
  }
};

module.exports = {
  toggleFavorite,
  getFavoritesByUser,
};


