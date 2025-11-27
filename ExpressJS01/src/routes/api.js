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
} = require('../controllers/productController');
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

