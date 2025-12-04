require("dotenv").config();
const User = require("../models/user");
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");
const saltRounds = 10;

const createUserService = async (name, email, password) => {
  try {
    const user = await User.findOne({ email });
    if (user) {
      console.log(`>>> user exist, chọn 1 email khác: ${email}`);
      return null;
    }
    const hashPassword = await bcrypt.hash(password, saltRounds);
    let result = await User.create({ name: name, email: email, password: hashPassword, role: "User" });
    return result;
  } catch (error) {
    console.log(error);
    return null;
  }
}

const loginService = async (email1, password) => {
  try {
    const user = await User.findOne({ email: email1 });
    if (user) {
      const isMatchPassword = await bcrypt.compare(password, user.password);
      if (!isMatchPassword) {
        return { EC: 2, EM: "Email/Password không hợp lệ" };
      }
      const payload = { email: user.email, name: user.name, role: user.role };
      const access_token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });
      return { EC: 0, access_token, user: { email: user.email, name: user.name, role: user.role } };
    } else {
      return {
        EC: 1,
        EM: "Email/Password không hợp lệ"
      }
    }
  } catch (error) {
    console.log(error);
    return null;
  }
}

const getUserService = async () => {
  try {
    let result = await User.find({}).select("-password");
    return result;
  } catch (error) {
    console.log(error);
    return null;
  }
}

const resetPasswordService = async (email, newPassword) => {
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return {
        EC: 1,
        EM: 'User không tồn tại',
      };
    }

    const hashPassword = await bcrypt.hash(newPassword, saltRounds);
    user.password = hashPassword;
    await user.save();

    return {
      EC: 0,
      EM: 'Cập nhật mật khẩu thành công',
    };
  } catch (error) {
    console.log(error);
    return null;
  }
}

const getUserByEmail = async (email) => {
  try {
    const user = await User.findOne({ email });
    return user;
  } catch (error) {
    console.log(error);
    return null;
  }
}

module.exports = {
  createUserService, loginService, getUserService, resetPasswordService, getUserByEmail
}

