const { createComment, getCommentsByProductId } = require('../services/commentService');

const createCommentController = async (req, res) => {
  try {
    const { id } = req.params; // productId
    const userEmail = req.user && req.user.email ? req.user.email : null;
    const { content, rating } = req.body;

    if (!userEmail) {
      return res.status(401).json({
        EC: 1,
        EM: 'Bạn cần đăng nhập để bình luận',
        data: null,
      });
    }

    const result = await createComment(userEmail, id, content, rating);
    return res.status(result.EC === 0 ? 201 : 400).json(result);
  } catch (error) {
    console.log('Error in createCommentController:', error);
    return res.status(500).json({
      EC: 1,
      EM: 'Lỗi server khi thêm bình luận',
      data: null,
    });
  }
};

const getCommentsByProductController = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await getCommentsByProductId(id);
    return res.status(result.EC === 0 ? 200 : 400).json(result);
  } catch (error) {
    console.log('Error in getCommentsByProductController:', error);
    return res.status(500).json({
      EC: 1,
      EM: 'Lỗi server khi lấy danh sách bình luận',
      data: null,
    });
  }
};

module.exports = {
  createCommentController,
  getCommentsByProductController,
};


