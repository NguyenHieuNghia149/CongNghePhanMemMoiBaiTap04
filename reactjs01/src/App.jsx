import { Outlet } from 'react-router-dom';
import Header from './components/layout/header';
import axios from './utils/axios.customize';
import { useContext, useEffect } from 'react';
import { AuthContext } from './components/context/auth.context';
import { Spin } from 'antd';

function App() {
  const { setAuth, appLoading, setAppLoading } = useContext(AuthContext);

  useEffect(() => {
    const fetchAccount = async () => {
      setAppLoading(true);
      const res = await axios.get('/v1/api/user');
      if (res && !res.message) {
        setAuth({
          isAuthenticated: true,
          user: {
            email: res.email,
            name: res.name,
            role: res.role,
          },
        });
      }
      setAppLoading(false);
    };

    fetchAccount();
  }, [setAppLoading, setAuth]);

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {appLoading === true ? (
        <div
          style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 9999,
          }}
        >
          <Spin />
        </div>
      ) : (
        <>
          <Header />
          <div style={{ flex: 1, width: '100%' }}>
            <Outlet />
          </div>
        </>
      )}
    </div>
  );
}

export default App;
