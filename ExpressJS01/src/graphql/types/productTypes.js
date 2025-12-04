const { GraphQLObjectType, GraphQLString, GraphQLInt, GraphQLFloat, GraphQLID } = require('graphql');

const ProductType = new GraphQLObjectType({
  name: 'Product',
  description: 'Thông tin sản phẩm',
  fields: () => ({
    _id: {
      type: GraphQLID,
      description: 'ID của sản phẩm',
    },
    name: {
      type: GraphQLString,
      description: 'Tên sản phẩm',
    },
    price: {
      type: GraphQLFloat,
      description: 'Giá sản phẩm',
    },
    description: {
      type: GraphQLString,
      description: 'Mô tả sản phẩm',
    },
    image: {
      type: GraphQLString,
      description: 'URL hình ảnh',
    },
    category: {
      type: GraphQLString,
      description: 'Danh mục',
    },
    brand: {
      type: GraphQLString,
      description: 'Thương hiệu',
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

module.exports = ProductType;

