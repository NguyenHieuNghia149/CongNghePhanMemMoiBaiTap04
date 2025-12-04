require('dotenv').config();
const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
  const white_lists = ['/', '/register', '/login', '/forgot-password'];

  // Cho phép public một số route không cần đăng nhập
  const isPublicAuthRoute = white_lists.find((item) => `/v1/api${item}` === req.originalUrl);

  // Cho phép GET các API sản phẩm (xem danh sách, chi tiết, bộ lọc, stats, similar, comments)
  const isPublicProductGet =
    req.method === 'GET' &&
    req.originalUrl.startsWith('/v1/api/products') &&
    !req.originalUrl.includes('/favorites'); // favorites vẫn cần login

  if (isPublicAuthRoute || isPublicProductGet) {
    next();
  } else {
    if (req?.headers?.authorization?.split(' ')?.[1]) {
      const token = req.headers.authorization.split(' ')[1];

      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = {
          email: decoded.email,
          name: decoded.name,
          role: decoded.role,
          createdBy: 'hoidanit',
        };
        console.log('>>> check token: ', decoded);
        next();
      } catch (error) {
        return res.status(401).json({
          message: 'Token bị hết hạn hoặc không hợp lệ',
        });
      }
    } else {
      return res.status(401).json({
        message: 'Bạn chưa truyền Access Token ở header/Hoặc token bị hết hạn',
      });
    }
  }
};


const authAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      message: 'Bạn chưa đăng nhập',
    });
  }
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      message: 'Bạn không có quyền truy cập vào tính năng này',
    });
  }
  next();
};

module.exports = {
  auth,
  authAdmin,
};
