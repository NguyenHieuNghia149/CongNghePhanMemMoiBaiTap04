import React, { useContext } from 'react';
import { Button, Card, Divider, Form, Input, Typography, Space, notification } from 'antd'; // Giữ nguyên notification
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeftOutlined, LoginOutlined, MailOutlined, LockOutlined } from '@ant-design/icons';
import { loginApi } from '../utils/api';
import { AuthContext } from '../components/context/auth.context';

const LoginPage = () => {
  const navigate = useNavigate();
  const { setAuth } = useContext(AuthContext);

  // 1. Khởi tạo hook notification
  // api: dùng để gọi thông báo
  // contextHolder: là nơi chứa context để hiển thị UI (bắt buộc phải render)
  const [api, contextHolder] = notification.useNotification();

  const onFinish = async (values) => {
    try {
      const { email, password } = values;
      const res = await loginApi(email, password);

      // Debug: Xem server trả về gì để biết đường xử lý
      console.log("Check res:", res); 

      if (res && res.EC === 0) {
        localStorage.setItem('access_token', res.access_token);
        
        // Dùng api.success thay vì notification.success
        api.success({
          message: 'Đăng nhập thành công',
          description: 'Chào mừng bạn trở lại!',
          placement: 'topRight',
        });

        setAuth({
          isAuthenticated: true,
          user: {
            email: res?.user?.email ?? '',
            name: res?.user?.name ?? '',
            role: res?.user?.role ?? '',
          },
        });
        navigate('/');
      } else {
        // Trường hợp Server trả về 200 nhưng báo lỗi logic (sai pass, email không tồn tại...)
        api.error({
          message: 'Đăng nhập thất bại',
          description: res?.EM || 'Email hoặc mật khẩu không đúng.',
          placement: 'topRight',
        });
      }
    } catch (error) {
      console.error('Login error details:', error);
      
      // Xử lý thông điệp lỗi an toàn hơn
      let errorMessage = 'Có lỗi xảy ra khi đăng nhập.';
      if (error?.response?.data?.EM) {
        errorMessage = error.response.data.EM;
      } else if (error?.message) {
        errorMessage = error.message;
      }

      api.error({
        message: 'Lỗi hệ thống',
        description: errorMessage,
        placement: 'topRight',
      });
    }
  };

  return (
    <div className="page-container">
      {/* 2. CỰC KỲ QUAN TRỌNG: Phải đặt contextHolder ở đây thì thông báo mới hiện */}
      {contextHolder}

      <Card className="page-card auth-card" bordered={false}>
        <Space direction="vertical" size={24} style={{ width: '100%' }}>
          <Space direction="vertical" size={8}>
            <Typography.Title level={3}>Chào mừng trở lại 👋</Typography.Title>
            <Typography.Paragraph type="secondary" style={{ marginBottom: 0 }}>
              Đăng nhập để tiếp tục quản lý người dùng và phiên làm việc của bạn.
            </Typography.Paragraph>
          </Space>

          <Form name="login" layout="vertical" onFinish={onFinish} autoComplete="off">
            <Form.Item
              label="Email"
              name="email"
              rules={[
                { required: true, message: 'Vui lòng nhập email!' },
                { type: 'email', message: 'Email không hợp lệ!' } // Thêm validate email
              ]}
            >
              <Input size="large" prefix={<MailOutlined />} placeholder="you@example.com" />
            </Form.Item>

            <Form.Item
              label="Mật khẩu"
              name="password"
              rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
            >
              <Input.Password size="large" prefix={<LockOutlined />} placeholder="••••••••" />
            </Form.Item>

            <Button type="primary" htmlType="submit" icon={<LoginOutlined />} block size="large">
              Đăng nhập
            </Button>
          </Form>

          <div className="auth-footer">
            <Link to="/">
              <ArrowLeftOutlined /> Quay lại trang chủ
            </Link>
            <Link to="/forgot-password">Quên mật khẩu?</Link>
            <Divider plain>Hoặc</Divider>
            <Typography.Text style={{ textAlign: 'center', display: 'block' }}>
              Chưa có tài khoản? <Link to="/register">Đăng ký tại đây</Link>
            </Typography.Text>
          </div>
        </Space>
      </Card>
    </div>
  );
};

export default LoginPage;