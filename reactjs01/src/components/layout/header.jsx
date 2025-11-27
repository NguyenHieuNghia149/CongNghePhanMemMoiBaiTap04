import React, { useContext, useState } from 'react';
import {
  UsergroupAddOutlined,
  HomeOutlined,
  SettingOutlined,
  LogoutOutlined,
  ShoppingOutlined,
} from '@ant-design/icons';
import { Menu } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/auth.context';

const Header = () => {
  const navigate = useNavigate();
  const { auth, setAuth } = useContext(AuthContext);
  const [current, setCurrent] = useState('mail');

  const items = [
    {
      label: <Link to="/">Home Page</Link>,
      key: 'home',
      icon: <HomeOutlined />,
    },
    ...(auth?.isAuthenticated
      ? [
          {
            label: <Link to="/products">Product</Link>,
            key: 'products',
            icon: <ShoppingOutlined />,
          },
          {
            label: <Link to="/user">Users</Link>,
            key: 'user',
            icon: <UsergroupAddOutlined />,
          },
        ]
      : []),
    {
      label: `Welcome ${auth?.user?.email ?? ''}`,
      key: 'subMenu',
      icon: <SettingOutlined />,
      children: auth?.isAuthenticated
        ? [
            {
              label: (
                <span
                  onClick={() => {
                    localStorage.clear('access_token');
                    setAuth({
                      isAuthenticated: false,
                      user: {
                        email: '',
                        name: '',
                        role: '',
                      },
                    });
                    navigate('/');
                    setCurrent('home');
                  }}
                >
                  Đăng xuất
                </span>
              ),
              key: 'logout',
              icon: <LogoutOutlined />,
            },
          ]
        : [
            {
              label: <Link to="/login">Đăng nhập</Link>,
              key: 'login',
            },
          ],
    },
  ];

  const onClick = (e) => {
    setCurrent(e.key);
  };

  return (
    <div style={{ width: '100%', backgroundColor: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
      <Menu 
        onClick={onClick} 
        selectedKeys={[current]} 
        mode="horizontal" 
        items={items}
        style={{ 
          width: '100%',
          maxWidth: '100%',
          lineHeight: '64px',
        }}
      />
    </div>
  );
};

export default Header;
