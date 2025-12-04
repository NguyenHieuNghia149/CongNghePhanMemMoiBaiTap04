const Comment = require('../models/comment');
const { getUserByEmail } = require('./userService');
const createComment = async (userEmail, productId, content, rating) => {
  const user = await getUserByEmail(userEmail);
  const userId = user?._id || null;

  try {
    const comment = await Comment.create({
      userId,
      productId,
      content,
      rating,
    });

    return {
      EC: 0,
      EM: 'Thêm bình luận thành công',
      data: comment,
    };
  } catch (error) {
    console.log('Error creating comment:', error);
    return {
      EC: 1,
      EM: 'Có lỗi xảy ra khi thêm bình luận',
      data: null,
    };
  }
};

const getCommentsByProductId = async (productId) => {
  try {
    const comments = await Comment.find({ productId })
      .sort({ createdAt: -1 })
      .populate('userId', 'name email')
      .lean();

    return {
      EC: 0,
      EM: 'Lấy danh sách bình luận thành công',
      data: comments,
    };
  } catch (error) {
    console.log('Error getting comments:', error);
    return {
      EC: 1,
      EM: 'Có lỗi xảy ra khi lấy danh sách bình luận',
      data: null,
    };
  }
};

const countCommentsByProductId = async (productId) => {
  try {
    const count = await Comment.countDocuments({ productId });
    return count;
  } catch (error) {
    console.log('Error counting comments:', error);
    return 0;
  }
};

module.exports = {
  createComment,
  getCommentsByProductId,
  countCommentsByProductId,
};


