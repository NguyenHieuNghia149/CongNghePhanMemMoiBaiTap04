const Product = require('../models/product');
const Fuse = require('fuse.js');

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
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = 1,
      limit = 10
    } = options;

    // Bước 1: Filter cơ bản bằng MongoDB (theo category/brand/price)
    const mongoFilter = {};
    if (category) mongoFilter.category = category;
    if (brand) mongoFilter.brand = brand;
    if (minPrice || maxPrice) {
      mongoFilter.price = {};
      if (minPrice !== undefined && minPrice !== null) mongoFilter.price.$gte = minPrice;
      if (maxPrice !== undefined && maxPrice !== null) mongoFilter.price.$lte = maxPrice;
    }

    // Bước 2: Lấy toàn bộ dữ liệu sau khi filter (dưới vài nghìn record vẫn ổn)
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const baseProducts = await Product.find(mongoFilter)
      .sort(sort)
      .lean(); // dùng lean() để tối ưu cho Fuse

    let finalProducts = baseProducts;

    // Bước 3: Nếu có search -> dùng Fuse.js để fuzzy search trên name/description/brand/category
    if (search && search.trim()) {
      const fuseOptions = {
        isCaseSensitive: false,
        includeScore: false,
        shouldSort: true,
        threshold: 0.3, // độ "mờ": 0 = khớp chính xác, 1 = rất mờ
        keys: ['name', 'description', 'brand', 'category'],
      };

      const fuse = new Fuse(baseProducts, fuseOptions);
      const results = fuse.search(search.trim());

      // Fuse trả về mảng dạng { item, refIndex, score? }
      finalProducts = results.map(r => r.item);
    }

    // Bước 4: Pagination phía backend trên mảng finalProducts
    const total = finalProducts.length;
    const start = (page - 1) * limit;
    const end = start + limit;
    const pagedProducts = finalProducts.slice(start, end);

    return {
      EC: 0,
      EM: 'Lấy danh sách sản phẩm thành công',
      data: pagedProducts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    console.log('Error getting products with Fuse.js:', error);
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

// Lấy danh sách category & brand duy nhất để phục vụ filter
const getProductFilters = async () => {
  try {
    
    // map to simpler arrays
    const categories = (await Product.distinct('category'))
    .map(c => c?.trim())
    .filter(Boolean);    
    const brands = (await Product.distinct('brand'))
    .map(b => b?.trim())
    .filter(Boolean);

    return {
      EC: 0,
      EM: 'Lấy danh sách bộ lọc sản phẩm thành công',
      data: {
        categories,
        brands,
      },
    };
  } catch (error) {
    console.log('Error getting product filters:', error);
    return {
      EC: 1,
      EM: 'Có lỗi xảy ra khi lấy bộ lọc sản phẩm',
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
  getProductFilters,
};

