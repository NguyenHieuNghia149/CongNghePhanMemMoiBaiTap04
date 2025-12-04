const Cart = require('../models/cart');
const Product = require('../models/product');
const User = require('../models/user');

/**
 * Lấy giỏ hàng của user
 */
const getCartByUserId = async (userId) => {
  try {
    const cart = await Cart.findOne({ userId })
      .populate('items.productId', 'name price image description brand category')
      .lean();

    if (!cart) {
      // Tạo giỏ hàng mới nếu chưa có
      const newCart = new Cart({ userId, items: [] });
      await newCart.save();
      return {
        EC: 0,
        EM: 'Lấy giỏ hàng thành công',
        data: {
          _id: newCart._id,
          userId: newCart.userId,
          items: [],
          createdAt: newCart.createdAt,
          updatedAt: newCart.updatedAt,
        },
      };
    }

    return {
      EC: 0,
      EM: 'Lấy giỏ hàng thành công',
      data: cart,
    };
  } catch (error) {
    console.log('Error getting cart:', error);
    return {
      EC: 1,
      EM: 'Có lỗi xảy ra khi lấy giỏ hàng',
      data: null,
    };
  }
};

/**
 * Thêm sản phẩm vào giỏ hàng
 */
const addItemToCart = async (userId, productId, quantity = 1) => {
  try {
    // Kiểm tra sản phẩm có tồn tại không
    const product = await Product.findById(productId);
    if (!product) {
      return {
        EC: 1,
        EM: 'Sản phẩm không tồn tại',
        data: null,
      };
    }

    // Tìm hoặc tạo giỏ hàng
    let cart = await Cart.findOne({ userId });
    if (!cart) {
      cart = new Cart({ userId, items: [] });
    }

    // Kiểm tra sản phẩm đã có trong giỏ hàng chưa
    const existingItemIndex = cart.items.findIndex(
      (item) => item.productId.toString() === productId.toString()
    );

    if (existingItemIndex > -1) {
      // Nếu đã có, tăng số lượng
      cart.items[existingItemIndex].quantity += quantity;
    } else {
      // Nếu chưa có, thêm mới
      cart.items.push({
        productId,
        quantity,
        selected: true,
      });
    }

    cart.updatedAt = new Date();
    await cart.save();

    // Populate để trả về thông tin đầy đủ
    const updatedCart = await Cart.findById(cart._id)
      .populate('items.productId', 'name price image description brand category')
      .lean();

    return {
      EC: 0,
      EM: 'Thêm sản phẩm vào giỏ hàng thành công',
      data: updatedCart,
    };
  } catch (error) {
    console.log('Error adding item to cart:', error);
    return {
      EC: 1,
      EM: 'Có lỗi xảy ra khi thêm sản phẩm vào giỏ hàng',
      data: null,
    };
  }
};

/**
 * Cập nhật số lượng sản phẩm trong giỏ hàng
 */
const updateCartItem = async (userId, itemId, quantity, selected = null) => {
  try {
    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return {
        EC: 1,
        EM: 'Giỏ hàng không tồn tại',
        data: null,
      };
    }

    const itemIndex = cart.items.findIndex(
      (item) => item._id.toString() === itemId.toString()
    );

    if (itemIndex === -1) {
      return {
        EC: 1,
        EM: 'Sản phẩm không tồn tại trong giỏ hàng',
        data: null,
      };
    }

    // Cập nhật số lượng
    if (quantity !== undefined && quantity !== null) {
      if (quantity <= 0) {
        // Nếu số lượng <= 0, xóa item
        cart.items.splice(itemIndex, 1);
      } else {
        cart.items[itemIndex].quantity = quantity;
      }
    }

    // Cập nhật trạng thái selected
    if (selected !== null && selected !== undefined) {
      cart.items[itemIndex].selected = selected;
    }

    cart.updatedAt = new Date();
    await cart.save();

    // Populate để trả về thông tin đầy đủ
    const updatedCart = await Cart.findById(cart._id)
      .populate('items.productId', 'name price image description brand category')
      .lean();

    return {
      EC: 0,
      EM: 'Cập nhật giỏ hàng thành công',
      data: updatedCart,
    };
  } catch (error) {
    console.log('Error updating cart item:', error);
    return {
      EC: 1,
      EM: 'Có lỗi xảy ra khi cập nhật giỏ hàng',
      data: null,
    };
  }
};

/**
 * Xóa sản phẩm khỏi giỏ hàng
 */
const removeItemFromCart = async (userId, itemId) => {
  try {
    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return {
        EC: 1,
        EM: 'Giỏ hàng không tồn tại',
        data: null,
      };
    }

    const itemIndex = cart.items.findIndex(
      (item) => item._id.toString() === itemId.toString()
    );

    if (itemIndex === -1) {
      return {
        EC: 1,
        EM: 'Sản phẩm không tồn tại trong giỏ hàng',
        data: null,
      };
    }

    cart.items.splice(itemIndex, 1);
    cart.updatedAt = new Date();
    await cart.save();

    // Populate để trả về thông tin đầy đủ
    const updatedCart = await Cart.findById(cart._id)
      .populate('items.productId', 'name price image description brand category')
      .lean();

    return {
      EC: 0,
      EM: 'Xóa sản phẩm khỏi giỏ hàng thành công',
      data: updatedCart,
    };
  } catch (error) {
    console.log('Error removing item from cart:', error);
    return {
      EC: 1,
      EM: 'Có lỗi xảy ra khi xóa sản phẩm khỏi giỏ hàng',
      data: null,
    };
  }
};

/**
 * Xóa toàn bộ giỏ hàng
 */
const clearCart = async (userId) => {
  try {
    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return {
        EC: 1,
        EM: 'Giỏ hàng không tồn tại',
        data: null,
      };
    }

    cart.items = [];
    cart.updatedAt = new Date();
    await cart.save();

    return {
      EC: 0,
      EM: 'Xóa giỏ hàng thành công',
      data: {
        _id: cart._id,
        userId: cart.userId,
        items: [],
        createdAt: cart.createdAt,
        updatedAt: cart.updatedAt,
      },
    };
  } catch (error) {
    console.log('Error clearing cart:', error);
    return {
      EC: 1,
      EM: 'Có lỗi xảy ra khi xóa giỏ hàng',
      data: null,
    };
  }
};

/**
 * Chọn/bỏ chọn sản phẩm để thanh toán
 */
const toggleItemSelection = async (userId, itemIds, selected) => {
  try {
    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return {
        EC: 1,
        EM: 'Giỏ hàng không tồn tại',
        data: null,
      };
    }

    // Cập nhật trạng thái selected cho các item
    cart.items.forEach((item) => {
      if (itemIds.includes(item._id.toString())) {
        item.selected = selected;
      }
    });

    cart.updatedAt = new Date();
    await cart.save();

    // Populate để trả về thông tin đầy đủ
    const updatedCart = await Cart.findById(cart._id)
      .populate('items.productId', 'name price image description brand category')
      .lean();

    return {
      EC: 0,
      EM: selected ? 'Đã chọn sản phẩm để thanh toán' : 'Đã bỏ chọn sản phẩm',
      data: updatedCart,
    };
  } catch (error) {
    console.log('Error toggling item selection:', error);
    return {
      EC: 1,
      EM: 'Có lỗi xảy ra khi cập nhật trạng thái chọn sản phẩm',
      data: null,
    };
  }
};

/**
 * Lấy danh sách sản phẩm đã chọn để thanh toán
 */
const getSelectedItemsForCheckout = async (userId) => {
  try {
    const cart = await Cart.findOne({ userId })
      .populate('items.productId', 'name price image description brand category')
      .lean();

    if (!cart) {
      return {
        EC: 0,
        EM: 'Lấy danh sách sản phẩm đã chọn thành công',
        data: {
          items: [],
          totalAmount: 0,
        },
      };
    }

    // Lọc các item đã được chọn
    const selectedItems = cart.items.filter((item) => item.selected);

    // Tính tổng tiền
    const totalAmount = selectedItems.reduce((total, item) => {
      const price = item.productId?.price || 0;
      return total + price * item.quantity;
    }, 0);

    return {
      EC: 0,
      EM: 'Lấy danh sách sản phẩm đã chọn thành công',
      data: {
        items: selectedItems,
        totalAmount,
        cartId: cart._id,
      },
    };
  } catch (error) {
    console.log('Error getting selected items:', error);
    return {
      EC: 1,
      EM: 'Có lỗi xảy ra khi lấy danh sách sản phẩm đã chọn',
      data: null,
    };
  }
};

module.exports = {
  getCartByUserId,
  addItemToCart,
  updateCartItem,
  removeItemFromCart,
  clearCart,
  toggleItemSelection,
  getSelectedItemsForCheckout,
};

