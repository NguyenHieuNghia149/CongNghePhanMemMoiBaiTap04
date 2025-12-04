require('dotenv').config();
const jwt = require('jsonwebtoken');

/**
 * Middleware để xác thực GraphQL requests
 * Lấy token từ header và decode để lấy thông tin user
 */
const graphqlAuth = (req, res, next) => {
  try {
    // Lấy token từ header
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // Gán thông tin user vào req để GraphQL context có thể sử dụng
        req.user = {
          email: decoded.email,
          name: decoded.name,
          role: decoded.role,
        };
      } catch (error) {
        // Token không hợp lệ hoặc hết hạn
        req.user = null;
      }
    } else {
      req.user = null;
    }
    
    next();
  } catch (error) {
    req.user = null;
    next();
  }
};

module.exports = graphqlAuth;

