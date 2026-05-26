import React, { useState } from 'react';
import {
  Layout,
  Menu,
  Avatar,
  Button,
  Typography,
  Badge,
  Tooltip,
  App,
  Space,
} from 'antd';
import {
  DashboardOutlined,
  CalendarOutlined,
  FileTextOutlined,
  SettingOutlined,
  LogoutOutlined,
  UserOutlined,
  ShopOutlined,
  BarChartOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  BellOutlined,
  HeartOutlined,
  PoweroffOutlined,
  MenuOutlined,
} from '@ant-design/icons';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';
import MobileMenu from '../../components/MobileMenu/MobileMenu';
import './PrivateLayout.css';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

const PrivateLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { message, modal } = App.useApp();

  const menuItems = [
    { key: '/dashboard', icon: <DashboardOutlined />, label: 'Dashboard' },
    { key: '/clinicas', icon: <ShopOutlined />, label: 'Consultorios' },
    { key: '/pacientes', icon: <UserOutlined />, label: 'Pacientes' },
    { key: '/citas', icon: <CalendarOutlined />, label: 'Citas' },
    { key: '/recetas', icon: <FileTextOutlined />, label: 'Recetas' },
    { key: '/reportes', icon: <BarChartOutlined />, label: 'Reportes' },
    { key: '/configuracion', icon: <SettingOutlined />, label: 'Configuración' },
  ];

  const handleLogout = () => {
    try {
      sessionStorage.removeItem('hasSeenWelcome');
      logout();
      message.success('Sesión cerrada correctamente');
      navigate('/login');
    } catch (error) {
      message.error('Error al cerrar sesión');
    }
  };

  const showLogoutConfirm = () => {
    modal.confirm({
      title: 'Cerrar Sesión',
      icon: <PoweroffOutlined style={{ color: '#50EBEC' }} />,
      content: '¿Estás seguro de que deseas cerrar sesión?',
      okText: 'Sí, cerrar sesión',
      cancelText: 'Cancelar',
      okButtonProps: { danger: true },
      onOk: handleLogout,
    });
  };

  const handleMenuClick = (key: string) => {
    navigate(key);
    setMobileMenuOpen(false);
  };

  const getGenderIcon = () => {
    if (user?.genero === 'FEMALE') return '👩';
    if (user?.genero === 'MALE') return '👨';
    return '👤';
  };

  const getRolName = () => {
    switch (user?.rol_id) {
      case 1:
        return 'Administrador';
      case 2:
        return 'Médico';
      default:
        return 'Usuario';
    }
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        className="custom-sider"
        width={280}
        collapsedWidth={80}
      >
        <div className="logo-container">
          <div className={`logo ${collapsed ? 'collapsed' : ''}`}>
            <HeartOutlined className="logo-icon" />
            {!collapsed && <span className="logo-text">MediSys</span>}
          </div>
        </div>

        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          className="custom-menu"
          onClick={({ key }) => navigate(key)}
        />
      </Sider>

      <Layout className="main-layout">
        <Header className="dashboard-header">
          <div className="header-left">
            <Button
              type="text"
              icon={<MenuOutlined />}
              onClick={() => setMobileMenuOpen(true)}
              className="mobile-menu-btn"
            />

            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              className="desktop-collapse-btn"
            />

            <div className="page-title">
              <Text strong>
                {menuItems.find((item) => item.key === location.pathname)?.label || 'Dashboard'}
              </Text>
            </div>
          </div>

          <div className="header-right">
            <Tooltip title="Notificaciones">
              <Badge count={3} size="small">
                <Button type="text" icon={<BellOutlined />} className="notification-btn" />
              </Badge>
            </Tooltip>

            <div className="user-info-block">
              <Avatar
                size={36}
                icon={<UserOutlined />}
                style={{
                  background: 'linear-gradient(135deg, #50EBEC 0%, #36C6C7 100%)',
                }}
              />
              <div className="user-text-info">
                <div className="user-name">
                  {user?.nombre} {user?.primer_apellido || ''}
                </div>
                <div className="user-role">
                  {getGenderIcon()} {getRolName()}
                </div>
              </div>
            </div>

            <Button icon={<LogoutOutlined />} onClick={showLogoutConfirm} className="logout-btn">
              Salir
            </Button>

            <Button
              type="text"
              icon={<LogoutOutlined />}
              onClick={showLogoutConfirm}
              className="logout-mobile-btn"
            />
          </div>
        </Header>

        <Content className="dashboard-content">
          <Outlet />
        </Content>
      </Layout>

      <MobileMenu 
        open={mobileMenuOpen} 
        onClose={() => setMobileMenuOpen(false)} 
        onMenuClick={handleMenuClick}
      />
    </Layout>
  );
};

export default PrivateLayout;