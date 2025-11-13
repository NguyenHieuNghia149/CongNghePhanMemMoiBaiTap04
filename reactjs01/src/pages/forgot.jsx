import React from 'react';
import { Button, Card, Form, Input, Space, Typography, notification } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeftOutlined, MailOutlined, LockOutlined, ReloadOutlined } from '@ant-design/icons';
import { forgotPasswordApi } from '../utils/api';

const ForgotPasswordPage = () => {
  const navigate = useNavigate();

  const onFinish = async (values) => {
    const { email, newPassword } = values;

    const res = await forgotPasswordApi(email, newPassword);
    if (res && res.EC === 0) {
      notification.success({
        message: 'FORGOT PASSWORD',
        description: res.EM || 'Đổi mật khẩu thành công',
      });
      navigate('/login');
    } else {
      notification.error({
        message: 'FORGOT PASSWORD',
        description: res?.EM || 'Không thể cập nhật mật khẩu',
      });
    }
  };

  return (
    <div className="page-container">
      <Card className="page-card auth-card" bordered={false}>
        <Space direction="vertical" size={24} style={{ width: '100%' }}>
          <Space direction="vertical" size={8}>
            <Typography.Title level={3}>Quên mật khẩu?</Typography.Title>
            <Typography.Paragraph type="secondary" style={{ marginBottom: 0 }}>
              Nhập email và mật khẩu mới để cập nhật tài khoản của bạn.
            </Typography.Paragraph>
          </Space>

          <Form name="forgot" layout="vertical" onFinish={onFinish} autoComplete="off">
            <Form.Item
              label="Email"
              name="email"
              rules={[
                {
                  required: true,
                  message: 'Vui lòng nhập email!',
                },
                {
                  type: 'email',
                  message: 'Email chưa đúng định dạng',
                },
              ]}
            >
              <Input size="large" prefix={<MailOutlined />} placeholder="you@example.com" />
            </Form.Item>

            <Form.Item
              label="Mật khẩu mới"
              name="newPassword"
              rules={[
                {
                  required: true,
                  message: 'Vui lòng nhập mật khẩu mới!',
                },
                {
                  min: 6,
                  message: 'Mật khẩu phải có ít nhất 6 ký tự',
                },
              ]}
            >
              <Input.Password size="large" prefix={<LockOutlined />} placeholder="••••••••" />
            </Form.Item>

            <Button type="primary" htmlType="submit" icon={<ReloadOutlined />}>
              Cập nhật mật khẩu
            </Button>
          </Form>

          <div className="auth-footer">
            <Link to="/login">
              <ArrowLeftOutlined /> Quay lại đăng nhập
            </Link>
          </div>
        </Space>
      </Card>
    </div>
  );
};

export default ForgotPasswordPage;
