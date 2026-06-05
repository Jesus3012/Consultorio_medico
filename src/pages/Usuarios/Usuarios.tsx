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
  Select,
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
  ShopOutlined,
  IdcardOutlined,
  MedicineBoxOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import userService, { type UserData } from '../../services/user/user.service';
import axiosInstance from '../../api/axios.config';
import { useAuth } from '../../hooks/useAuth';
import { App } from 'antd';
import './Usuarios.css';

const { useBreakpoint } = Grid;
const { Text } = Typography;

interface SucursalOption {
  id: number;
  empresaId: number;
  nombre: string;
}

const Usuarios: React.FC = () => {
  const { user } = useAuth();
  const { message, modal } = App.useApp();

  const [users, setUsers] = useState<UserData[]>([]);
  const [sucursales, setSucursales] = useState<SucursalOption[]>([]);
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
  const rolSeleccionado = Form.useWatch('rol_id', form);

  const getRolName = (rolId?: number) => {
    switch (rolId) {
      case 1:
        return 'Administrador';
      case 2:
        return 'Médico';
      case 3:
        return 'Auditor';
      default:
        return 'Usuario';
    }
  };

  const getRolColor = (rolId?: number) => {
    switch (rolId) {
      case 1:
        return 'gold';
      case 2:
        return 'blue';
      case 3:
        return 'green';
      default:
        return 'default';
    }
  };

  const getSucursalName = (sucursalId?: number | null) => {
    if (!sucursalId) return '-';
    return sucursales.find((s) => s.id === sucursalId)?.nombre || '-';
  };

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

  const fetchSucursales = async () => {
    try {
      const response = await axiosInstance.get('/sucursales', {
        params: { page: 1, limit: 100 },
      });

      const data = response.data?.data?.data || [];
      const empresaId = user?.empresa_id;

      const filtered = empresaId
        ? data.filter((item: any) => item.empresaId === empresaId)
        : data;

      setSucursales(filtered);
    } catch (error) {
      console.error('ERROR SUCURSALES:', error);
      message.error('No fue posible cargar los consultorios');
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchSucursales();
  }, [user?.empresa_id]);

  const showDeactivateConfirm = (usuario: UserData) => {
    modal.confirm({
      title: '¿Desactivar usuario?',
      icon: <ExclamationCircleOutlined style={{ color: '#faad14' }} />,
      centered: true,
      content: (
        <div>
          <p>El usuario no se eliminará, solo cambiará a estado inactivo.</p>
          <p>
            <strong>Usuario:</strong> {usuario.nombre} {usuario.primer_apellido}
          </p>
          <p>
            <strong>Email:</strong> {usuario.email}
          </p>
        </div>
      ),
      okText: 'Sí, desactivar',
      okType: 'danger',
      cancelText: 'Cancelar',
      onOk: async () => {
        try {
          await userService.deleteUsuario(usuario.id!);

          message.success('Usuario desactivado correctamente');

          setUsers((prev) =>
            prev.map((item) =>
              item.id === usuario.id
                ? {
                    ...item,
                    activo: false,
                  }
                : item
            )
          );

          setSelectedUser((prev) =>
            prev && prev.id === usuario.id
              ? {
                  ...prev,
                  activo: false,
                }
              : prev
          );
        } catch (error: any) {
          console.error('ERROR DESACTIVAR USUARIO:', error?.response?.data || error);
          message.error('Error al desactivar usuario');
        }
      },
    });
  };

  const handleCreate = () => {
    setEditingUser(null);
    form.resetFields();
    form.setFieldsValue({
      rol_id: 2,
      sucursal_id: undefined,
      cedula_profesional: '',
      especialidad: '',
    });
    setModalVisible(true);
  };

  const handleEdit = (usuario: UserData) => {
    setEditingUser(usuario);

    form.setFieldsValue({
      nombre: usuario.nombre,
      primer_apellido: usuario.primer_apellido,
      segundo_apellido: usuario.segundo_apellido,
      correo: usuario.email,
      telefono: usuario.telefono,
      rol_id: usuario.rol_id,
      sucursal_id: usuario.sucursal_id || undefined,
      cedula_profesional: usuario.cedula_profesional || '',
      especialidad: usuario.especialidad || '',
      activo: usuario.activo,
    });

    setModalVisible(true);
  };

  const handleViewDetails = (usuario: UserData) => {
    setSelectedUser(usuario);
    if (isMobile) setDetailDrawerVisible(true);
    else setDetailModalVisible(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      const submitData = {
        nombre: values.nombre,
        primer_apellido: values.primer_apellido,
        segundo_apellido: values.segundo_apellido || '',
        email: values.correo,
        password: values.password,
        telefono: values.telefono || '',
        rol_id: values.rol_id,
        sucursal_id: values.rol_id === 1 ? null : Number(values.sucursal_id),
        cedula_profesional: values.rol_id === 2 ? values.cedula_profesional || '' : '',
        especialidad: values.rol_id === 2 ? values.especialidad || '' : '',
        activo: editingUser ? values.activo : true,
      };

      if (editingUser) {
        await userService.updateUsuario(editingUser.id!, submitData);
        message.success('Usuario actualizado exitosamente');
      } else {
        await userService.createUsuario(submitData as any);
        message.success('Usuario creado exitosamente');
      }

      setModalVisible(false);
      form.resetFields();
      fetchUsers();
    } catch (error: any) {
      message.error(error?.message || 'Error al guardar usuario');
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
        newPassword: values.newPassword,
      });

      message.success('Contraseña actualizada exitosamente');
      setPasswordModalVisible(false);
    } catch (error) {
      message.error('Error al cambiar contraseña');
    }
  };

  const filteredUsers = users.filter((usuario) => {
    const fullText = `${usuario.nombre || ''} ${usuario.primer_apellido || ''} ${usuario.email || ''}`.toLowerCase();
    return fullText.includes(searchText.toLowerCase());
  });

  const columns: ColumnsType<UserData> = [
    {
      title: 'ID',
      dataIndex: 'id',
      width: 60,
      align: 'center',
    },
    {
      title: 'Usuario',
      key: 'nombre',
      render: (_, record) => (
        <Space>
          <Avatar icon={<UserOutlined />} className="user-avatar" />
          <span>
            {record.nombre} {record.primer_apellido}
          </span>
        </Space>
      ),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      ellipsis: true,
    },
    {
      title: 'Consultorio',
      dataIndex: 'sucursal_id',
      ellipsis: true,
      render: (sucursalId, record) =>
        record.rol_id === 1 ? '-' : getSucursalName(sucursalId),
    },
    {
      title: 'Teléfono',
      dataIndex: 'telefono',
      width: 120,
      align: 'center',
      responsive: ['xl'],
      render: (telefono) => (
        <span className="telefono-nowrap">{telefono || '-'}</span>
      ),
    },
    {
      title: 'Rol',
      dataIndex: 'rol_id',
      width: 120,
      align: 'center',
      render: (rolId) => (
        <Tag className="rol-tag" color={getRolColor(rolId)}>
          {getRolName(rolId)}
        </Tag>
      ),
    },
    {
      title: 'Estado',
      dataIndex: 'activo',
      width: 100,
      align: 'center',
      render: (activo) => (
        <Tag color={activo ? 'green' : 'red'}>
          {activo ? 'Activo' : 'Inactivo'}
        </Tag>
      ),
    },
    {
      title: 'Acciones',
      key: 'actions',
      width: 220,
      align: 'center',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Ver detalles">
            <Button type="link" icon={<EyeOutlined />} onClick={() => handleViewDetails(record)} />
          </Tooltip>

          <Tooltip title="Editar">
            <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(record)} />
          </Tooltip>

          <Tooltip title="Contraseña">
            <Button type="link" icon={<LockOutlined />} onClick={() => handleOpenPasswordModal(record.id!)} />
          </Tooltip>

          <Tooltip title={record.activo ? 'Desactivar' : 'Usuario inactivo'}>
            <Button
              type="link"
              danger
              icon={<DeleteOutlined />}
              disabled={!record.activo}
              onClick={() => showDeactivateConfirm(record)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  const UserDetailContent = () => {
    if (!selectedUser) return null;

    return (
      <div>
        <div className="user-detail-header">
          <Avatar size={80} icon={<UserOutlined />} className="user-detail-avatar" />

          <h2>
            {selectedUser.nombre} {selectedUser.primer_apellido}
          </h2>

          <Tag color={getRolColor(selectedUser.rol_id)} className="user-role-tag">
            {getRolName(selectedUser.rol_id)}
          </Tag>
        </div>

        <div className="user-detail-card">
          <div className="user-detail-row">
            <MailOutlined />
            <div>
              <div className="detail-label">Correo electrónico</div>
              <div className="detail-value">{selectedUser.email}</div>
            </div>
          </div>

          <div className="user-detail-row">
            <PhoneOutlined />
            <div>
              <div className="detail-label">Teléfono</div>
              <div className="detail-value">{selectedUser.telefono || 'No registrado'}</div>
            </div>
          </div>

          {selectedUser.rol_id !== 1 && (
            <div className="user-detail-row">
              <ShopOutlined />
              <div>
                <div className="detail-label">Consultorio</div>
                <div className="detail-value">{getSucursalName(selectedUser.sucursal_id)}</div>
              </div>
            </div>
          )}

          {selectedUser.rol_id === 2 && (
            <>
              <div className="user-detail-row">
                <IdcardOutlined />
                <div>
                  <div className="detail-label">Cédula Profesional</div>
                  <div className="detail-value">
                    {selectedUser.cedula_profesional || 'No registrada'}
                  </div>
                </div>
              </div>

              <div className="user-detail-row">
                <MedicineBoxOutlined />
                <div>
                  <div className="detail-label">Especialidad</div>
                  <div className="detail-value">
                    {selectedUser.especialidad || 'No registrada'}
                  </div>
                </div>
              </div>
            </>
          )}

          <div className="user-detail-row">
            <CheckCircleOutlined />
            <div>
              <div className="detail-label">Estado</div>
              <Tag color={selectedUser.activo ? 'success' : 'error'} style={{ margin: 0 }}>
                {selectedUser.activo ? 'Activo' : 'Inactivo'}
              </Tag>
            </div>
          </div>
        </div>

        <div className="user-detail-actions">
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => {
              setDetailModalVisible(false);
              setDetailDrawerVisible(false);
              handleEdit(selectedUser);
            }}
            block
          >
            Editar Usuario
          </Button>

          <Button
            icon={<LockOutlined />}
            onClick={() => {
              setDetailModalVisible(false);
              setDetailDrawerVisible(false);
              handleOpenPasswordModal(selectedUser.id!);
            }}
            block
          >
            Contraseña
          </Button>

          <Button
            danger
            icon={<DeleteOutlined />}
            disabled={!selectedUser.activo}
            onClick={() => {
              setDetailModalVisible(false);
              setDetailDrawerVisible(false);
              showDeactivateConfirm(selectedUser);
            }}
            block
          >
            Desactivar
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="usuarios-container">
      <Card
        title={
          <Space size={isMobile ? 8 : 16}>
            <UserOutlined className="card-title-icon" />
            <span className="card-title-text">Gestión de Usuarios</span>

            {isMobile && (
              <Tag color="#50EBEC" style={{ marginLeft: 8, fontSize: 12 }}>
                {users.length}
              </Tag>
            )}
          </Space>
        }
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
            {isMobile ? 'Nuevo' : 'Nuevo Usuario'}
          </Button>
        }
        className="usuarios-card"
      >
        <div className="usuarios-toolbar">
          <Input
            placeholder="Buscar por nombre, email..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            allowClear
          />

          <Button icon={<ReloadOutlined />} onClick={fetchUsers}>
            Actualizar
          </Button>
        </div>

        {isMobile ? (
          <div className="users-mobile-list">
            {filteredUsers.map((usuario) => (
              <Card
                key={usuario.id}
                className="user-mobile-card"
                hoverable
                onClick={() => handleViewDetails(usuario)}
              >
                <div className="user-mobile-header">
                  <Space size={12}>
                    <Avatar icon={<UserOutlined />} className="user-avatar mobile" />

                    <div>
                      <div className="mobile-user-name">
                        {usuario.nombre} {usuario.primer_apellido}
                      </div>

                      <div className="mobile-user-info">
                        <MailOutlined /> {usuario.email}
                      </div>

                      {usuario.telefono && (
                        <div className="mobile-user-info">
                          <PhoneOutlined /> {usuario.telefono}
                        </div>
                      )}

                      {usuario.rol_id !== 1 && (
                        <div className="mobile-user-info">
                          <ShopOutlined /> {getSucursalName(usuario.sucursal_id)}
                        </div>
                      )}

                      {usuario.rol_id === 2 && (
                        <>
                          <div className="mobile-user-info">
                            <IdcardOutlined /> {usuario.cedula_profesional || 'Sin cédula'}
                          </div>

                          <div className="mobile-user-info">
                            <MedicineBoxOutlined /> {usuario.especialidad || 'Sin especialidad'}
                          </div>
                        </>
                      )}
                    </div>
                  </Space>

                  <Tag color={usuario.activo ? 'green' : 'red'}>
                    {usuario.activo ? 'Activo' : 'Inactivo'}
                  </Tag>
                </div>

                <div className="mobile-user-tags">
                  <Tag color={getRolColor(usuario.rol_id)}>{getRolName(usuario.rol_id)}</Tag>
                </div>
              </Card>
            ))}

            {filteredUsers.length === 0 && (
              <div className="empty-users">No se encontraron usuarios</div>
            )}
          </div>
        ) : (
          <Table
            columns={columns}
            dataSource={filteredUsers}
            rowKey="id"
            loading={loading}
            pagination={{
              pageSize: 10,
              showTotal: (total) => `Total ${total} usuarios`,
            }}
          />
        )}
      </Card>

      <Modal
        title={editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={handleSubmit}
        width={560}
        destroyOnHidden
        mask={{ closable: false }}
        centered
      >
        <Form form={form} layout="vertical">
          <Form.Item name="nombre" label="Nombre" rules={[{ required: true, message: 'Ingrese el nombre' }]}>
            <Input placeholder="Ej: Juan" size="large" />
          </Form.Item>

          <Form.Item
            name="primer_apellido"
            label="Primer Apellido"
            rules={[{ required: true, message: 'Ingrese el primer apellido' }]}
          >
            <Input placeholder="Ej: Pérez" size="large" />
          </Form.Item>

          <Form.Item name="segundo_apellido" label="Segundo Apellido">
            <Input placeholder="Ej: Gómez (opcional)" size="large" />
          </Form.Item>

          <Form.Item
            name="correo"
            label="Correo"
            rules={[{ required: true, type: 'email', message: 'Ingrese un email válido' }]}
          >
            <Input placeholder="ejemplo@correo.com" size="large" />
          </Form.Item>

          <Form.Item name="telefono" label="Teléfono">
            <Input placeholder="Ej: 5551234567" size="large" />
          </Form.Item>

          <Form.Item name="rol_id" label="Rol" rules={[{ required: true, message: 'Seleccione un rol' }]}>
            <Radio.Group
              className="roles-radio-group"
              options={[
                { label: 'Administrador', value: 1 },
                { label: 'Médico', value: 2 },
                { label: 'Auditor', value: 3 },
              ]}
              optionType="button"
              buttonStyle="solid"
              size="large"
              onChange={(e) => {
                if (e.target.value === 1) {
                  form.setFieldsValue({
                    sucursal_id: undefined,
                    cedula_profesional: '',
                    especialidad: '',
                  });
                }

                if (e.target.value === 3) {
                  form.setFieldsValue({
                    cedula_profesional: '',
                    especialidad: '',
                  });
                }
              }}
            />
          </Form.Item>

          {rolSeleccionado !== 1 && (
            <Form.Item
              name="sucursal_id"
              label="Consultorio / Sucursal"
              rules={[{ required: true, message: 'Seleccione un consultorio' }]}
            >
              <Select
                size="large"
                placeholder="Seleccione un consultorio"
                options={sucursales.map((sucursal) => ({
                  label: sucursal.nombre,
                  value: sucursal.id,
                }))}
              />
            </Form.Item>
          )}

          {rolSeleccionado === 2 && (
            <>
              <Form.Item
                name="cedula_profesional"
                label="Cédula Profesional"
                rules={[{ required: true, message: 'Ingrese la cédula profesional' }]}
              >
                <Input placeholder="Ej: 1234567890" size="large" />
              </Form.Item>

              <Form.Item
                name="especialidad"
                label="Especialidad"
                rules={[{ required: true, message: 'Ingrese la especialidad' }]}
              >
                <Input placeholder="Ej: Cardiología" size="large" />
              </Form.Item>
            </>
          )}

          {editingUser && (
            <Form.Item name="activo" label="Estado" rules={[{ required: true, message: 'Seleccione el estado' }]}>
              <Select
                size="large"
                options={[
                  { label: 'Activo', value: true },
                  { label: 'Inactivo', value: false },
                ]}
              />
            </Form.Item>
          )}

          {!editingUser && (
            <Form.Item
              name="password"
              label="Contraseña"
              rules={[{ required: true, min: 6, message: 'Mínimo 6 caracteres' }]}
            >
              <Input.Password placeholder="••••••" size="large" />
            </Form.Item>
          )}
        </Form>
      </Modal>

      <Modal
        title="Cambiar Contraseña"
        open={passwordModalVisible}
        onCancel={() => setPasswordModalVisible(false)}
        onOk={handleChangePassword}
        destroyOnHidden
        mask={{ closable: false }}
        width={450}
        centered
      >
        <Form form={passwordForm} layout="vertical">
          <Form.Item
            name="newPassword"
            label="Nueva contraseña"
            rules={[{ required: true, min: 6, message: 'Mínimo 6 caracteres' }]}
          >
            <Input.Password placeholder="••••••" size="large" />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            label="Confirmar nueva contraseña"
            rules={[{ required: true, message: 'Confirme la nueva contraseña' }]}
          >
            <Input.Password placeholder="••••••" size="large" />
          </Form.Item>
        </Form>
      </Modal>

      {!isMobile && (
        <Modal
          title={null}
          open={detailModalVisible}
          onCancel={() => setDetailModalVisible(false)}
          footer={null}
          width={460}
          centered
          className="elegant-detail-modal"
        >
          <UserDetailContent />
        </Modal>
      )}

      {isMobile && (
        <Drawer
          title="Detalles del Usuario"
          placement="bottom"
          open={detailDrawerVisible}
          onClose={() => setDetailDrawerVisible(false)}
          size="large"
          className="mobile-details-drawer"
        >
          <UserDetailContent />
        </Drawer>
      )}
    </div>
  );
};

export default Usuarios;