import React, { useContext } from 'react';
import { Button, Card, Divider, Form, Input, Typography, Space, notification } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeftOutlined, LoginOutlined, MailOutlined, LockOutlined } from '@ant-design/icons';
import { loginApi } from '../utils/api';
import { AuthContext } from '../components/context/auth.context';

const LoginPage = () => {
  const navigate = useNavigate();
  const { setAuth } = useContext(AuthContext);

  const onFinish = async (values) => {
    const { email, password } = values;

    const res = await loginApi(email, password);
    if (res && res.EC === 0) {
      localStorage.setItem('access_token', res.access_token);
      notification.success({
        message: 'LOGIN USER',
        description: 'Success',
      });
      setAuth({
        isAuthenticated: true,
        user: {
          email: res?.user?.email ?? '',
          name: res?.user?.name ?? '',
        },
      });
      navigate('/');
    } else {
        console.log(res);
      notification.error({
        message: 'LOGIN USER',
        description: res?.EM ?? 'error',
      });
    }
  };

  return (
    <div className="page-container">
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
                {
                  required: true,
                  message: 'Please input your email!',
                },
              ]}
            >
              <Input size="large" prefix={<MailOutlined />} placeholder="you@example.com" />
            </Form.Item>

            <Form.Item
              label="Password"
              name="password"
              rules={[
                {
                  required: true,
                  message: 'Please input your password!',
                },
              ]}
            >
              <Input.Password size="large" prefix={<LockOutlined />} placeholder="••••••••" />
            </Form.Item>

            <Button type="primary" htmlType="submit" icon={<LoginOutlined />}>
              Đăng nhập
            </Button>
          </Form>

          <div className="auth-footer">
            <Link to="/">
              <ArrowLeftOutlined /> Quay lại trang chủ
            </Link>
            <Link to="/forgot-password">Quên mật khẩu?</Link>
            <Divider plain>Hoặc</Divider>
            <Typography.Text style={{ textAlign: 'center' }}>
              Chưa có tài khoản? <Link to="/register">Đăng ký tại đây</Link>
            </Typography.Text>
          </div>
        </Space>
      </Card>
    </div>
  );
};

export default LoginPage;
