import React from 'react';
import { Drawer, Menu } from 'antd';
import {
  DashboardOutlined,
  CalendarOutlined,
  FileTextOutlined,
  SettingOutlined,
  UserOutlined,
  ShopOutlined,
  BarChartOutlined,
  HeartOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import './MobileMenu.css';

interface MobileMenuProps {
  open: boolean;
  onClose: () => void;
  onMenuClick: (key: string) => void;
}

const MobileMenu: React.FC<MobileMenuProps> = ({ open, onClose, onMenuClick }) => {
  const location = useLocation();
  
  const menuItems = [
    { key: '/dashboard', icon: <DashboardOutlined />, label: 'Dashboard' },
    { key: '/clinicas', icon: <ShopOutlined />, label: 'Consultorios' },
    { key: '/pacientes', icon: <UserOutlined />, label: 'Pacientes' },
    { key: '/citas', icon: <CalendarOutlined />, label: 'Citas' },
    { key: '/recetas', icon: <FileTextOutlined />, label: 'Recetas' },
    { key: '/reportes', icon: <BarChartOutlined />, label: 'Reportes' },
    { key: '/configuracion', icon: <SettingOutlined />, label: 'Configuración' },
  ];

  return (
    <Drawer
        placement="left"
        open={open}
        onClose={onClose}
        size="default"  // width es reemplazado por size
        closable={true}
    >
      <div className="mobile-drawer-header">
        <HeartOutlined className="mobile-drawer-logo" />
        <span className="mobile-drawer-title">MediSys</span>
      </div>
      
      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={[location.pathname]}
        items={menuItems}
        className="mobile-drawer-menu"
        onClick={({ key }) => onMenuClick(key)}
      />
    </Drawer>
  );
};

export default MobileMenu;