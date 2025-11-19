const rateLimit = require('express-rate-limit');


const rateLimitMiddleware = (options) => {
  return rateLimit({
    windowMs: options.windowMs,
    max: options.max,
    message: {
      success: false,
      message: options.message || 'quá nhiều yêu cầu, vui lòng thử lại sau.',
      code: 'RATE_LIMIT_EXCEEDED',
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: options.skipSuccessfulRequests || false,
    skipFailedRequests: options.skipFailedRequests || false,
    keyGenerator: options.keyGenerator,
    handler: (req, res) => {
      res.status(429).json({
        success: false,
        message: options.message || 'Quá nhiều yêu cầu, vui lòng thử lại sau.',
        code: 'RATE_LIMIT_EXCEEDED',
        retryAfter: Math.round(options.windowMs / 1000),
      });
    },
  });
};

const authLimiter = rateLimitMiddleware({
  windowMs: 15 * 60 * 1000, // 15 phút
  max: 20,
  message: 'Quá nhiều lần đăng nhập, vui lòng thử lại sau.',
});

const generalLimiter = rateLimitMiddleware({
  windowMs: 15 * 60 * 1000, // 15 phút
  max: 100,
  message: 'Quá nhiều yêu cầu từ IP này, vui lòng thử lại sau.',
});



// Rate limiter cho password reset
const passwordResetLimiter = rateLimitMiddleware({
  windowMs: 60 * 60 * 1000, // 1 giờ
  max: 3,
  message: 'Quá nhiều lần đặt lại mật khẩu, vui lòng thử lại sau.',
});

// Rate limiter cho email verification
const emailVerificationLimiter = rateLimitMiddleware({
  windowMs: 60 * 60 * 1000, // 1 giờ
  max: 5,
  message: 'Quá nhiều yêu cầu xác thực email, vui lòng thử lại sau.',
});


// Rate limiter cho product CRUD operations
const productCreateLimiter = rateLimitMiddleware({
  windowMs: 15 * 60 * 1000, // 15 phút
  max: 10,
  message: 'Quá nhiều lần tạo sản phẩm, vui lòng thử lại sau.',
});

const productUpdateLimiter = rateLimitMiddleware({
  windowMs: 15 * 60 * 1000, // 15 phút
  max: 20,
  message: 'Quá nhiều lần cập nhật sản phẩm, vui lòng thử lại sau.',
});

const productDeleteLimiter = rateLimitMiddleware({
  windowMs: 15 * 60 * 1000, // 15 phút
  max: 10,
  message: 'Quá nhiều lần xóa sản phẩm, vui lòng thử lại sau.',
});

const productReadLimiter = rateLimitMiddleware({
  windowMs: 15 * 60 * 1000, // 15 phút
  max: 100,
    message: 'Quá nhiều yêu cầu đọc sản phẩm, vui lòng thử lại sau.',
});

module.exports = {
  rateLimitMiddleware,
  authLimiter,
  generalLimiter,
  passwordResetLimiter,
  emailVerificationLimiter,
  productCreateLimiter,
  productUpdateLimiter,
  productDeleteLimiter,
  productReadLimiter,
};
