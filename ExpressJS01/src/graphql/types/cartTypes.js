const { GraphQLObjectType, GraphQLString, GraphQLInt, GraphQLFloat, GraphQLBoolean, GraphQLList, GraphQLID, GraphQLNonNull } = require('graphql');
const ProductType = require('./productTypes');

// CartItem Type
const CartItemType = new GraphQLObjectType({
  name: 'CartItem',
  description: 'Một sản phẩm trong giỏ hàng',
  fields: () => ({
    _id: {
      type: GraphQLID,
      description: 'ID của cart item',
    },
    productId: {
      type: ProductType,
      description: 'Thông tin sản phẩm',
    },
    quantity: {
      type: GraphQLInt,
      description: 'Số lượng sản phẩm',
    },
    selected: {
      type: GraphQLBoolean,
      description: 'Có được chọn để thanh toán không',
    },
  }),
});

// Cart Type
const CartType = new GraphQLObjectType({
  name: 'Cart',
  description: 'Giỏ hàng của user',
  fields: () => ({
    _id: {
      type: GraphQLID,
      description: 'ID của giỏ hàng',
    },
    userId: {
      type: GraphQLID,
      description: 'ID của user sở hữu giỏ hàng',
    },
    items: {
      type: new GraphQLList(CartItemType),
      description: 'Danh sách sản phẩm trong giỏ hàng',
    },
    createdAt: {
      type: GraphQLString,
      description: 'Ngày tạo',
    },
    updatedAt: {
      type: GraphQLString,
      description: 'Ngày cập nhật',
    },
  }),
});

// Checkout Items Type
const CheckoutItemsType = new GraphQLObjectType({
  name: 'CheckoutItems',
  description: 'Danh sách sản phẩm đã chọn để thanh toán',
  fields: () => ({
    items: {
      type: new GraphQLList(CartItemType),
      description: 'Danh sách sản phẩm đã chọn',
    },
    totalAmount: {
      type: GraphQLFloat,
      description: 'Tổng tiền cần thanh toán',
    },
    cartId: {
      type: GraphQLID,
      description: 'ID của giỏ hàng',
    },
  }),
});

// Response Type
const CartResponseType = new GraphQLObjectType({
  name: 'CartResponse',
  description: 'Response cho các operations của giỏ hàng',
  fields: () => ({
    EC: {
      type: GraphQLInt,
      description: 'Error Code: 0 = thành công, khác 0 = lỗi',
    },
    EM: {
      type: GraphQLString,
      description: 'Error Message',
    },
    data: {
      type: CartType,
      description: 'Dữ liệu giỏ hàng',
    },
  }),
});

const CheckoutResponseType = new GraphQLObjectType({
  name: 'CheckoutResponse',
  description: 'Response cho checkout',
  fields: () => ({
    EC: {
      type: GraphQLInt,
      description: 'Error Code: 0 = thành công, khác 0 = lỗi',
    },
    EM: {
      type: GraphQLString,
      description: 'Error Message',
    },
    data: {
      type: CheckoutItemsType,
      description: 'Dữ liệu sản phẩm đã chọn để thanh toán',
    },
  }),
});

module.exports = {
  CartType,
  CartItemType,
  CheckoutItemsType,
  CartResponseType,
  CheckoutResponseType,
};

