const { createOrder } = require('../services/orderService');
const { getUserByEmail } = require('../services/userService');

// Checkout đơn giản: nhận danh sách items [{ productId, quantity }]
const createOrderController = async (req, res) => {
  try {
    const userEmail = req.user && req.user.email ? req.user.email : null;
    const { items } = req.body;

    if (!userEmail) {
      return res.status(401).json({
        EC: 1,
        EM: 'Bạn cần đăng nhập để đặt hàng',
        data: null,
      });
    }
    const user = await getUserByEmail(userEmail);
    const userId = user?._id || null;
    const result = await createOrder(userId, items);
    return res.status(result.EC === 0 ? 201 : 400).json(result);
  } catch (error) {
    console.log('Error in createOrderController:', error);
    return res.status(500).json({
      EC: 1,
      EM: 'Lỗi server khi tạo đơn hàng',
      data: null,
    });
  }
};

module.exports = {
  createOrderController,
};


