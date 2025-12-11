const Product = require('../models/product');
const Fuse = require('fuse.js');
const { getPurchaseStatsByProductId } = require('./orderService');
const { countCommentsByProductId } = require('./commentService');

const createProduct = async (productData) => {
  try {
const { name, price, description, image, category, brand, stock } = productData;
    
    const product = new Product({
      name,
      price,
      description,
      image,
      category,
      brand,
      stock,
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

    // ============================================
    // BƯỚC 1: TẠO MONGODB FILTER
    // ============================================
    const mongoFilter = {};
    if (category) mongoFilter.category = category;
    if (brand) mongoFilter.brand = brand;
    if (minPrice || maxPrice) {
      mongoFilter.price = {};
      if (minPrice !== undefined && minPrice !== null) mongoFilter.price.$gte = minPrice;
      if (maxPrice !== undefined && maxPrice !== null) mongoFilter.price.$lte = maxPrice;
    }

    // ============================================
    // BƯỚC 2: TẠO SORT OBJECT
    // ============================================
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // ============================================
    // BƯỚC 3: XỬ LÝ SEARCH VÀ PAGINATION
    // ============================================
    let pagedProducts = [];
    let total = 0;

    if (search && search.trim()) {
      // CÓ SEARCH → Dùng Fuse.js để fuzzy search
      // Lưu ý: Fuse.js cần load hết data để search, chỉ phù hợp khi dataset < 5000
      // Với dataset lớn hơn, nên dùng MongoDB Text Search ($text)
      
      // Load toàn bộ sản phẩm sau khi filter để Fuse.js search
      const baseProducts = await Product.find(mongoFilter)
        .sort(sort)
        .lean();

      // Kiểm tra số lượng để cảnh báo nếu dataset quá lớn
      if (baseProducts.length > 5000) {
        console.warn(`Warning: Dataset lớn (${baseProducts.length} records). Nên dùng MongoDB Text Search thay vì Fuse.js để tối ưu hiệu năng.`);
      }

      // Fuzzy search với Fuse.js
      const fuseOptions = {
        isCaseSensitive: false,
        includeScore: false,
        shouldSort: true,
        threshold: 0.3, // độ "mờ": 0 = khớp chính xác, 1 = rất mờ
        keys: ['name', 'description', 'brand', 'category'],
      };

      const fuse = new Fuse(baseProducts, fuseOptions);
      const results = fuse.search(search.trim());
      const finalProducts = results.map(r => r.item);

      // Pagination trên kết quả sau khi search
      total = finalProducts.length;
      const start = (page - 1) * limit;
      const end = start + limit;
      pagedProducts = finalProducts.slice(start, end);
    } else {
      // KHÔNG CÓ SEARCH → Paginate trực tiếp trong MongoDB (TỐI ƯU)
      const skip = (page - 1) * limit;

      // Query song song: lấy data và count tổng số
      [pagedProducts, total] = await Promise.all([
        Product.find(mongoFilter)
          .sort(sort)
          .skip(skip)        // Bỏ qua N items đầu
          .limit(limit)      // Chỉ lấy limit items
          .lean(),
        Product.countDocuments(mongoFilter)  // Đếm tổng số để tính totalPages
      ]);
    }

    // ============================================
    // BƯỚC 4: TRẢ VỀ KẾT QUẢ
    // ============================================
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
    const { name, price, description, image, category, brand, stock } = updateData;
    
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
    if (stock !== undefined) product.stock = stock;
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

// Tăng số lượt xem của sản phẩm
const incrementProductView = async (productId) => {
  try {
    await Product.findByIdAndUpdate(
      productId,
      { $inc: { viewCount: 1 } },
      { new: true }
    );

    return {
      EC: 0,
      EM: 'Tăng lượt xem sản phẩm thành công',
      data: null,
    };
  } catch (error) {
    console.log('Error incrementing product view:', error);
    return {
      EC: 1,
      EM: 'Có lỗi xảy ra khi tăng lượt xem sản phẩm',
      data: null,
    };
  }
};

// Lấy thống kê cơ bản của sản phẩm
const getProductStats = async (productId) => {
  try {
    const product = await Product.findById(productId).select('viewCount').lean();

    if (!product) {
      return {
        EC: 1,
        EM: 'Không tìm thấy sản phẩm',
        data: null,
      };
    }

    // Đếm lượt mua & số khách mua
    const purchaseStats = await getPurchaseStatsByProductId(productId);

    // Đếm số bình luận
    const commentsCount = await countCommentsByProductId(productId);

    return {
      EC: 0,
      EM: 'Lấy thống kê sản phẩm thành công',
      data: {
        viewCount: product.viewCount || 0,
        buyersCount: purchaseStats.buyersCount || 0,
        purchasedQuantity: purchaseStats.totalQuantity || 0,
        commentCount: commentsCount || 0,
      },
    };
  } catch (error) {
    console.log('Error getting product stats:', error);
    return {
      EC: 1,
      EM: 'Có lỗi xảy ra khi lấy thống kê sản phẩm',
      data: null,
    };
  }
};

// Sản phẩm tương tự dựa trên category/brand
const getSimilarProducts = async (productId, limit = 6) => {
  try {
    const base = await Product.findById(productId).lean();
    if (!base) {
      return { EC: 1, EM: 'Không tìm thấy sản phẩm', data: null };
    }

    const filter = {
      _id: { $ne: productId },
      $or: [
        base.category ? { category: base.category } : null,
      ].filter(Boolean),
    };

    const products = await Product.find(filter).limit(limit).lean();

    return {
      EC: 0,
      EM: 'Lấy danh sách sản phẩm tương tự thành công',
      data: products,
    };
  } catch (error) {
    console.log('Error getting similar products:', error);
    return {
      EC: 1,
      EM: 'Có lỗi xảy ra khi lấy sản phẩm tương tự',
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
  incrementProductView,
  getProductStats,
  getSimilarProducts,
};

