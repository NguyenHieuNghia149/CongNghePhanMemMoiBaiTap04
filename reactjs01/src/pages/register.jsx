import React from 'react';
import { Button, Card, Divider, Form, Input, Typography, Space, notification } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeftOutlined, UserAddOutlined, MailOutlined, LockOutlined, UserOutlined } from '@ant-design/icons';
import { createUserApi } from '../utils/api';

const RegisterPage = () => {
  const navigate = useNavigate();

  const onFinish = async (values) => {
    const { name, email, password } = values;

    const res = await createUserApi(name, email, password);
    if (res) {
      notification.success({
        message: 'CREATE USER',
        description: 'Success',
      });
      navigate('/login');
    } else {
      notification.error({
        message: 'CREATE USER',
        description: 'error',
      });
    }
  };

  return (
    <div className="page-container">
      <Card className="page-card auth-card" bordered={false}>
        <Space direction="vertical" size={24} style={{ width: '100%' }}>
          <Space direction="vertical" size={8}>
            <Typography.Title level={3}>Tạo tài khoản mới ✨</Typography.Title>
            <Typography.Paragraph type="secondary" style={{ marginBottom: 0 }}>
              Nhập thông tin cơ bản để bắt đầu trải nghiệm ứng dụng của bạn.
            </Typography.Paragraph>
          </Space>

          <Form name="register" layout="vertical" onFinish={onFinish} autoComplete="off">
            <Form.Item
              label="Email"
              name="email"
              rules={[
                {
                  required: true,
                  message: 'Please input your email!',
                },
                {
                  type: 'email',
                  message: 'Email chưa đúng định dạng!',
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
                {
                  min: 6,
                  message: 'Password phải có ít nhất 6 ký tự',
                },
              ]}
            >
              <Input.Password size="large" prefix={<LockOutlined />} placeholder="••••••••" />
            </Form.Item>

            <Form.Item
              label="Name"
              name="name"
              rules={[
                {
                  required: true,
                  message: 'Please input your name!',
                },
              ]}
            >
              <Input size="large" prefix={<UserOutlined />} placeholder="Nguyễn Văn A" />
            </Form.Item>

            <Button type="primary" htmlType="submit" icon={<UserAddOutlined />}>
              Đăng ký
            </Button>
          </Form>

          <div className="auth-footer">
            <Link to="/">
              <ArrowLeftOutlined /> Quay lại trang chủ
            </Link>
            <Divider plain>Hoặc</Divider>
            <Typography.Text style={{ textAlign: 'center' }}>
              Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
            </Typography.Text>
          </div>
        </Space>
      </Card>
    </div>
  );
};

export default RegisterPage;
