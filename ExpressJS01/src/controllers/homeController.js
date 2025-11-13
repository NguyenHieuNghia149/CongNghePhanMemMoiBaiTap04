const {createUserService, loginService, getUserService, resetPasswordService} = require('../services/userService');



const createUser = async (req, res) => {
    const {name, email, password} = req.body;
    const data = await createUserService(name, email, password);
    return res.status(200).json(data);
}

const handleLogin = async (req, res) => {
    const {email, password} = req.body;
    const data = await loginService(email, password);
    return res.status(200).json(data);
}

const getUser = async (req, res) => {
    const data = await getUserService();
    return res.status(200).json(data);
}

const getAccount = async (req, res) => {
    return res.status(200).json(req.user);
}

const resetPassword = async (req, res) => {
    const {email, newPassword} = req.body;
    if (!email || !newPassword) {
        return res.status(400).json({
            EC: 1,
            EM: 'Thiếu email hoặc mật khẩu mới'
        });
    }

    const data = await resetPasswordService(email, newPassword);
    if (!data) {
        return res.status(500).json({
            EC: 2,
            EM: 'Có lỗi xảy ra'
        });
    }

    return res.status(200).json(data);
}

const getHomePage = (req, res) => {
    return res.render('index.ejs')
}

module.exports = {
    getHomePage,
    createUser,
    handleLogin,
    getUser,
    getAccount,
    resetPassword
}