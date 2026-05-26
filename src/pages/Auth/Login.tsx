import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Input, Button, Card, Typography, Row, Col, Space, App, Divider, Grid } from 'antd';
import { 
  UserOutlined, 
  LockOutlined, 
  LoginOutlined, 
  MobileOutlined, 
  HeartOutlined
} from '@ant-design/icons';
import { useAuth } from '../../hooks/useAuth';
import { detectGender, getWelcomeMessage } from '../../utils/genderDetector';
import './Login.css';

const { Title, Text } = Typography;
const { useBreakpoint } = Grid;

interface LoginFormValues {
  email: string;
  password: string;
}

const Login: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const { message } = App.useApp();
  const screens = useBreakpoint();
  
  const isMobile = !screens.md;

  const onFinish = async (values: LoginFormValues) => {
    setLoading(true);
    try {
      await login(values.email, values.password);
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      
      // Detectar género correctamente
      const gender = user.genero || detectGender(user.nombre, user.primer_apellido);
      
      // Mensaje personalizado según género
      let welcomeText = '';
      if (gender === 'FEMALE') {
        welcomeText = `¡Bienvenida, ${user.nombre} ${user.primer_apellido}!`;
      } else if (gender === 'MALE') {
        welcomeText = `¡Bienvenido, ${user.nombre} ${user.primer_apellido}!`;
      } else {
        welcomeText = `¡Bienvenido(a), ${user.nombre} ${user.primer_apellido}!`;
      }
      
      message.success({
        content: welcomeText,
        icon: <HeartOutlined />,
        duration: 4,
        style: { marginTop: '20px' }
      });
      
      navigate('/dashboard');
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Credenciales incorrectas');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <Row 
        justify="center" 
        align="middle" 
        style={{ minHeight: '100vh', position: 'relative', zIndex: 2 }}
      >
        <Col xs={22} sm={20} md={14} lg={12} xl={10}>
          <div className="login-card-wrapper">
            <Card
              className="login-card"
              styles={{ body: { padding: isMobile ? 32 : 48 } }}
            >
              <Space direction="vertical" size={isMobile ? "middle" : "large"} style={{ width: '100%' }}>
                {/* Logo y título */}
                <div className="login-header">
                  <div className="logo-wrapper">
                    <div className="logo-icon pulse-animation">
                      <LoginOutlined />
                    </div>
                  </div>
                  <Title level={isMobile ? 3 : 2} className="login-title">
                    Consultorio Médico
                  </Title>
                  <Text type="secondary" className="login-subtitle">
                    Sistema Integral de Gestión Médica
                  </Text>
                </div>

                <Divider className="login-divider">
                  <span className="divider-text">Acceso al Sistema</span>
                </Divider>

                {/* Formulario */}
                <Form
                  name="login"
                  onFinish={onFinish}
                  layout="vertical"
                  size="large"
                  className="login-form"
                >
                  <Form.Item
                    name="email"
                    label="Correo electrónico"
                    rules={[
                      { required: true, message: 'Por favor ingrese su email' },
                      { type: 'email', message: 'Email inválido' }
                    ]}
                  >
                    <Input 
                      prefix={<UserOutlined className="input-icon" />} 
                      placeholder="ejemplo@correo.com" 
                      autoComplete="email"
                      className="login-input"
                      size="large"
                    />
                  </Form.Item>

                  <Form.Item
                    name="password"
                    label="Contraseña"
                    rules={[{ required: true, message: 'Por favor ingrese su contraseña' }]}
                  >
                    <Input.Password
                      prefix={<LockOutlined className="input-icon" />}
                      placeholder="••••••••"
                      autoComplete="current-password"
                      className="login-input"
                      size="large"
                    />
                  </Form.Item>

                  <Form.Item>
                    <Button 
                      type="primary" 
                      htmlType="submit" 
                      loading={loading}
                      block
                      className="login-button"
                      size="large"
                    >
                      Iniciar Sesión
                    </Button>
                  </Form.Item>
                </Form>

                {isMobile && (
                  <div className="mobile-version">
                    <MobileOutlined />
                    <Text type="secondary">Versión Móvil</Text>
                  </div>
                )}
              </Space>
            </Card>
            
            <div className="login-footer">
              <Text type="secondary" style={{ fontSize: 12 }}>
                © 2024 Consultorio Médico - Todos los derechos reservados
              </Text>
            </div>
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default Login;