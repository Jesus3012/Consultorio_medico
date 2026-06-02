import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import {
  Card,
  Row,
  Col,
  Typography,
  Space,
  Button,
  Table,
  Tag,
  Progress,
  Grid,
  Select,
  Spin,
  Empty,
  message,
} from 'antd';
import {
  TeamOutlined,
  CalendarOutlined,
  MedicineBoxOutlined,
  PlusOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  ShopOutlined,
  UserOutlined,
} from '@ant-design/icons';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { useNavigate } from 'react-router-dom';
import WelcomeModal from '../../components/Auth/WelcomeModal';
import { detectGender } from '../../utils/genderDetector';
import axiosInstance from '../../api/axios.config';
import './Dashboard.css';

const { Title, Text } = Typography;
const { useBreakpoint } = Grid;

interface DashboardStats {
  pacientes: number;
  consultas: number;
  medicos: number;
  sucursales: number;
  usuarios: number;
}

interface Sucursal {
  id: number;
  nombre: string;
  ubicacion?: string;
  pacientes?: number;
  consultas?: number;
  medicos?: number;
  usuarios?: number;
  estatus?: string;
}

interface Actividad {
  id: number;
  action?: string;
  descripcion?: string;
  user?: string;
  usuario?: string;
  time?: string;
  fecha?: string;
}

interface Metricas {
  ocupacion: number;
  satisfaccion: number;
  citas: number;
  recetas: number;
}

interface ChartSucursal {
  sucursal: string;
  usuarios: number;
}

interface ChartRol {
  rol: string;
  total: number;
}

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  const [loading, setLoading] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [sucursalId, setSucursalId] = useState<number | undefined>();

  const [stats, setStats] = useState<DashboardStats>({
    pacientes: 0,
    consultas: 0,
    medicos: 0,
    sucursales: 0,
    usuarios: 0,
  });

  const [sucursales, setSucursales] = useState<Sucursal[]>([]);
  const [actividad, setActividad] = useState<Actividad[]>([]);
  const [metricas, setMetricas] = useState<Metricas>({
    ocupacion: 0,
    satisfaccion: 0,
    citas: 0,
    recetas: 0,
  });

  const [usuariosPorSucursal, setUsuariosPorSucursal] = useState<ChartSucursal[]>([]);
  const [usuariosPorRol, setUsuariosPorRol] = useState<ChartRol[]>([]);

  useEffect(() => {
    const hasSeenWelcome = sessionStorage.getItem('hasSeenWelcome');

    if (!hasSeenWelcome && user) {
      setShowWelcome(true);
      sessionStorage.setItem('hasSeenWelcome', 'true');
    }
  }, [user]);

  const getWelcomeText = () => {
    if (!user) return 'Bienvenido';

    const nombreCompleto = `${user.nombre} ${user.primer_apellido || ''}`.trim();
    const gender = user.genero || detectGender(user.nombre, user.primer_apellido);

    if (gender === 'FEMALE') return `Bienvenida, ${nombreCompleto}`;
    if (gender === 'MALE') return `Bienvenido, ${nombreCompleto}`;

    return `Bienvenido(a), ${nombreCompleto}`;
  };

  const fetchDashboard = async () => {
    setLoading(true);

    try {
      const [usuariosRes, sucursalesRes, meRes] = await Promise.all([
        axiosInstance.get('/usuarios', {
          params: {
            page: 1,
            limit: 100,
          },
        }),
        axiosInstance.get('/sucursales', {
          params: {
            page: 1,
            limit: 100,
          },
        }),
        axiosInstance.get('/auth/me'),
      ]);

      const usuariosData = usuariosRes.data?.data?.data || [];
      const sucursalesData = sucursalesRes.data?.data?.data || [];
      const currentUser = meRes.data?.data;

      const empresaId = currentUser?.empresaId || user?.empresa_id;

      let usuariosFiltrados = usuariosData.filter(
        (item: any) => item.empresaId === empresaId
      );

      const sucursalesEmpresa = sucursalesData.filter(
        (item: any) => item.empresaId === empresaId
      );

      if (sucursalId) {
        usuariosFiltrados = usuariosFiltrados.filter(
          (item: any) => item.sucursalId === sucursalId
        );
      }

      const sucursalesFiltradas = sucursalId
        ? sucursalesEmpresa.filter((item: any) => item.id === sucursalId)
        : sucursalesEmpresa;

      const sucursalesMapeadas = sucursalesFiltradas.map((item: any) => ({
        id: item.id,
        nombre: item.nombre,
        ubicacion: `${item.municipio}, ${item.entidad}`,
        pacientes: 0,
        consultas: 0,
        medicos: usuariosFiltrados.filter(
          (u: any) => u.sucursalId === item.id && u.rolId === 2
        ).length,
        usuarios: usuariosFiltrados.filter(
          (u: any) => u.sucursalId === item.id
        ).length,
        estatus: item.activo ? 'ACTIVA' : 'INACTIVA',
      }));

      const totalUsuarios = usuariosFiltrados.length;
      const totalMedicos = usuariosFiltrados.filter((item: any) => item.rolId === 2).length;
      const totalSucursales = sucursalesFiltradas.length;

      setStats({
        pacientes: 0,
        consultas: 0,
        medicos: totalMedicos,
        sucursales: totalSucursales,
        usuarios: totalUsuarios,
      });

      setSucursales(sucursalesMapeadas);

      setUsuariosPorSucursal(
        sucursalesFiltradas.map((item: any) => ({
          sucursal: item.nombre,
          usuarios: usuariosFiltrados.filter((u: any) => u.sucursalId === item.id).length,
        }))
      );

      setUsuariosPorRol([
        {
          rol: 'Administradores',
          total: usuariosFiltrados.filter((item: any) => item.rolId === 1).length,
        },
        {
          rol: 'Médicos',
          total: usuariosFiltrados.filter((item: any) => item.rolId === 2).length,
        },
        {
          rol: 'Auditores',
          total: usuariosFiltrados.filter((item: any) => item.rolId === 3).length,
        },
      ]);

      setActividad([
        {
          id: 1,
          action: 'Usuarios cargados correctamente',
          user: 'Sistema',
          time: `${totalUsuarios} usuarios encontrados`,
        },
        {
          id: 2,
          action: 'Consultorios cargados correctamente',
          user: 'Sistema',
          time: `${totalSucursales} consultorios activos`,
        },
        {
          id: 3,
          action: 'Médicos disponibles',
          user: 'Sistema',
          time: `${totalMedicos} médicos registrados`,
        },
      ]);

      setMetricas({
        ocupacion: totalSucursales > 0 ? Math.min(Math.round((totalUsuarios / totalSucursales) * 10), 100) : 0,
        satisfaccion: 0,
        citas: 0,
        recetas: 0,
      });
    } catch (error: any) {
      console.error('ERROR DASHBOARD:', error?.response?.data || error);
      message.error('No fue posible cargar la información del dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, [sucursalId, user?.empresa_id]);

  const userData = user
    ? {
        id: user.id,
        nombre: user.nombre,
        primer_apellido: user.primer_apellido,
        segundo_apellido: user.segundo_apellido,
        email: user.email,
        rol_id: user.rol_id,
        empresa_id: user.empresa_id,
        sucursal_id: user.sucursal_id,
        genero: user.genero,
      }
    : null;

  const globalStats = [
    {
      title: 'Pacientes',
      value: stats.pacientes,
      subtitle: 'Total registrados',
      icon: <TeamOutlined />,
      color: '#50EBEC',
    },
    {
      title: 'Consultas',
      value: stats.consultas,
      subtitle: 'Este mes',
      icon: <CalendarOutlined />,
      color: '#36C6C7',
    },
    {
      title: 'Médicos',
      value: stats.medicos,
      subtitle: 'Activos',
      icon: <MedicineBoxOutlined />,
      color: '#2BA1A2',
    },
    {
      title: 'Consultorios',
      value: stats.sucursales,
      subtitle: 'Activos',
      icon: <ShopOutlined />,
      color: '#50EBEC',
    },
    {
      title: 'Usuarios',
      value: stats.usuarios,
      subtitle: 'Activos',
      icon: <UserOutlined />,
      color: '#36C6C7',
    },
  ];

  const columns = [
    {
      title: 'Consultorio',
      dataIndex: 'nombre',
      key: 'nombre',
      width: isMobile ? 160 : 220,
      ellipsis: true,
    },
    {
      title: 'Ubicación',
      dataIndex: 'ubicacion',
      key: 'ubicacion',
      responsive: ['md'] as any,
      ellipsis: true,
      render: (value: string) => value || 'Sin ubicación',
    },
    {
      title: 'Pacientes',
      dataIndex: 'pacientes',
      key: 'pacientes',
      align: 'right' as const,
      width: 100,
      render: (value: number) => value || 0,
    },
    {
      title: 'Consultas',
      dataIndex: 'consultas',
      key: 'consultas',
      align: 'right' as const,
      width: 100,
      render: (value: number) => value || 0,
    },
    {
      title: 'Estatus',
      dataIndex: 'estatus',
      key: 'estatus',
      align: 'center' as const,
      width: 100,
      render: (value: string) => (
        <Tag color={value === 'INACTIVA' ? 'red' : 'success'}>
          {value || 'ACTIVA'}
        </Tag>
      ),
    },
    {
      title: 'Acciones',
      key: 'acciones',
      align: 'center' as const,
      width: 90,
      render: (_: any, record: Sucursal) => (
        <Button
          type="link"
          icon={<EyeOutlined />}
          onClick={() => navigate(`/clinicas/${record.id}`)}
          size={isMobile ? 'small' : 'middle'}
        />
      ),
    },
  ];

  const pieColors = ['#50EBEC', '#36C6C7', '#2BA1A2'];

  return (
    <>
      <WelcomeModal
        visible={showWelcome}
        user={userData}
        onClose={() => setShowWelcome(false)}
      />

      <div className="dashboard-modern">
        <div className="welcome-header">
          <div>
            <Title level={isMobile ? 3 : 2} style={{ margin: 0 }}>
              {getWelcomeText()}
            </Title>

            <Text type="secondary" style={{ fontSize: isMobile ? 13 : 14 }}>
              Resumen general del consultorio médico
            </Text>
          </div>

          <Space wrap>
            <Select
              allowClear
              placeholder="Filtrar por consultorio"
              value={sucursalId}
              onChange={setSucursalId}
              style={{ width: isMobile ? '100%' : 230 }}
              options={sucursales.map((sucursal) => ({
                label: sucursal.nombre,
                value: sucursal.id,
              }))}
            />

            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => navigate('/clinicas')}
              className="add-clinic-btn"
              size={isMobile ? 'middle' : 'large'}
            >
              Nuevo Consultorio
            </Button>
          </Space>
        </div>

        <Spin spinning={loading}>
          <Row gutter={[16, 16]} className="stats-row">
            {globalStats.map((stat, index) => (
              <Col xs={12} sm={12} md={8} lg={index === 4 ? 24 : 6} xl={index === 4 ? 4 : 5} key={stat.title}>
                <Card className="stat-card-modern" hoverable>
                  <div
                    className="stat-icon"
                    style={{
                      background: `${stat.color}15`,
                      color: stat.color,
                    }}
                  >
                    {stat.icon}
                  </div>

                  <div className="stat-content">
                    <Text type="secondary" className="stat-title">
                      {stat.title}
                    </Text>

                    <Title level={isMobile ? 4 : 3} className="stat-value">
                      {Number(stat.value).toLocaleString('es-MX')}
                    </Title>

                    <div className="stat-trend">
                      <Text style={{ fontSize: 11, color: '#2BA1A2', fontWeight: 600 }}>
                        {stat.subtitle}
                      </Text>
                    </div>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>

          <Row gutter={[16, 16]} className="bottom-row">
            <Col xs={24} lg={12}>
              <Card title="Usuarios por consultorio" className="activity-card">
                {usuariosPorSucursal.length > 0 ? (
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={usuariosPorSucursal}>
                      <XAxis dataKey="sucursal" tick={{ fontSize: 11 }} />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Bar dataKey="usuarios" fill="#36C6C7" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <Empty description="Sin información" />
                )}
              </Card>
            </Col>

            <Col xs={24} lg={12}>
              <Card title="Usuarios por rol" className="metrics-card">
                {usuariosPorRol.some((item) => item.total > 0) ? (
                  <ResponsiveContainer width="100%" height={260}>
                    <PieChart>
                      <Pie
                        data={usuariosPorRol}
                        dataKey="total"
                        nameKey="rol"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={4}
                      >
                        {usuariosPorRol.map((_, index) => (
                          <Cell key={index} fill={pieColors[index % pieColors.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <Empty description="Sin información" />
                )}
              </Card>
            </Col>
          </Row>

          <Card
            title={
              <Space size={isMobile ? 4 : 8}>
                <ShopOutlined style={{ color: '#50EBEC' }} />
                <span style={{ fontSize: isMobile ? 14 : 16 }}>Consultorios</span>
                <Tag color="#50EBEC" style={{ fontSize: isMobile ? 10 : 12 }}>
                  {sucursales.length}
                </Tag>
              </Space>
            }
            extra={
              <Button
                type="link"
                onClick={() => navigate('/clinicas')}
                size={isMobile ? 'small' : 'middle'}
              >
                Ver todas <EyeOutlined />
              </Button>
            }
            className="clinics-table-card"
          >
            {sucursales.length > 0 ? (
              <div className={isMobile ? 'table-responsive' : ''}>
                <Table
                  columns={columns}
                  dataSource={sucursales}
                  rowKey="id"
                  pagination={false}
                  loading={loading}
                  size={isMobile ? 'small' : 'middle'}
                  scroll={{ x: isMobile ? 620 : undefined }}
                />
              </div>
            ) : (
              <Empty description="No hay consultorios registrados" />
            )}
          </Card>

          <Row gutter={[16, 16]} className="bottom-row">
            <Col xs={24} lg={12}>
              <Card title="Actividad Reciente" className="activity-card">
                {actividad.length > 0 ? (
                  <div className="activity-list">
                    {actividad.map((item) => (
                      <div key={item.id} className="activity-list-item">
                        <div className="activity-item-avatar">
                          <CheckCircleOutlined
                            style={{
                              color: '#50EBEC',
                              fontSize: isMobile ? 16 : 20,
                            }}
                          />
                        </div>

                        <div className="activity-item-content">
                          <div className="activity-item-title">
                            <Text strong style={{ fontSize: isMobile ? 13 : 14 }}>
                              {item.action || item.descripcion}
                            </Text>
                          </div>

                          <div className="activity-item-description">
                            <Text type="secondary" style={{ fontSize: isMobile ? 11 : 12 }}>
                              {item.user || item.usuario || 'Sistema'} • {item.time || item.fecha || ''}
                            </Text>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <Empty description="Sin actividad reciente" />
                )}
              </Card>
            </Col>

            <Col xs={24} lg={12}>
              <Card title="Métricas Rápidas" className="metrics-card">
                <Row gutter={[16, 16]}>
                  <Col span={12}>
                    <div className="metric-item">
                      <Text type="secondary" style={{ fontSize: isMobile ? 12 : 14 }}>
                        Ocupación
                      </Text>
                      <Progress percent={metricas.ocupacion} strokeColor="#50EBEC" size="small" />
                    </div>
                  </Col>

                  <Col span={12}>
                    <div className="metric-item">
                      <Text type="secondary" style={{ fontSize: isMobile ? 12 : 14 }}>
                        Satisfacción
                      </Text>
                      <Progress percent={metricas.satisfaccion} strokeColor="#36C6C7" size="small" />
                    </div>
                  </Col>

                  <Col span={12}>
                    <div className="metric-item">
                      <Text type="secondary" style={{ fontSize: isMobile ? 12 : 14 }}>
                        Citas
                      </Text>
                      <Progress percent={metricas.citas} strokeColor="#2BA1A2" size="small" />
                    </div>
                  </Col>

                  <Col span={12}>
                    <div className="metric-item">
                      <Text type="secondary" style={{ fontSize: isMobile ? 12 : 14 }}>
                        Recetas
                      </Text>
                      <Progress percent={metricas.recetas} strokeColor="#50EBEC" size="small" />
                    </div>
                  </Col>
                </Row>
              </Card>
            </Col>
          </Row>
        </Spin>
      </div>
    </>
  );
};

export default Dashboard;