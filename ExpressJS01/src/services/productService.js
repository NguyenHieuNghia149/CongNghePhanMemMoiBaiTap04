const Product = require('../models/product');


const createProduct = async (productData) => {
  try {
    const { name, price, description, image, category, brand } = productData;
    
    const product = new Product({
      name,
      price,
      description,
      image,
      category,
      brand,
    });

    const result = await product.save();
    return {
      EC: 0,
      EM: 'Tạo sản phẩm thành công',
      data: result,
    };
  } catch (error) {
    console.log('Error creating product:', error);
    return {
      EC: 1,
      EM: 'Có lỗi xảy ra khi tạo sản phẩm',
      data: null,
    };
  }
};


const getAllProducts = async (options = {}) => {
  try {
    const { 
      category, 
      brand, 
      minPrice, 
      maxPrice,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = 1,
      limit = 10
    } = options;

    // Xây dựng query filter
    const filter = {};
    if (category) filter.category = category;
    if (brand) filter.brand = brand;
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = minPrice;
      if (maxPrice) filter.price.$lte = maxPrice;
    }

    // Tính toán pagination
    const skip = (page - 1) * limit;
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const products = await Product.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const total = await Product.countDocuments(filter);

    return {
      EC: 0,
      EM: 'Lấy danh sách sản phẩm thành công',
      data: products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    console.log('Error getting products:', error);
    return {
      EC: 1,
      EM: 'Có lỗi xảy ra khi lấy danh sách sản phẩm',
      data: null,
    };
  }
};


const getProductById = async (productId) => {
  try {
    const product = await Product.findById(productId);
    
    if (!product) {
      return {
        EC: 1,
        EM: 'Không tìm thấy sản phẩm',
        data: null,
      };
    }

    return {
      EC: 0,
      EM: 'Lấy sản phẩm thành công',
      data: product,
    };
  } catch (error) {
    console.log('Error getting product by ID:', error);
    return {
      EC: 1,
      EM: 'Có lỗi xảy ra khi lấy sản phẩm',
      data: null,
    };
  }
};

const updateProduct = async (productId, updateData) => {
  try {
    const { name, price, description, image, category, brand } = updateData;
    
    const product = await Product.findById(productId);
    
    if (!product) {
      return {
        EC: 1,
        EM: 'Không tìm thấy sản phẩm',
        data: null,
      };
    }

    // Cập nhật các trường
    if (name) product.name = name;
    if (price !== undefined) product.price = price;
    if (description) product.description = description;
    if (image) product.image = image;
    if (category) product.category = category;
    if (brand) product.brand = brand;
    product.updatedAt = new Date();

    const result = await product.save();

    return {
      EC: 0,
      EM: 'Cập nhật sản phẩm thành công',
      data: result,
    };
  } catch (error) {
    console.log('Error updating product:', error);
    return {
      EC: 1,
      EM: 'Có lỗi xảy ra khi cập nhật sản phẩm',
      data: null,
    };
  }
};

const deleteProduct = async (productId) => {
  try {
    const product = await Product.findByIdAndDelete(productId);
    
    if (!product) {
      return {
        EC: 1,
        EM: 'Không tìm thấy sản phẩm',
        data: null,
      };
    }

    return {
      EC: 0,
      EM: 'Xóa sản phẩm thành công',
      data: product,
    };
  } catch (error) {
    console.log('Error deleting product:', error);
    return {
      EC: 1,
      EM: 'Có lỗi xảy ra khi xóa sản phẩm',
      data: null,
    };
  }
};

module.exports = {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
};

