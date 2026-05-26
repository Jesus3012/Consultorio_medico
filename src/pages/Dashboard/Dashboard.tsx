import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Card, Row, Col, Typography, Space, Button, Table, Tag, Progress, List, Grid } from 'antd';
import { 
  TeamOutlined, 
  CalendarOutlined, 
  FileTextOutlined,
  MedicineBoxOutlined,
  RiseOutlined,
  FallOutlined,
  PlusOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  ShopOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import WelcomeModal from '../../components/Auth/WelcomeModal';
import { detectGender } from '../../utils/genderDetector';
import './Dashboard.css';

const { Title, Text } = Typography;
const { useBreakpoint } = Grid;

// Datos de ejemplo para consultorios
const consultoriosData = [
  { id: 1, nombre: 'Consultorio Médico Matriz', ubicacion: 'Av. Principal #123', pacientes: 1247, consultas: 1842, ingresos: 125000, crecimiento: 12 },
  { id: 2, nombre: 'Sucursal Norte', ubicacion: 'Calle Norte #456', pacientes: 856, consultas: 1120, ingresos: 78450, crecimiento: 8 },
  { id: 3, nombre: 'Sucursal Sur', ubicacion: 'Av. Sur #789', pacientes: 623, consultas: 890, ingresos: 62100, crecimiento: 15 },
  { id: 4, nombre: 'Consultorio Especialidades', ubicacion: 'Blvd. Centro #321', pacientes: 432, consultas: 567, ingresos: 98750, crecimiento: 5 },
];

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  useEffect(() => {
    const hasSeenWelcome = sessionStorage.getItem('hasSeenWelcome');
    if (!hasSeenWelcome && user) {
      setShowWelcome(true);
      sessionStorage.setItem('hasSeenWelcome', 'true');
    }
  }, [user]);

  // Datos para el modal
  const userData = user ? {
    id: user.id,
    nombre: user.nombre,
    primer_apellido: user.primer_apellido,
    segundo_apellido: user.segundo_apellido,
    email: user.email,
    rol_id: user.rol_id,
    empresa_id: user.empresa_id,
    sucursal_id: user.sucursal_id,
    genero: user.genero
  } : null;

  // Función para obtener el saludo correcto según género
  const getWelcomeText = () => {
    if (!user) return '¡Bienvenido!';
    
    const nombreCompleto = `${user.nombre} ${user.primer_apellido || ''}`.trim();
    const gender = user.genero || detectGender(user.nombre, user.primer_apellido);
    
    if (gender === 'FEMALE') {
      return `¡Bienvenida, ${nombreCompleto}!`;
    } else if (gender === 'MALE') {
      return `¡Bienvenido, ${nombreCompleto}!`;
    } else {
      return `¡Bienvenido(a), ${nombreCompleto}!`;
    }
  };

  // Estadísticas globales
  const globalStats = [
    { title: 'Total Pacientes', value: '3,158', icon: <TeamOutlined />, color: '#50EBEC', trend: '+23%', trendUp: true },
    { title: 'Consultas', value: '4,419', icon: <CalendarOutlined />, color: '#36C6C7', trend: '+18%', trendUp: true },
    { title: 'Recetas', value: '2,156', icon: <FileTextOutlined />, color: '#2BA1A2', trend: '+31%', trendUp: true },
    { title: 'Ingresos', value: '$364K', icon: <MedicineBoxOutlined />, color: '#50EBEC', trend: '+22%', trendUp: true },
  ];

  // Columnas para la tabla de consultorios (responsive)
  const columns = [
    { title: 'Consultorio', dataIndex: 'nombre', key: 'nombre', width: isMobile ? 150 : 200, ellipsis: true },
    { title: 'Ubicación', dataIndex: 'ubicacion', key: 'ubicacion', responsive: ['md'] as any, ellipsis: true },
    { title: 'Pacientes', dataIndex: 'pacientes', key: 'pacientes', align: 'right' as const, width: isMobile ? 80 : 100, sorter: (a: any, b: any) => a.pacientes - b.pacientes },
    { title: 'Consultas', dataIndex: 'consultas', key: 'consultas', align: 'right' as const, responsive: ['md'] as any, sorter: (a: any, b: any) => a.consultas - b.consultas },
    { 
      title: 'Ingresos', 
      dataIndex: 'ingresos', 
      key: 'ingresos', 
      align: 'right' as const,
      width: isMobile ? 80 : 100,
      render: (value: number) => isMobile ? `$${(value/1000).toFixed(0)}K` : `$${value.toLocaleString()}`,
      sorter: (a: any, b: any) => a.ingresos - b.ingresos
    },
    { 
      title: 'Crecimiento', 
      dataIndex: 'crecimiento', 
      key: 'crecimiento',
      align: 'center' as const,
      width: isMobile ? 70 : 100,
      render: (value: number) => (
        <Tag color={value > 10 ? 'success' : value > 5 ? 'warning' : 'default'}>
          +{value}%
        </Tag>
      )
    },
    { 
      title: 'Acciones', 
      key: 'acciones',
      align: 'center' as const,
      width: isMobile ? 60 : 80,
      render: (_: any, record: any) => (
        <Button type="link" icon={<EyeOutlined />} onClick={() => navigate(`/clinicas/${record.id}`)} size={isMobile ? "small" : "middle"} />
      )
    },
  ];

  // Actividad reciente
  const recentActivity = [
    { id: 1, action: 'Nuevo paciente registrado', user: 'Janeth Gomez', time: 'Hace 5 min' },
    { id: 2, action: 'Consulta médica completada', user: 'Dr. Carlos López', time: 'Hace 15 min' },
    { id: 3, action: 'Receta electrónica emitida', user: 'Dra. María Pérez', time: 'Hace 32 min' },
    { id: 4, action: 'Nuevo consultorio agregado', user: 'Admin Sistema', time: 'Hace 1 hora' },
    { id: 5, action: 'Paciente dado de alta', user: 'Dr. Roberto Sánchez', time: 'Hace 2 horas' },
  ];

  return (
    <>
      <WelcomeModal visible={showWelcome} user={userData} onClose={() => setShowWelcome(false)} />
      
      <div className="dashboard-modern">
        {/* Header de bienvenida */}
        <div className="welcome-header">
          <div>
            <Title level={isMobile ? 3 : 2} style={{ margin: 0 }}>
              {getWelcomeText()}
            </Title>
            <Text type="secondary" style={{ fontSize: isMobile ? 13 : 14 }}>
              Resumen de todos los consultorios a tu cargo
            </Text>
          </div>
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            onClick={() => navigate('/clinicas/nueva')}
            className="add-clinic-btn"
            size={isMobile ? "middle" : "large"}
            block={isMobile}
          >
            Agregar Consultorio
          </Button>
        </div>

        {/* Stats globales */}
        <Row gutter={[16, 16]} className="stats-row">
          {globalStats.map((stat, index) => (
            <Col xs={12} sm={12} lg={6} key={index}>
              <Card className="stat-card-modern" hoverable>
                <div className="stat-icon" style={{ background: `${stat.color}15`, color: stat.color }}>
                  {stat.icon}
                </div>
                <div className="stat-content">
                  <Text type="secondary" className="stat-title">{stat.title}</Text>
                  <Title level={isMobile ? 4 : 3} className="stat-value">{stat.value}</Title>
                  <div className="stat-trend">
                    {stat.trendUp ? <RiseOutlined style={{ color: '#52c41a' }} /> : <FallOutlined style={{ color: '#ff4d4f' }} />}
                    <Text type={stat.trendUp ? 'success' : 'danger'} style={{ fontSize: 11 }}>
                      {stat.trend}
                    </Text>
                  </div>
                </div>
              </Card>
            </Col>
          ))}
        </Row>

        {/* Tabla de consultorios */}
        <Card 
          title={
            <Space size={isMobile ? 4 : 8}>
              <ShopOutlined style={{ color: '#50EBEC' }} />
              <span style={{ fontSize: isMobile ? 14 : 16 }}>Consultorios</span>
              <Tag color="#50EBEC" style={{ fontSize: isMobile ? 10 : 12 }}>{consultoriosData.length}</Tag>
            </Space>
          }
          extra={
            <Button type="link" onClick={() => navigate('/clinicas')} size={isMobile ? "small" : "middle"}>
              Ver todos <EyeOutlined />
            </Button>
          }
          className="clinics-table-card"
        >
          <div className={isMobile ? "table-responsive" : ""}>
            <Table
              columns={columns}
              dataSource={consultoriosData}
              rowKey="id"
              pagination={false}
              loading={loading}
              size={isMobile ? "small" : "middle"}
              scroll={{ x: isMobile ? 500 : undefined }}
            />
          </div>
        </Card>

        {/* Fila inferior */}
        <Row gutter={[16, 16]} className="bottom-row">
          <Col xs={24} lg={12}>
            <Card title="Actividad Reciente" className="activity-card">
              <div className="activity-list">
                {recentActivity.map((item) => (
                    <div key={item.id} className="activity-list-item">
                    <div className="activity-item-avatar">
                        <CheckCircleOutlined style={{ color: '#50EBEC', fontSize: isMobile ? 16 : 20 }} />
                    </div>
                    <div className="activity-item-content">
                        <div className="activity-item-title">
                        <Text strong style={{ fontSize: isMobile ? 13 : 14 }}>{item.action}</Text>
                        </div>
                        <div className="activity-item-description">
                        <Text type="secondary" style={{ fontSize: isMobile ? 11 : 12 }}>{item.user} • {item.time}</Text>
                        </div>
                    </div>
                    </div>
                ))}
                </div>
    
            </Card>
          </Col>
          
          <Col xs={24} lg={12}>
            <Card title="Métricas Rápidas" className="metrics-card">
              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <div className="metric-item">
                    <Text type="secondary" style={{ fontSize: isMobile ? 12 : 14 }}>Ocupación</Text>
                    <Progress percent={78} strokeColor="#50EBEC" size={isMobile ? "small" : "medium"} />
                  </div>
                </Col>
                <Col span={12}>
                  <div className="metric-item">
                    <Text type="secondary" style={{ fontSize: isMobile ? 12 : 14 }}>Satisfacción</Text>
                    <Progress percent={94} strokeColor="#36C6C7" size={isMobile ? "small" : "medium"} />
                  </div>
                </Col>
                <Col span={12}>
                  <div className="metric-item">
                    <Text type="secondary" style={{ fontSize: isMobile ? 12 : 14 }}>Citas</Text>
                    <Progress percent={86} strokeColor="#2BA1A2" size={isMobile ? "small" : "medium"} />
                  </div>
                </Col>
                <Col span={12}>
                  <div className="metric-item">
                    <Text type="secondary" style={{ fontSize: isMobile ? 12 : 14 }}>Recetas</Text>
                    <Progress percent={72} strokeColor="#50EBEC" size={isMobile ? "small" : "medium"} />
                  </div>
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>
      </div>
    </>
  );
};

export default Dashboard;