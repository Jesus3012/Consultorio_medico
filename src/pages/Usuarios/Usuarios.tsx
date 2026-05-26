import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  Radio,
  Typography,
  Card,
  Avatar,
  Tag,
  Tooltip,
  Grid,
  Drawer,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  UserOutlined,
  LockOutlined,
  ReloadOutlined,
  SearchOutlined,
  EyeOutlined,
  ExclamationCircleOutlined,
  MailOutlined,
  PhoneOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import userService, { type UserData } from '../../services/user/user.service';
import { App } from 'antd';
import './Usuarios.css';

const { useBreakpoint } = Grid;
const { Text } = Typography;

const Usuarios: React.FC = () => {
  const { message, modal } = App.useApp(); 
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [detailDrawerVisible, setDetailDrawerVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<UserData | null>(null);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [searchText, setSearchText] = useState('');
  const [form] = Form.useForm();
  const [passwordForm] = Form.useForm();
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  // Cargar usuarios
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await userService.getUsuarios(1, 100);
      setUsers(data);
    } catch (error) {
      message.error('Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Mostrar modal de confirmación para eliminar
  const showDeleteConfirm = (user: UserData) => {
    modal.confirm({
      title: 'Eliminar Usuario',
      icon: <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />,
      content: (
        <div>
          <p>¿Estás seguro de que deseas eliminar este usuario?</p>
          <p><strong>Usuario:</strong> {user.nombre} {user.primer_apellido}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <Text type="danger">Esta acción no se puede deshacer.</Text>
        </div>
      ),
      okText: 'Sí, eliminar',
      okType: 'danger',
      cancelText: 'Cancelar',
      onOk: async () => {
        try {
          await userService.deleteUsuario(user.id!);
          message.success('Usuario eliminado exitosamente');
          fetchUsers();
        } catch (error) {
          message.error('Error al eliminar usuario');
        }
      },
    });
  };

  const handleCreate = () => {
    setEditingUser(null);
    form.resetFields();
    form.setFieldsValue({ rol_id: 2 });
    setModalVisible(true);
  };

  const handleEdit = (user: UserData) => {
    setEditingUser(user);
    form.setFieldsValue({
      nombre: user.nombre,
      primer_apellido: user.primer_apellido,
      segundo_apellido: user.segundo_apellido,
      email: user.email,
      telefono: user.telefono,
      rol_id: user.rol_id,
    });
    setModalVisible(true);
  };

  const handleViewDetails = (user: UserData) => {
    setSelectedUser(user);
    if (isMobile) {
      setDetailDrawerVisible(true);
    } else {
      setDetailModalVisible(true);
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      const submitData = {
        ...values,
        telefono: values.telefono || '',
      };
      
      if (editingUser) {
        await userService.updateUsuario(editingUser.id!, submitData);
        message.success('Usuario actualizado exitosamente');
      } else {
        await userService.createUsuario(submitData);
        message.success('Usuario creado exitosamente');
      }
      setModalVisible(false);
      fetchUsers();
    } catch (error: any) {
      if (error.message) {
        message.error(error.message);
      } else {
        message.error('Error al guardar usuario');
      }
    }
  };

  const handleOpenPasswordModal = (userId: number) => {
    setSelectedUserId(userId);
    passwordForm.resetFields();
    setPasswordModalVisible(true);
  };

  const handleChangePassword = async () => {
    try {
      const values = await passwordForm.validateFields();
      if (values.newPassword !== values.confirmPassword) {
        message.error('Las contraseñas no coinciden');
        return;
      }
      await userService.changePassword(selectedUserId!, {
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });
      message.success('Contraseña actualizada exitosamente');
      setPasswordModalVisible(false);
    } catch (error) {
      message.error('Error al cambiar contraseña');
    }
  };

  const filteredUsers = users.filter(user =>
    user.nombre?.toLowerCase().includes(searchText.toLowerCase()) ||
    user.primer_apellido?.toLowerCase().includes(searchText.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchText.toLowerCase())
  );

  const columns: ColumnsType<UserData> = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 70 },
    {
      title: 'Usuario',
      key: 'nombre',
      width: 200,
      render: (_, record) => (
        <Space>
          <Avatar icon={<UserOutlined />} style={{ backgroundColor: '#50EBEC' }} />
          <span>{record.nombre} {record.primer_apellido}</span>
        </Space>
      ),
    },
    { title: 'Email', dataIndex: 'email', key: 'email', ellipsis: true },
    { title: 'Teléfono', dataIndex: 'telefono', key: 'telefono', responsive: ['md'] as any },
    {
      title: 'Rol',
      dataIndex: 'rol_id',
      key: 'rol_id',
      width: 120,
      render: (rol_id) => (
        <Tag color={rol_id === 1 ? 'gold' : 'blue'}>
          {rol_id === 1 ? 'Administrador' : 'Médico'}
        </Tag>
      ),
    },
    {
      title: 'Estado',
      dataIndex: 'activo',
      key: 'activo',
      width: 100,
      render: (activo) => (
        <Tag color={activo ? 'green' : 'red'}>{activo ? 'Activo' : 'Inactivo'}</Tag>
      ),
    },
    {
      title: 'Acciones',
      key: 'actions',
      width: 220,
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Ver detalles">
            <Button type="link" icon={<EyeOutlined />} onClick={() => handleViewDetails(record)} />
          </Tooltip>
          <Tooltip title="Editar">
            <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(record)} />
          </Tooltip>
          <Tooltip title="Cambiar contraseña">
            <Button type="link" icon={<LockOutlined />} onClick={() => handleOpenPasswordModal(record.id!)} />
          </Tooltip>
          <Tooltip title="Eliminar">
            <Button 
              type="link" 
              danger 
              icon={<DeleteOutlined />} 
              onClick={() => showDeleteConfirm(record)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: isMobile ? 12 : 24 }}>
    <Card
    title={
        <Space size={isMobile ? 8 : 16}>
        <UserOutlined style={{ color: '#50EBEC', fontSize: isMobile ? 18 : 20 }} />
        <span style={{ fontSize: isMobile ? 16 : 18, fontWeight: 500 }}>Gestión de Usuarios</span>
        {isMobile && (
            <Tag color="#50EBEC" style={{ marginLeft: 8, fontSize: 12 }}>
            {users.length}
            </Tag>
        )}
        </Space>
    }
    extra={
        <Button 
        type="primary" 
        icon={<PlusOutlined />} 
        onClick={handleCreate}
        size={isMobile ? "middle" : "large"}
        style={{ 
            borderRadius: 10,
            height: isMobile ? 36 : 40,
            fontSize: isMobile ? 13 : 14
        }}
        >
        {isMobile ? "Nuevo" : "Nuevo Usuario"}
        </Button>
    }
    style={{ borderRadius: 16 }}
    styles={{ body: { padding: isMobile ? 16 : 24 } }}
    >
    <div style={{ 
        marginBottom: 16, 
        display: 'flex', 
        gap: 12, 
        flexWrap: 'wrap',
        flexDirection: isMobile ? 'column' : 'row'
    }}>
        <Input
        placeholder="Buscar por nombre, email..."
        prefix={<SearchOutlined />}
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        style={{ 
            width: isMobile ? '100%' : 300,
            borderRadius: 10,
            height: isMobile ? 42 : 40
        }}
        allowClear
        size="middle"
        />
        <Button 
        icon={<ReloadOutlined />} 
        onClick={fetchUsers}
        style={{ 
            borderRadius: 10,
            height: isMobile ? 42 : 40,
            width: isMobile ? '100%' : 'auto'
        }}
        >
        Actualizar
        </Button>
    </div>

    {isMobile ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {filteredUsers.map((user) => (
            <Card 
            key={user.id} 
            style={{ 
                marginBottom: 0, 
                borderRadius: 14,
                cursor: 'pointer',
                border: '1px solid #f0f0f0'
            }} 
            hoverable 
            onClick={() => handleViewDetails(user)}
            styles={{ body: { padding: 16 } }}
            >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Space size={12}>
                <Avatar 
                    icon={<UserOutlined />} 
                    style={{ 
                    backgroundColor: '#50EBEC',
                    width: 44,
                    height: 44,
                    lineHeight: '44px'
                    }} 
                />
                <div>
                    <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 4 }}>
                    {user.nombre} {user.primer_apellido}
                    </div>
                    <div style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>
                    <MailOutlined style={{ marginRight: 6, fontSize: 11 }} />
                    {user.email}
                    </div>
                    {user.telefono && (
                    <div style={{ fontSize: 12, color: '#666' }}>
                        <PhoneOutlined style={{ marginRight: 6, fontSize: 11 }} />
                        {user.telefono}
                    </div>
                    )}
                </div>
                </Space>
                <Tag color={user.activo ? 'green' : 'red'}>
                {user.activo ? 'Activo' : 'Inactivo'}
                </Tag>
            </div>
            </Card>
        ))}
        {filteredUsers.length === 0 && (
            <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>
            No se encontraron usuarios
            </div>
        )}
        </div>
    ) : (
        <Table
        columns={columns}
        dataSource={filteredUsers}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 10, showTotal: (total) => `Total ${total} usuarios` }}
        scroll={{ x: 1000 }}
        />
    )}
    </Card>

      {/* Modal para crear/editar usuario */}
      <Modal
        title={editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={handleSubmit}
        width={500}
        destroyOnHidden={true}
        mask={{ closable: false }}
        centered
      >
        <Form form={form} layout="vertical">
          <Form.Item name="nombre" label="Nombre" rules={[{ required: true, message: 'Ingrese el nombre' }]}>
            <Input placeholder="Ej: Juan" size="large" />
          </Form.Item>
          
          <Form.Item name="primer_apellido" label="Primer Apellido" rules={[{ required: true, message: 'Ingrese el primer apellido' }]}>
            <Input placeholder="Ej: Pérez" size="large" />
          </Form.Item>
          
          <Form.Item name="segundo_apellido" label="Segundo Apellido">
            <Input placeholder="Ej: Gómez (opcional)" size="large" />
          </Form.Item>
          
          <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email', message: 'Ingrese un email válido' }]}>
            <Input placeholder="ejemplo@correo.com" size="large" />
          </Form.Item>
          
          <Form.Item name="telefono" label="Teléfono">
            <Input placeholder="Ej: 555-1234" size="large" />
          </Form.Item>
          
          <Form.Item name="rol_id" label="Rol" rules={[{ required: true }]}>
            <Radio.Group 
              options={[
                { label: 'Administrador', value: 1 },
                { label: 'Médico', value: 2 },
              ]}
              optionType="button"
              buttonStyle="solid"
              size="large"
            />
          </Form.Item>
          
          {!editingUser && (
            <Form.Item name="password" label="Contraseña" rules={[{ required: true, min: 6, message: 'Mínimo 6 caracteres' }]}>
              <Input.Password placeholder="••••••" size="large" />
            </Form.Item>
          )}
        </Form>
      </Modal>

      {/* Modal para cambiar contraseña */}
      <Modal
        title="Cambiar Contraseña"
        open={passwordModalVisible}
        onCancel={() => setPasswordModalVisible(false)}
        onOk={handleChangePassword}
        destroyOnHidden={true}
        mask={{ closable: false }}
        width={450}
        centered
      >
        <Form form={passwordForm} layout="vertical">
          <Form.Item name="currentPassword" label="Contraseña actual" rules={[{ required: true, message: 'Ingrese su contraseña actual' }]}>
            <Input.Password placeholder="••••••" size="large" />
          </Form.Item>
          <Form.Item name="newPassword" label="Nueva contraseña" rules={[{ required: true, min: 6, message: 'Mínimo 6 caracteres' }]}>
            <Input.Password placeholder="••••••" size="large" />
          </Form.Item>
          <Form.Item name="confirmPassword" label="Confirmar nueva contraseña" rules={[{ required: true, message: 'Confirme la nueva contraseña' }]}>
            <Input.Password placeholder="••••••" size="large" />
          </Form.Item>
        </Form>
      </Modal>

      {/* MODAL PARA PC - Detalles del usuario (solo en desktop) */}
      {!isMobile && (
        <Modal
          title={null}
          open={detailModalVisible}
          onCancel={() => setDetailModalVisible(false)}
          footer={null}
          width={450}
          centered
          className="elegant-detail-modal"
        >
          {selectedUser && (
            <div>
              <div style={{ textAlign: 'center', marginBottom: 24 }}>
                <Avatar 
                  size={80} 
                  icon={<UserOutlined />} 
                  style={{ 
                    backgroundColor: '#50EBEC',
                    boxShadow: '0 4px 12px rgba(80, 235, 236, 0.3)'
                  }} 
                />
                <h2 style={{ marginTop: 16, marginBottom: 8 }}>
                  {selectedUser.nombre} {selectedUser.primer_apellido}
                </h2>
                <Tag color={selectedUser.rol_id === 1 ? 'gold' : 'blue'} style={{ fontSize: 13, padding: '4px 12px' }}>
                  {selectedUser.rol_id === 1 ? 'Administrador' : 'Médico'}
                </Tag>
              </div>

              <div style={{ 
                background: '#f8fafc', 
                borderRadius: 16, 
                padding: 20,
                marginBottom: 24 
              }}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
                  <MailOutlined style={{ color: '#50EBEC', fontSize: 18, width: 32 }} />
                  <div>
                    <div style={{ fontSize: 12, color: '#64748b' }}>Correo electrónico</div>
                    <div style={{ fontSize: 14, fontWeight: 500 }}>{selectedUser.email}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
                  <PhoneOutlined style={{ color: '#50EBEC', fontSize: 18, width: 32 }} />
                  <div>
                    <div style={{ fontSize: 12, color: '#64748b' }}>Teléfono</div>
                    <div style={{ fontSize: 14, fontWeight: 500 }}>{selectedUser.telefono || 'No registrado'}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <CheckCircleOutlined style={{ color: '#50EBEC', fontSize: 18, width: 32 }} />
                  <div>
                    <div style={{ fontSize: 12, color: '#64748b' }}>Estado</div>
                    <Tag color={selectedUser.activo ? 'success' : 'error'} style={{ margin: 0 }}>
                      {selectedUser.activo ? 'Activo' : 'Inactivo'}
                    </Tag>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 12 }}>
                <Button 
                  type="primary" 
                  icon={<EditOutlined />} 
                  onClick={() => {
                    setDetailModalVisible(false);
                    handleEdit(selectedUser);
                  }} 
                  block
                  style={{ borderRadius: 10, height: 44 }}
                >
                  Editar Usuario
                </Button>
                <Button 
                  icon={<LockOutlined />} 
                  onClick={() => {
                    setDetailModalVisible(false);
                    handleOpenPasswordModal(selectedUser.id!);
                  }} 
                  block
                  style={{ borderRadius: 10, height: 44 }}
                >
                  Contraseña
                </Button>
                <Button 
                  danger 
                  icon={<DeleteOutlined />} 
                  onClick={() => {
                    setDetailModalVisible(false);
                    showDeleteConfirm(selectedUser);
                  }} 
                  block
                  style={{ borderRadius: 10, height: 44 }}
                >
                  Eliminar
                </Button>
              </div>
            </div>
          )}
        </Modal>
      )}

      {/* DRAWER PARA MÓVIL - Detalles del usuario */}
      {isMobile && (
        <Drawer
          title="Detalles del Usuario"
          placement="bottom"
          open={detailDrawerVisible}
          onClose={() => setDetailDrawerVisible(false)}
          height="auto"
          className="mobile-details-drawer"
        >
          {selectedUser && (
            <div>
              <div style={{ textAlign: 'center', marginBottom: 24 }}>
                <Avatar 
                  size={70} 
                  icon={<UserOutlined />} 
                  style={{ backgroundColor: '#50EBEC' }} 
                />
                <h3 style={{ marginTop: 12, marginBottom: 4 }}>
                  {selectedUser.nombre} {selectedUser.primer_apellido}
                </h3>
                <Tag color={selectedUser.rol_id === 1 ? 'gold' : 'blue'}>
                  {selectedUser.rol_id === 1 ? 'Administrador' : 'Médico'}
                </Tag>
              </div>

              <div style={{ marginBottom: 20 }}>
                <div style={{ padding: '10px 0', borderBottom: '1px solid #f0f0f0' }}>
                  <div><Text type="secondary">Email</Text></div>
                  <div><Text strong>{selectedUser.email}</Text></div>
                </div>
                <div style={{ padding: '10px 0', borderBottom: '1px solid #f0f0f0' }}>
                  <div><Text type="secondary">Teléfono</Text></div>
                  <div><Text strong>{selectedUser.telefono || 'No registrado'}</Text></div>
                </div>
                <div style={{ padding: '10px 0' }}>
                  <div><Text type="secondary">Estado</Text></div>
                  <Tag color={selectedUser.activo ? 'success' : 'error'}>
                    {selectedUser.activo ? 'Activo' : 'Inactivo'}
                  </Tag>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <Button 
                  type="primary" 
                  icon={<EditOutlined />} 
                  onClick={() => {
                    setDetailDrawerVisible(false);
                    handleEdit(selectedUser);
                  }} 
                  block 
                  size="large"
                >
                  Editar Usuario
                </Button>
                <Button 
                  icon={<LockOutlined />} 
                  onClick={() => {
                    setDetailDrawerVisible(false);
                    handleOpenPasswordModal(selectedUser.id!);
                  }} 
                  block 
                  size="large"
                >
                  Cambiar Contraseña
                </Button>
                <Button 
                  danger 
                  icon={<DeleteOutlined />} 
                  onClick={() => {
                    setDetailDrawerVisible(false);
                    showDeleteConfirm(selectedUser);
                  }} 
                  block 
                  size="large"
                >
                  Eliminar Usuario
                </Button>
              </div>
            </div>
          )}
        </Drawer>
      )}
    </div>
  );
};

export default Usuarios;