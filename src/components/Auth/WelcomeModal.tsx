import React, { useState, useEffect } from 'react';
import { Modal, Typography, Space, Avatar, Button, Divider, Progress, Row, Col } from 'antd';
import { 
  HeartOutlined, 
  UserOutlined, 
  SmileOutlined,
  StarOutlined,
  MedicineBoxOutlined,
  CalendarOutlined,
  TeamOutlined,
  CheckCircleOutlined,
  WomanOutlined,
  ManOutlined
} from '@ant-design/icons';
import './WelcomeModal.css';

const { Title, Text, Paragraph } = Typography;

// Definir la interfaz User localmente
interface UserLocal {
  id: number;
  nombre: string;
  primer_apellido: string;
  segundo_apellido?: string;
  email: string;
  rol_id: number;
  empresa_id: number;
  sucursal_id?: number;
  genero?: string;
  [key: string]: any;
}

interface WelcomeModalProps {
  visible: boolean;
  user: UserLocal | null;
  onClose: () => void;
}

// Función para detectar género (incluida aquí para evitar dependencias)
const detectGender = (nombre: string, primerApellido?: string): 'FEMALE' | 'MALE' | 'UNKNOWN' => {
  if (!nombre) return 'UNKNOWN';
  
  const nombreLower = nombre.toLowerCase().trim();
  
  // Lista de nombres femeninos
  const femaleNames = [
    'maria', 'maría', 'ana', 'laura', 'carmen', 'josefina', 'isabel', 'luisa',
    'patricia', 'martha', 'teresa', 'gloria', 'silvia', 'veronica', 'verónica',
    'elena', 'sofia', 'sofía', 'valentina', 'camila', 'daniela', 'paula',
    'andrea', 'fernanda', 'alejandra', 'monica', 'mónica', 'lorena', 'janeth',
    'karla', 'karen', 'liliana', 'jessica', 'vanessa', 'gabriela', 'adriana',
    'diana', 'ivette', 'wendy', 'melissa', 'katherine', 'karmina', 'marisol'
  ];
  
  // Lista de nombres masculinos
  const maleNames = [
    'jose', 'josé', 'juan', 'carlos', 'miguel', 'angel', 'ángel', 'jesus', 'jesús',
    'pedro', 'pablo', 'francisco', 'javier', 'manuel', 'andres', 'andrès',
    'alejandro', 'roberto', 'antonio', 'fernando', 'sergio', 'ramon', 'ramón',
    'ricardo', 'alberto', 'gerardo', 'omar', 'edgar', 'ivan', 'iván', 'david',
    'jorge', 'luis', 'daniel', 'arturo', 'mario', 'hugo', 'ruben', 'rubén'
  ];
  
  // Verificar en listas
  if (femaleNames.includes(nombreLower)) return 'FEMALE';
  if (maleNames.includes(nombreLower)) return 'MALE';
  
  // Verificar por terminación
  if (nombreLower.endsWith('a')) return 'FEMALE';
  if (nombreLower.endsWith('o')) return 'MALE';
  
  return 'UNKNOWN';
};

const WelcomeModal: React.FC<WelcomeModalProps> = ({ visible, user, onClose }) => {
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(true);
  const [userGender, setUserGender] = useState<'FEMALE' | 'MALE' | 'UNKNOWN'>('UNKNOWN');

  useEffect(() => {
    if (visible) {
      // Detectar género del usuario
      if (user) {
        const gender = user.genero as any || detectGender(user.nombre, user.primer_apellido);
        setUserGender(gender);
      }
      
      setProgress(0);
      setLoading(true);
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setLoading(false);
            return 100;
          }
          return prev + 20;
        });
      }, 200);
      return () => clearInterval(interval);
    }
  }, [visible, user]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Buenos días';
    if (hour < 18) return 'Buenas tardes';
    return 'Buenas noches';
  };

  const getWelcomeText = () => {
    const fullName = `${user?.nombre || ''} ${user?.primer_apellido || ''}`.trim();
    
    switch (userGender) {
      case 'FEMALE':
        return `¡Bienvenida, ${fullName}!`;
      case 'MALE':
        return `¡Bienvenido, ${fullName}!`;
      default:
        return `¡Bienvenido(a), ${fullName}!`;
    }
  };

  const getRoleIcon = () => {
    if (user?.rol_id === 1) return <StarOutlined />;
    if (user?.rol_id === 2) return <MedicineBoxOutlined />;
    return <UserOutlined />;
  };

  const getRoleName = () => {
    if (user?.rol_id === 1) return 'Administrador del Sistema';
    if (user?.rol_id === 2) return 'Médico Especialista';
    return 'Usuario';
  };

  const getGenderBadgeIcon = () => {
    if (userGender === 'FEMALE') return <WomanOutlined />;
    if (userGender === 'MALE') return <ManOutlined />;
    return <SmileOutlined />;
  };

  const stats = [
    { icon: <TeamOutlined />, label: 'Pacientes hoy', value: '8' },
    { icon: <CalendarOutlined />, label: 'Próximas citas', value: '5' },
    { icon: <CheckCircleOutlined />, label: 'Tareas pendientes', value: '3' }
  ];

  return (
    // Reemplazar la propiedad maskClosable
    <Modal
    open={visible}
    footer={null}
    closable={false}
    className="welcome-modal"
    width={600}
    mask={{ closable: false }} // Cambiado maskClosable por mask.closable
    keyboard={false}
    centered
    >
      {loading ? (
        <div className="welcome-loading">
          <div className="loading-spinner">
            <HeartOutlined style={{ fontSize: 48, color: '#50EBEC' }} />
          </div>
          <Title level={4} style={{ marginTop: 24 }}>
            Accediendo al sistema...
          </Title>
          <Progress 
            percent={progress} 
            strokeColor="#50EBEC"
            trailColor="#E6F7F7"
            showInfo={false}
            style={{ width: '80%', marginTop: 16 }}
          />
          <Text type="secondary" style={{ marginTop: 16, display: 'block' }}>
            Cargando información del consultorio
          </Text>
        </div>
      ) : (
        <div className="welcome-content">
          {/* Header con decoración */}
          <div className="welcome-header">
            <div className="welcome-decoration">
              <div className="decoration-circle circle-1"></div>
              <div className="decoration-circle circle-2"></div>
              <div className="decoration-circle circle-3"></div>
            </div>
            <div className="welcome-avatar-wrapper">
              <Avatar 
                size={80} 
                icon={getRoleIcon()} 
                className="welcome-avatar"
                style={{ 
                  background: 'linear-gradient(135deg, #50EBEC 0%, #36C6C7 100%)',
                  boxShadow: '0 8px 20px rgba(80, 235, 236, 0.3)'
                }}
              />
              <div className="welcome-badge">
                {getGenderBadgeIcon()}
              </div>
            </div>
            <Title level={2} className="welcome-greeting">
              {getGreeting()}!
            </Title>
            <Title level={3} className="welcome-name">
              {user?.nombre} {user?.primer_apellido} {user?.segundo_apellido}
            </Title>
            <div className="welcome-role">
              {getRoleIcon()} {getRoleName()}
            </div>
          </div>

          <Divider className="welcome-divider" />

          {/* Stats rápidos */}
          <div className="welcome-stats">
            <Row gutter={[16, 16]}>
              {stats.map((stat, index) => (
                <Col span={8} key={index}>
                  <div className="stat-card-mini">
                    <div className="stat-icon" style={{ color: '#50EBEC' }}>
                      {stat.icon}
                    </div>
                    <div className="stat-value">{stat.value}</div>
                    <div className="stat-label">{stat.label}</div>
                  </div>
                </Col>
              ))}
            </Row>
          </div>

          {/* Mensaje de bienvenida personalizado */}
          <div className="welcome-message">
            <Paragraph style={{ marginBottom: 8 }}>
              <HeartOutlined style={{ color: '#50EBEC', marginRight: 8 }} />
              <Text strong>{getWelcomeText()}</Text>
            </Paragraph>
            <Text type="secondary" style={{ fontSize: 13 }}>
              Hoy es {new Date().toLocaleDateString('es-ES', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </Text>
          </div>

          {/* Botón de inicio */}
          <Button 
            type="primary" 
            size="large" 
            block 
            onClick={onClose}
            className="welcome-button"
            icon={<HeartOutlined />}
          >
            Comenzar a trabajar
          </Button>
        </div>
      )}
    </Modal>
  );
};

export default WelcomeModal;