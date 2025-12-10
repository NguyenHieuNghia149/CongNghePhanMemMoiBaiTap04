const {
  getCartByUserId,
  addItemToCart,
  updateCartItem,
  removeItemFromCart,
  clearCart,
  toggleItemSelection,
  getSelectedItemsForCheckout,
} = require('../../services/cartService');
const User = require('../../models/user');


const getUserIdFromContext = (context) => {
  if (!context || !context.user || !context.user.email) {
    throw new Error('Bạn chưa đăng nhập');
  }
  // Tìm user theo email để lấy userId
  return context.user.email;
};

/**
 * Helper function để lấy userId (ObjectId) từ email
 */
const getUserIdObjectId = async (email) => {
  try {
    const user = await User.findOne({ email });
    if (!user) {
      throw new Error('User không tồn tại');
    }
    return user._id;
  } catch (error) {
    throw new Error('Không thể lấy thông tin user');
  }
};

const cartResolvers = {
  Query: {
    /**
     * Xem giỏ hàng
     */
    getCart: async (parent, args, context) => {
      try {
        const email = getUserIdFromContext(context);
        const userId = await getUserIdObjectId(email);
        const result = await getCartByUserId(userId);
        return result;
      } catch (error) {
        return {
          EC: 1,
          EM: error.message || 'Có lỗi xảy ra khi lấy giỏ hàng',
          data: null,
        };
      }
    },

    /**
     * Lấy danh sách sản phẩm đã chọn để thanh toán
     */
    getSelectedItemsForCheckout: async (parent, args, context) => {
      try {
        const email = getUserIdFromContext(context);
        const userId = await getUserIdObjectId(email);
        const result = await getSelectedItemsForCheckout(userId);
        return result;
      } catch (error) {
        return {
          EC: 1,
          EM: error.message || 'Có lỗi xảy ra khi lấy danh sách sản phẩm đã chọn',
          data: null,
        };
      }
    },
  },

  Mutation: {
    /**
     * Thêm sản phẩm vào giỏ hàng
     */
    addItemToCart: async (parent, { productId, quantity }, context) => {
      try {
        const email = getUserIdFromContext(context);
        const userId = await getUserIdObjectId(email);
        const result = await addItemToCart(userId, productId, quantity || 1);
        return result;
      } catch (error) {
        return {
          EC: 1,
          EM: error.message || 'Có lỗi xảy ra khi thêm sản phẩm vào giỏ hàng',
          data: null,
        };
      }
    },

    /**
     * Cập nhật sản phẩm trong giỏ hàng (số lượng hoặc trạng thái selected)
     */
    updateCartItem: async (parent, { itemId, quantity, selected }, context) => {
      try {
        const email = getUserIdFromContext(context);
        const userId = await getUserIdObjectId(email);
        const result = await updateCartItem(userId, itemId, quantity, selected);
        return result;
      } catch (error) {
        return {
          EC: 1,
          EM: error.message || 'Có lỗi xảy ra khi cập nhật giỏ hàng',
          data: null,
        };
      }
    },

    /**
     * Xóa một sản phẩm khỏi giỏ hàng
     */
    removeItemFromCart: async (parent, { itemId }, context) => {
      try {
        const email = getUserIdFromContext(context);
        const userId = await getUserIdObjectId(email);
        const result = await removeItemFromCart(userId, itemId);
        return result;
      } catch (error) {
        return {
          EC: 1,
          EM: error.message || 'Có lỗi xảy ra khi xóa sản phẩm khỏi giỏ hàng',
          data: null,
        };
      }
    },

    /**
     * Xóa toàn bộ giỏ hàng
     */
    clearCart: async (parent, args, context) => {
      try {
        const email = getUserIdFromContext(context);
        const userId = await getUserIdObjectId(email);
        const result = await clearCart(userId);
        return result;
      } catch (error) {
        return {
          EC: 1,
          EM: error.message || 'Có lỗi xảy ra khi xóa giỏ hàng',
          data: null,
        };
      }
    },

    /**
     * Chọn/bỏ chọn một hoặc nhiều sản phẩm để thanh toán
     */
    toggleItemSelection: async (parent, { itemIds, selected }, context) => {
      try {
        const email = getUserIdFromContext(context);
        const userId = await getUserIdObjectId(email);
        const result = await toggleItemSelection(userId, itemIds, selected);
        return result;
      } catch (error) {
        return {
          EC: 1,
          EM: error.message || 'Có lỗi xảy ra khi cập nhật trạng thái chọn sản phẩm',
          data: null,
        };
      }
    },
  },
};

module.exports = cartResolvers;

