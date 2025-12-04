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

// ------------------------------------------------
// REST Product APIs
// ------------------------------------------------
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
  // Backend route: GET /v1/api/products/filters
  return axios.get('/v1/api/products/filters');
};

// View & stats cho sản phẩm
const addProductViewApi = (id) => {
  return axios.post(`/v1/api/products/${id}/view`);
};

const getProductStatsApi = (id) => {
  return axios.get(`/v1/api/products/${id}/stats`);
};

// Comment APIs
const getProductCommentsApi = (id) => {
  return axios.get(`/v1/api/products/${id}/comments`);
};

const createProductCommentApi = (id, content, rating) => {
  return axios.post(`/v1/api/products/${id}/comments`, { content, rating });
};

// Order API (checkout đơn giản)
const createOrderApi = (items) => {
  // items: [{ productId, quantity }]
  return axios.post('/v1/api/orders', { items });
};

// Favorites & similar products
const toggleFavoriteApi = (id) => {
  return axios.post(`/v1/api/products/${id}/favorite`);
};

const getFavoriteProductsApi = () => {
  return axios.get('/v1/api/products/favorites');
};

const getSimilarProductsApi = (id, limit = 6) => {
  return axios.get(`/v1/api/products/${id}/similar`, { params: { limit } });
};

// ------------------------------------------------
// GraphQL helper (cart)
// ------------------------------------------------
const graphqlRequest = (query, variables = {}) => {
  return axios.post('/graphql', { query, variables });
};

// Lấy giỏ hàng
const getCartGql = () => {
  const query = `
    query {
      getCart {
        EC
        EM
        data {
          _id
          items {
            _id
            quantity
            selected
            productId {
              _id
              name
              price
              image
              brand
            }
          }
        }
      }
    }
  `;

  return graphqlRequest(query);
};

// Thêm sản phẩm vào giỏ hàng
const addItemToCartGql = (productId, quantity = 1) => {
  const query = `
    mutation AddItemToCart($productId: ID!, $quantity: Int) {
      addItemToCart(productId: $productId, quantity: $quantity) {
        EC
        EM
        data {
          _id
          items {
            _id
            quantity
            selected
            productId {
              _id
              name
              price
              image
              brand
            }
          }
        }
      }
    }
  `;

  const variables = { productId, quantity };
  return graphqlRequest(query, variables);
};

// Cập nhật số lượng / trạng thái selected của 1 item
const updateCartItemGql = (itemId, quantity, selected) => {
  const query = `
    mutation UpdateCartItem($itemId: ID!, $quantity: Int, $selected: Boolean) {
      updateCartItem(itemId: $itemId, quantity: $quantity, selected: $selected) {
        EC
        EM
        data {
          _id
          items {
            _id
            quantity
            selected
            productId {
              _id
              name
              price
              image
              brand
            }
          }
        }
      }
    }
  `;

  const variables = { itemId, quantity, selected };
  return graphqlRequest(query, variables);
};

// Xóa 1 item khỏi giỏ hàng
const removeCartItemGql = (itemId) => {
  const query = `
    mutation RemoveCartItem($itemId: ID!) {
      removeItemFromCart(itemId: $itemId) {
        EC
        EM
        data {
          _id
          items {
            _id
            quantity
            selected
            productId {
              _id
              name
              price
              image
              brand
            }
          }
        }
      }
    }
  `;

  const variables = { itemId };
  return graphqlRequest(query, variables);
};

// Xóa toàn bộ giỏ hàng
const clearCartGql = () => {
  const query = `
    mutation {
      clearCart {
        EC
        EM
        data {
          _id
          items {
            _id
            quantity
            selected
            productId {
              _id
              name
              price
              image
              brand
            }
          }
        }
      }
    }
  `;

  return graphqlRequest(query);
};

// Chọn / bỏ chọn 1 hoặc nhiều item
const toggleItemSelectionGql = (itemIds, selected) => {
  const query = `
    mutation ToggleItemSelection($itemIds: [ID!]!, $selected: Boolean!) {
      toggleItemSelection(itemIds: $itemIds, selected: $selected) {
        EC
        EM
        data {
          _id
          items {
            _id
            quantity
            selected
            productId {
              _id
              name
              price
              image
              brand
            }
          }
        }
      }
    }
  `;

  const variables = { itemIds, selected };
  return graphqlRequest(query, variables);
};

// Lấy danh sách sản phẩm đã chọn để thanh toán
const getSelectedItemsForCheckoutGql = () => {
  const query = `
    query {
      getSelectedItemsForCheckout {
        EC
        EM
        data {
          cartId
          totalAmount
          items {
            _id
            quantity
            selected
            productId {
              _id
              name
              price
              image
              brand
            }
          }
        }
      }
    }
  `;

  return graphqlRequest(query);
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
  addProductViewApi,
  getProductStatsApi,
  getProductCommentsApi,
  createProductCommentApi,
  createOrderApi,
  toggleFavoriteApi,
  getFavoriteProductsApi,
  getSimilarProductsApi,
  // GraphQL cart APIs
  getCartGql,
  addItemToCartGql,
  updateCartItemGql,
  removeCartItemGql,
  clearCartGql,
  toggleItemSelectionGql,
  getSelectedItemsForCheckoutGql,
};