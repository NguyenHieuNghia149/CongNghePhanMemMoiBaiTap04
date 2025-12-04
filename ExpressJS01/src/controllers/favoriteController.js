const User = require('../models/user');
const { toggleFavorite, getFavoritesByUser } = require('../services/favoriteService');

const getCurrentUserId = async (req) => {
  const email = req.user?.email;
  if (!email) return null;
  const user = await User.findOne({ email }).select('_id');
  return user ? user._id : null;
};

const toggleFavoriteController = async (req, res) => {
  try {
    const userId = await getCurrentUserId(req);
    if (!userId) {
      return res.status(401).json({ EC: 1, EM: 'Bạn cần đăng nhập để sử dụng chức năng yêu thích', data: null });
    }

    const { id } = req.params; // productId
    const result = await toggleFavorite(userId, id);
    return res.status(result.EC === 0 ? 200 : 400).json(result);
  } catch (error) {
    console.log('Error in toggleFavoriteController:', error);
    return res.status(500).json({
      EC: 1,
      EM: 'Lỗi server khi cập nhật yêu thích',
      data: null,
    });
  }
};

const getFavoriteProductsController = async (req, res) => {
  try {
    const userId = await getCurrentUserId(req);
    if (!userId) {
      return res.status(401).json({ EC: 1, EM: 'Bạn cần đăng nhập để xem sản phẩm yêu thích', data: null });
    }

    const result = await getFavoritesByUser(userId);
    return res.status(result.EC === 0 ? 200 : 400).json(result);
  } catch (error) {
    console.log('Error in getFavoriteProductsController:', error);
    return res.status(500).json({
      EC: 1,
      EM: 'Lỗi server khi lấy sản phẩm yêu thích',
      data: null,
    });
  }
};

module.exports = {
  toggleFavoriteController,
  getFavoriteProductsController,
};


