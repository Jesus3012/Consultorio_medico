import React, { useState, useEffect, useMemo } from 'react';
import { Modal, Typography, Avatar, Button, Divider, Progress, Row, Col } from 'antd';
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

type GenderType = 'FEMALE' | 'MALE' | 'UNKNOWN';

interface WelcomeModalProps {
  visible: boolean;
  user: any | null;
  onClose: () => void;
}

const removeAccents = (value: string): string => {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
};

const normalizeGender = (gender?: string): GenderType => {
  const value = removeAccents(String(gender || '').toUpperCase().trim());

  if (['MALE', 'MASCULINO', 'HOMBRE', 'M'].includes(value)) return 'MALE';
  if (['FEMALE', 'FEMENINO', 'MUJER', 'F'].includes(value)) return 'FEMALE';

  return 'UNKNOWN';
};

const detectGender = (nombre: string): GenderType => {
  if (!nombre) return 'UNKNOWN';

  const primerNombre = removeAccents(nombre)
    .toLowerCase()
    .trim()
    .split(' ')[0];

  const maleNames = [
    'jose', 'juan', 'carlos', 'miguel', 'angel',
    'jesus', 'pedro', 'pablo', 'francisco', 'javier',
    'manuel', 'andres', 'alejandro', 'roberto', 'antonio',
    'fernando', 'sergio', 'ramon', 'ricardo', 'alberto',
    'gerardo', 'omar', 'edgar', 'ivan', 'david', 'jorge',
    'luis', 'daniel', 'arturo', 'mario', 'hugo', 'ruben',
    'gabriel'
  ];

  const femaleNames = [
    'maria', 'ana', 'laura', 'carmen', 'josefina',
    'isabel', 'luisa', 'patricia', 'martha', 'teresa',
    'gloria', 'silvia', 'veronica', 'elena', 'sofia',
    'valentina', 'camila', 'daniela', 'paula', 'andrea',
    'fernanda', 'alejandra', 'monica', 'lorena', 'janeth',
    'karla', 'karen', 'liliana', 'jessica', 'vanessa',
    'gabriela', 'adriana'
  ];

  if (maleNames.includes(primerNombre)) return 'MALE';
  if (femaleNames.includes(primerNombre)) return 'FEMALE';

  if (primerNombre.endsWith('a')) return 'FEMALE';
  if (primerNombre.endsWith('o')) return 'MALE';

  return 'UNKNOWN';
};

const WelcomeModal: React.FC<WelcomeModalProps> = ({ visible, user, onClose }) => {
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(true);
  const [userGender, setUserGender] = useState<GenderType>('UNKNOWN');

  const usuario = useMemo(() => {
    if (!user) return null;

    const rawUser =
      user?.data?.data ||
      user?.data?.user ||
      user?.data?.usuario ||
      user?.data ||
      user?.user ||
      user?.usuario ||
      user;

    return rawUser;
  }, [user]);

  const getNombre = () => {
    return (
      usuario?.nombre ||
      usuario?.name ||
      usuario?.firstName ||
      ''
    );
  };

  const getPrimerApellido = () => {
    return (
      usuario?.primerApellido ||
      usuario?.primer_apellido ||
      usuario?.apellidoPaterno ||
      usuario?.lastName ||
      ''
    );
  };

  const getSegundoApellido = () => {
    return (
      usuario?.segundoApellido ||
      usuario?.segundo_apellido ||
      usuario?.apellidoMaterno ||
      ''
    );
  };

  const getNombreCompleto = () => {
    const nombre = getNombre();
    const primerApellido = getPrimerApellido();
    const segundoApellido = getSegundoApellido();

    return `${nombre} ${primerApellido} ${segundoApellido}`
      .replace(/\s+/g, ' ')
      .trim();
  };

  const getRolId = () => {
    return Number(
      usuario?.rolId ??
      usuario?.rol_id ??
      usuario?.perfilId ??
      usuario?.perfil_id ??
      0
    );
  };

  useEffect(() => {
    if (!visible) return;

    if (usuario) {
      const nombre = getNombre();
      const genderFromUser = normalizeGender(usuario.genero);

      const gender =
        genderFromUser !== 'UNKNOWN'
          ? genderFromUser
          : detectGender(nombre);

      setUserGender(gender);

      console.log('WELCOME USER RAW:', user);
      console.log('WELCOME USER NORMALIZADO:', usuario);
      console.log('WELCOME NOMBRE COMPLETO:', getNombreCompleto());
      console.log('WELCOME ROL ID:', getRolId());
      console.log('WELCOME GÉNERO:', gender);
    } else {
      setUserGender('UNKNOWN');
    }

    setProgress(0);
    setLoading(true);

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setLoading(false);
          return 100;
        }

        return prev + 20;
      });
    }, 200);

    return () => clearInterval(interval);
  }, [visible, usuario]);

  const getGreeting = () => {
    const hour = new Date().getHours();

    if (hour < 12) return 'Buenos días';
    if (hour < 18) return 'Buenas tardes';
    return 'Buenas noches';
  };

  const getGreetingTitle = () => {
    const rolId = getRolId();

    if (rolId === 2) {
      if (userGender === 'FEMALE') return `${getGreeting()}, Doctora`;
      if (userGender === 'MALE') return `${getGreeting()}, Doctor`;
    }

    return getGreeting();
  };

  const getWelcomeText = () => {
    const fullName = getNombreCompleto();
    const rolId = getRolId();

    if (!fullName) {
      switch (userGender) {
        case 'FEMALE':
          return rolId === 2 ? '¡Bienvenida, Doctora!' : '¡Bienvenida!';
        case 'MALE':
          return rolId === 2 ? '¡Bienvenido, Doctor!' : '¡Bienvenido!';
        default:
          return '¡Bienvenido(a)!';
      }
    }

    switch (userGender) {
      case 'FEMALE':
        return rolId === 2
          ? `¡Bienvenida, Dra. ${fullName}!`
          : `¡Bienvenida, ${fullName}!`;

      case 'MALE':
        return rolId === 2
          ? `¡Bienvenido, Dr. ${fullName}!`
          : `¡Bienvenido, ${fullName}!`;

      default:
        return `¡Bienvenido(a), ${fullName}!`;
    }
  };

  const getRoleIcon = () => {
    const rolId = getRolId();

    if (rolId === 1) return <StarOutlined />;
    if (rolId === 2) return <MedicineBoxOutlined />;

    return <UserOutlined />;
  };

  const getRoleName = () => {
    const rolId = getRolId();

    if (rolId === 1) return 'Administrador del Sistema';
    if (rolId === 2) return 'Médico Especialista';
    if (rolId === 3) return 'Auditor';

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
    <Modal
      open={visible}
      footer={null}
      closable={false}
      className="welcome-modal"
      width={600}
      mask={{ closable: false }}
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
            railColor="#E6F7F7"
            showInfo={false}
            style={{ width: '80%', marginTop: 16 }}
          />

          <Text type="secondary" style={{ marginTop: 16, display: 'block' }}>
            Cargando información del consultorio
          </Text>
        </div>
      ) : (
        <div className="welcome-content">
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
              {getGreetingTitle()}
            </Title>

            <Title level={3} className="welcome-name">
              {getNombreCompleto() || 'Usuario sin nombre'}
            </Title>

            <div className="welcome-role">
              {getRoleIcon()} {getRoleName()}
            </div>
          </div>

          <Divider className="welcome-divider" />

          <div className="welcome-stats">
            <Row gutter={[16, 16]}>
              {stats.map((stat, index) => (
                <Col span={8} key={index}>
                  <div className="stat-card-mini">
                    <div className="stat-icon" style={{ color: '#50EBEC' }}>
                      {stat.icon}
                    </div>

                    <div className="stat-value">
                      {stat.value}
                    </div>

                    <div className="stat-label">
                      {stat.label}
                    </div>
                  </div>
                </Col>
              ))}
            </Row>
          </div>

          <div className="welcome-message">
            <Paragraph style={{ marginBottom: 8 }}>
              <HeartOutlined style={{ color: '#50EBEC', marginRight: 8 }} />
              <Text strong>{getWelcomeText()}</Text>
            </Paragraph>

            <Text type="secondary" style={{ fontSize: 13 }}>
              Hoy es{' '}
              {new Date().toLocaleDateString('es-MX', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </Text>
          </div>

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