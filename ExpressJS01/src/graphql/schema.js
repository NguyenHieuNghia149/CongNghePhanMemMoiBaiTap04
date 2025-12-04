const {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLNonNull,
  GraphQLID,
  GraphQLInt,
  GraphQLBoolean,
  GraphQLList,
} = require('graphql');
const cartResolvers = require('./resolvers/cartResolvers');
const {
  CartResponseType,
  CheckoutResponseType,
} = require('./types/cartTypes');

// Query Type
const RootQueryType = new GraphQLObjectType({
  name: 'Query',
  description: 'Root Query',
  fields: () => ({
    // Xem giỏ hàng
    getCart: {
      type: CartResponseType,
      description: 'Lấy giỏ hàng của user hiện tại',
      resolve: cartResolvers.Query.getCart,
    },

    // Lấy danh sách sản phẩm đã chọn để thanh toán
    getSelectedItemsForCheckout: {
      type: CheckoutResponseType,
      description: 'Lấy danh sách sản phẩm đã chọn để thanh toán',
      resolve: cartResolvers.Query.getSelectedItemsForCheckout,
    },
  }),
});

// Mutation Type
const RootMutationType = new GraphQLObjectType({
  name: 'Mutation',
  description: 'Root Mutation',
  fields: () => ({
    // Thêm sản phẩm vào giỏ hàng
    addItemToCart: {
      type: CartResponseType,
      description: 'Thêm sản phẩm vào giỏ hàng',
      args: {
        productId: {
          type: GraphQLNonNull(GraphQLID),
          description: 'ID của sản phẩm',
        },
        quantity: {
          type: GraphQLInt,
          description: 'Số lượng (mặc định: 1)',
          defaultValue: 1,
        },
      },
      resolve: cartResolvers.Mutation.addItemToCart,
    },

    // Cập nhật sản phẩm trong giỏ hàng
    updateCartItem: {
      type: CartResponseType,
      description: 'Cập nhật sản phẩm trong giỏ hàng (số lượng hoặc trạng thái selected)',
      args: {
        itemId: {
          type: GraphQLNonNull(GraphQLID),
          description: 'ID của cart item',
        },
        quantity: {
          type: GraphQLInt,
          description: 'Số lượng mới (nếu không truyền thì giữ nguyên)',
        },
        selected: {
          type: GraphQLBoolean,
          description: 'Trạng thái selected (nếu không truyền thì giữ nguyên)',
        },
      },
      resolve: cartResolvers.Mutation.updateCartItem,
    },

    // Xóa một sản phẩm khỏi giỏ hàng
    removeItemFromCart: {
      type: CartResponseType,
      description: 'Xóa một sản phẩm khỏi giỏ hàng',
      args: {
        itemId: {
          type: GraphQLNonNull(GraphQLID),
          description: 'ID của cart item cần xóa',
        },
      },
      resolve: cartResolvers.Mutation.removeItemFromCart,
    },

    // Xóa toàn bộ giỏ hàng
    clearCart: {
      type: CartResponseType,
      description: 'Xóa toàn bộ giỏ hàng',
      resolve: cartResolvers.Mutation.clearCart,
    },

    // Chọn/bỏ chọn sản phẩm để thanh toán
    toggleItemSelection: {
      type: CartResponseType,
      description: 'Chọn hoặc bỏ chọn một hoặc nhiều sản phẩm để thanh toán',
      args: {
        itemIds: {
          type: GraphQLNonNull(GraphQLList(GraphQLID)),
          description: 'Danh sách ID của các cart item',
        },
        selected: {
          type: GraphQLNonNull(GraphQLBoolean),
          description: 'true = chọn, false = bỏ chọn',
        },
      },
      resolve: cartResolvers.Mutation.toggleItemSelection,
    },
  }),
});

// Tạo GraphQL Schema
const schema = new GraphQLSchema({
  query: RootQueryType,
  mutation: RootMutationType,
});

module.exports = schema;

