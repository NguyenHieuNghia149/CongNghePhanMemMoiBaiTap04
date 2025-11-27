import axios from './axios.customize';

const createUserApi = (name, email, password) => {
  return axios.post('/v1/api/register', { name, email, password });
};

const loginApi = (email, password) => {
  return axios.post('/v1/api/login', { email, password });
};

const getUserApi = () => {
  return axios.get('/v1/api/user');
};

const forgotPasswordApi = (email, newPassword) => {
  return axios.post('/v1/api/forgot-password', { email, newPassword });
};

// Product APIs
const getAllProductsApi = (params = {}) => {
  return axios.get('/v1/api/products', { params });
};

const getProductByIdApi = (id) => {
  return axios.get(`/v1/api/products/${id}`);
};

const createProductApi = (productData) => {
  return axios.post('/v1/api/products', productData);
};

const updateProductApi = (id, productData) => {
  return axios.put(`/v1/api/products/${id}`, productData);
};

const deleteProductApi = (id) => {
  return axios.delete(`/v1/api/products/${id}`);
};

const getProductFiltersApi = () => {
  return axios.get('/v1/api/products/filters'); // hoặc route bạn đặt
};

export { 
  createUserApi, 
  loginApi, 
  getUserApi, 
  forgotPasswordApi,
  getAllProductsApi,
  getProductByIdApi,
  createProductApi,
  updateProductApi,
  deleteProductApi,
  getProductFiltersApi,
};