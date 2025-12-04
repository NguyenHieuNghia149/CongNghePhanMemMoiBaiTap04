const Order = require('../models/order');
const mongoose = require('mongoose');

// Tạo đơn hàng đơn giản từ danh sách items [{ productId, quantity }]
const createOrder = async (userId, items) => {
  try {
    if (!Array.isArray(items) || items.length === 0) {
      return {
        EC: 1,
        EM: 'Danh sách sản phẩm không hợp lệ',
        data: null,
      };
    }

    const order = await Order.create({
      userId,
      items: items.map((it) => ({
        productId: it.productId,
        quantity: it.quantity || 1,
      })),
      status: 'completed',
    });

    return {
      EC: 0,
      EM: 'Tạo đơn hàng thành công',
      data: order,
    };
  } catch (error) {
    console.log('Error creating order:', error);
    return {
      EC: 1,
      EM: 'Có lỗi xảy ra khi tạo đơn hàng',
      data: null,
    };
  }
};

// Đếm số khách (user) đã mua & tổng số lượng đã bán của 1 sản phẩm
const getPurchaseStatsByProductId = async (productId) => {
  try {
    const result = await Order.aggregate([
      { $unwind: '$items' },
      {
        $match: {
          'items.productId': new mongoose.Types.ObjectId(productId),
        },
      },
      {
        $group: {
          _id: null,
          buyerIds: { $addToSet: '$userId' },
          totalQuantity: { $sum: '$items.quantity' },
        },
      },
    ]);

    if (!result || result.length === 0) {
      return { buyersCount: 0, totalQuantity: 0 };
    }

    const { buyerIds, totalQuantity } = result[0];
    return {
      buyersCount: (buyerIds || []).length,
      totalQuantity: totalQuantity || 0,
    };
  } catch (error) {
    console.log('Error getting purchase stats:', error);
    return { buyersCount: 0, totalQuantity: 0 };
  }
};

module.exports = {
  createOrder,
  getPurchaseStatsByProductId,
};


