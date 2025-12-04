import React, { useContext, useEffect, useState} from 'react';
import {
  UserOutlined,
  ShoppingCartOutlined,
  LogoutOutlined,
  LoginOutlined,
  ProfileOutlined,
  HomeOutlined,
  ShopOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import { Menu, Avatar, Badge, Dropdown, Button, Space, message } from 'antd';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/auth.context';
import { getCartGql } from '../../utils/api';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { auth, setAuth } = useContext(AuthContext);
  const [cartCount, setCartCount] = useState(0);
  

  useEffect(() => {
    const fetchCartCount = async () => {
      if(!auth?.isAuthenticated) {
        setCartCount(0);
        return;
      }
      try {
        const res = await getCartGql();
        if(res?.data?.getCart?.EC === 0) {
          const totalQuantity = (res.data.getCart.data?.items || []).reduce(
            (sum, item) => sum + (item.quantity || 0),
            0
          );
          setCartCount(totalQuantity);
        }
      } catch {
        message.error('Lỗi khi lấy số lượng sản phẩm trong giỏ hàng');
      }
    };
    fetchCartCount();
  }, [auth?.isAuthenticated]);

  const handleLogout = () => {
    localStorage.removeItem('access_token'); // Sửa lại: clear() không nhận tham số, dùng removeItem
    setAuth({
      isAuthenticated: false,
      user: { email: '', name: '', role: '' },
    });
    message.success('Đăng xuất thành công!');
    navigate('/');
  };

  // 1. Menu chính (Nằm ở giữa)
  const mainMenuItems = [
    {
      label: <Link to="/">Trang chủ</Link>,
      key: '/',
      icon: <HomeOutlined />,
    },
    {
      label: <Link to="/products">Sản phẩm</Link>,
      key: '/products',
      icon: <ShopOutlined />,
    },
    ...(auth?.isAuthenticated
      ? [
         

          (auth?.user?.role === 'admin' && [
          {
            label: <Link to="/user">Người dùng</Link>,
            key: '/user',
            icon: <TeamOutlined />,
          },
        ]),
       ] : [])
  ];

  // 2. Menu Dropdown cho User (Avatar)
  const userMenuSettings = [
    {
      key: 'profile',
      label: <span>Thông tin tài khoản</span>,
      icon: <ProfileOutlined />,
      disabled: true, // Ví dụ: chưa có trang profile
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      label: <span onClick={handleLogout}>Đăng xuất</span>,
      icon: <LogoutOutlined />,
      danger: true,
    },
  ];

  return (
    <div
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        width: '100%',
        backgroundColor: '#fff',
        boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
        padding: '0 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '64px',
      }}
    >
      {/* --- PHẦN 1: LOGO --- */}
      <div 
        style={{ 
            fontSize: '24px', 
            fontWeight: 'bold', 
            color: '#1890ff', 
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            minWidth: '150px'
        }}
        onClick={() => navigate('/')}
      >
        <ShopOutlined style={{ marginRight: 8, fontSize: '28px' }} />
        MyApp
      </div>

      {/* --- PHẦN 2: MENU ĐIỀU HƯỚNG (CENTER) --- */}
      <Menu
        selectedKeys={[location.pathname]}
        mode="horizontal"
        items={mainMenuItems}
        style={{
          flex: 1,
          justifyContent: 'center',
          borderBottom: 'none',
          backgroundColor: 'transparent',
          minWidth: 0, // Fix flex overflow
        }}
      />

      {/* --- PHẦN 3: ACTIONS (RIGHT) --- */}
      <div style={{ display: 'flex', alignItems: 'center', minWidth: '150px', justifyContent: 'flex-end' }}>
        {auth?.isAuthenticated ? (
          <Space size="large">
            {/* Giỏ hàng tách riêng */}
            <Link to="/cart">
                <Badge count={cartCount} size="small"> {/* Thay số 2 bằng biến state cart */}
                    <ShoppingCartOutlined style={{ fontSize: '22px', color: '#555', cursor: 'pointer' }} />
                </Badge>
            </Link>

            {/* Avatar Dropdown */}
            <Dropdown menu={{ items: userMenuSettings }} placement="bottomRight" arrow>
              <Space style={{ cursor: 'pointer' }}>
                <Avatar 
                    style={{ backgroundColor: '#1890ff' }} 
                    icon={<UserOutlined />} 
                    // Có thể thay src bằng avatar url của user
                    // src={auth.user.avatar} 
                />
                <div style={{ display: 'flex', flexDirection: 'column', lineHeight: '1.2' }}>
                    <span style={{ fontWeight: 600, fontSize: '14px' }}>
                        {auth?.user?.name || 'User'}
                    </span>
                    <span style={{ fontSize: '11px', color: '#888' }}>
                        {auth?.user?.email}
                    </span>
                </div>
              </Space>
            </Dropdown>
          </Space>
        ) : (
          <Space>
             <Link to="/register">
                <Button type="text">Đăng ký</Button>
             </Link>
             <Link to="/login">
                <Button type="primary" icon={<LoginOutlined />}>
                    Đăng nhập
                </Button>
             </Link>
          </Space>
        )}
      </div>
    </div>
  );
};

export default Header;