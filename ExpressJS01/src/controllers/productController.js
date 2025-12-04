const {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getProductFilters,
  incrementProductView,
  getProductStats,
  getSimilarProducts,
} = require('../services/productService');


const createProductController = async (req, res) => {
  try {
    const productData = req.body;
    const result = await createProduct(productData);

    if (result.EC === 0) {
      return res.status(201).json(result);
    } else {
      return res.status(400).json(result);
    }
  } catch (error) {
    console.log('Error in createProductController:', error);
    return res.status(500).json({
      EC: 1,
      EM: 'Lỗi server khi tạo sản phẩm',
      data: null,
    });
  }
};


const getAllProductsController = async (req, res) => {
  try {
    const options = {
      category: req.query.category,
      brand: req.query.brand,
      minPrice: req.query.minPrice ? parseFloat(req.query.minPrice) : undefined,
      maxPrice: req.query.maxPrice ? parseFloat(req.query.maxPrice) : undefined,
      search: req.query.search,
      sortBy: req.query.sortBy || 'createdAt',
      sortOrder: req.query.sortOrder || 'desc',
      page: req.query.page ? parseInt(req.query.page) : 1,
      limit: req.query.limit ? parseInt(req.query.limit) : 10,
    };

    const result = await getAllProducts(options);
    
    if (result.EC === 0) {
      return res.status(200).json(result);
    } else {
      return res.status(400).json(result);
    }
  } catch (error) {
    console.log('Error in getAllProductsController:', error);
    return res.status(500).json({
      EC: 1,
      EM: 'Lỗi server khi lấy danh sách sản phẩm',
      data: null,
    });
  }
};


const getProductByIdController = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await getProductById(id);

    if (result.EC === 0) {
      return res.status(200).json(result);
    } else {
      return res.status(404).json(result);
    }
  } catch (error) {
    console.log('Error in getProductByIdController:', error);
    return res.status(500).json({
      EC: 1,
      EM: 'Lỗi server khi lấy sản phẩm',
      data: null,
    });
  }
};


const updateProductController = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const result = await updateProduct(id, updateData);

    if (result.EC === 0) {
      return res.status(200).json(result);
    } else {
      return res.status(400).json(result);
    }
  } catch (error) {
    console.log('Error in updateProductController:', error);
    return res.status(500).json({
      EC: 1,
      EM: 'Lỗi server khi cập nhật sản phẩm',
      data: null,
    });
  }
};


const deleteProductController = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await deleteProduct(id);

    if (result.EC === 0) {
      return res.status(200).json(result);
    } else {
      return res.status(404).json(result);
    }
  } catch (error) {
    console.log('Error in deleteProductController:', error);
    return res.status(500).json({
      EC: 1,
      EM: 'Lỗi server khi xóa sản phẩm',
      data: null,
    });
  }
};

const getProductFiltersController = async (req, res) => {
  try {
    const result = await getProductFilters();

    if (result.EC === 0) {
      return res.status(200).json(result);
    } else {
      return res.status(400).json(result);
    }
  } catch (error) {
    console.log('Error in getProductFiltersController:', error);
    return res.status(500).json({
      EC: 1,
      EM: 'Lỗi server khi lấy bộ lọc sản phẩm',
      data: null,
    });
  }
};

// Tăng lượt xem sản phẩm
const incrementProductViewController = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await incrementProductView(id);

    return res.status(result.EC === 0 ? 200 : 400).json(result);
  } catch (error) {
    console.log('Error in incrementProductViewController:', error);
    return res.status(500).json({
      EC: 1,
      EM: 'Lỗi server khi tăng lượt xem sản phẩm',
      data: null,
    });
  }
};

// Lấy thống kê sản phẩm
const getProductStatsController = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await getProductStats(id);

    return res.status(result.EC === 0 ? 200 : 404).json(result);
  } catch (error) {
    console.log('Error in getProductStatsController:', error);
    return res.status(500).json({
      EC: 1,
      EM: 'Lỗi server khi lấy thống kê sản phẩm',
      data: null,
    });
  }
};

// Lấy sản phẩm tương tự
const getSimilarProductsController = async (req, res) => {
  try {
    const { id } = req.params;
    const limit = req.query.limit ? parseInt(req.query.limit) : 6;
    const result = await getSimilarProducts(id, limit);

    return res.status(result.EC === 0 ? 200 : 400).json(result);
  } catch (error) {
    console.log('Error in getSimilarProductsController:', error);
    return res.status(500).json({
      EC: 1,
      EM: 'Lỗi server khi lấy sản phẩm tương tự',
      data: null,
    });
  }
};

module.exports = {
  createProductController,
  getAllProductsController,
  getProductByIdController,
  updateProductController,
  deleteProductController,
  getProductFiltersController,
  incrementProductViewController,
  getProductStatsController,
  getSimilarProductsController,
};

