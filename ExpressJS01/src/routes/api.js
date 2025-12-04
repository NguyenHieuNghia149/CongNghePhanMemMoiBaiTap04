const express = require('express');
const { createUser, handleLogin, getUser,
  getAccount, resetPassword
} = require('../controllers/homeController');
const {
  createProductController,
  getAllProductsController,
  getProductByIdController,
  updateProductController,
  deleteProductController,
  getProductFiltersController,
  incrementProductViewController,
  getProductStatsController,
  getSimilarProductsController,
} = require('../controllers/productController');
const {
  toggleFavoriteController,
  getFavoriteProductsController,
} = require('../controllers/favoriteController');
const {
  createCommentController,
  getCommentsByProductController,
} = require('../controllers/commentController');
const {
  createOrderController,
} = require('../controllers/orderController');
const { auth, authAdmin } = require('../middleware/auth');
const delay = require('../middleware/delay');
const { validate } = require('../middleware/validate');
const {
  productCreateLimiter,
  productUpdateLimiter,
  productDeleteLimiter,
  productReadLimiter,
} = require('../middleware/ratelimit');
const { registerSchema, loginSchema, forgotPasswordSchema } = require('../validations/user.validation');
const { 
  productCreateSchema, 
  productUpdateSchema
} = require('../validations/product.validation');

const routerAPI = express.Router();

routerAPI.use(auth);

routerAPI.get("/", (req, res) => {
  return res.status(200).json("Hello world api")
})

routerAPI.post("/register",validate(registerSchema), createUser);
routerAPI.post("/login",validate(loginSchema), handleLogin);
routerAPI.post("/forgot-password",validate(forgotPasswordSchema), resetPassword);

routerAPI.get("/user", authAdmin, getUser);
routerAPI.get("/account", auth, getAccount);

routerAPI.post(
  "/products",
  auth,
  authAdmin,
  productCreateLimiter,
  validate(productCreateSchema),
  createProductController
);

routerAPI.get(
  "/products",
  auth,
  productReadLimiter,
  getAllProductsController
);

routerAPI.get(
  "/products/filters",
  auth,
  productReadLimiter,
  getProductFiltersController
);

// Thống kê & lượt xem sản phẩm
routerAPI.post(
  "/products/:id/view",
  auth,
  productReadLimiter,
  incrementProductViewController
);

routerAPI.get(
  "/products/:id/stats",
  auth,
  productReadLimiter,
  getProductStatsController
);

// Sản phẩm tương tự
routerAPI.get(
  "/products/:id/similar",
  auth,
  productReadLimiter,
  getSimilarProductsController
);

// Comment cho sản phẩm
routerAPI.post(
  "/products/:id/comments",
  auth,
  productReadLimiter,
  createCommentController
);

routerAPI.get(
  "/products/:id/comments",
  auth,
  productReadLimiter,
  getCommentsByProductController
);

// Order checkout đơn giản
routerAPI.post(
  "/orders",
  auth,
  createOrderController
);

// Yêu thích sản phẩm
routerAPI.post(
  "/products/:id/favorite",
  auth,
  productReadLimiter,
  toggleFavoriteController
);

routerAPI.get(
  "/products/favorites",
  auth,
  productReadLimiter,
  getFavoriteProductsController
);

routerAPI.get(
  "/products/:id",
  auth,
  productReadLimiter,
  getProductByIdController
);

routerAPI.put(
  "/products/:id",
  auth,
  authAdmin,
  productUpdateLimiter,
  validate(productUpdateSchema),
  updateProductController
);

routerAPI.delete(
  "/products/:id",
  auth,
  authAdmin,
  productDeleteLimiter,
  deleteProductController
);

module.exports = routerAPI; //export default

