import React, { useState } from 'react';
import { Card, Table, Button, Space, Modal, Form, Input, InputNumber, message, Tag, Popconfirm, Tooltip, Grid, Drawer, List } from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  ShopOutlined,
  EnvironmentOutlined,
  PhoneOutlined,
  MailOutlined,
  CloseOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

const { useBreakpoint } = Grid;

interface Clinica {
  id: number;
  nombre: string;
  ubicacion: string;
  telefono: string;
  email: string;
  capacidad: number;
  estado: 'activo' | 'inactivo';
  pacientes: number;
}

const Clinicas: React.FC = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [selectedClinica, setSelectedClinica] = useState<Clinica | null>(null);
  const [editingClinica, setEditingClinica] = useState<Clinica | null>(null);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  // Datos de ejemplo
  const [clinicas, setClinicas] = useState<Clinica[]>([
    { id: 1, nombre: 'Consultorio Médico Matriz', ubicacion: 'Av. Principal #123', telefono: '555-1234', email: 'matriz@medisys.com', capacidad: 50, estado: 'activo', pacientes: 1247 },
    { id: 2, nombre: 'Sucursal Norte', ubicacion: 'Calle Norte #456', telefono: '555-5678', email: 'norte@medisys.com', capacidad: 35, estado: 'activo', pacientes: 856 },
    { id: 3, nombre: 'Sucursal Sur', ubicacion: 'Av. Sur #789', telefono: '555-9012', email: 'sur@medisys.com', capacidad: 40, estado: 'activo', pacientes: 623 },
    { id: 4, nombre: 'Consultorio Especialidades', ubicacion: 'Blvd. Centro #321', telefono: '555-3456', email: 'especialidades@medisys.com', capacidad: 25, estado: 'inactivo', pacientes: 432 },
  ]);

  // Columnas para desktop
  const columns: ColumnsType<Clinica> = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 70 },
    { title: 'Nombre', dataIndex: 'nombre', key: 'nombre', width: 200, ellipsis: true },
    { title: 'Ubicación', dataIndex: 'ubicacion', key: 'ubicacion', ellipsis: true, render: (text) => <><EnvironmentOutlined /> {text}</> },
    { title: 'Teléfono', dataIndex: 'telefono', key: 'telefono', render: (text) => <><PhoneOutlined /> {text}</> },
    { title: 'Email', dataIndex: 'email', key: 'email', ellipsis: true, render: (text) => <><MailOutlined /> {text}</> },
    { title: 'Capacidad', dataIndex: 'capacidad', key: 'capacidad', align: 'center' as const, width: 90 },
    { title: 'Pacientes', dataIndex: 'pacientes', key: 'pacientes', align: 'center' as const, width: 90 },
    { 
      title: 'Estado', 
      dataIndex: 'estado', 
      key: 'estado',
      align: 'center' as const,
      width: 100,
      render: (estado) => (
        <Tag color={estado === 'activo' ? 'success' : 'default'}>
          {estado === 'activo' ? 'Activo' : 'Inactivo'}
        </Tag>
      )
    },
    {
      title: 'Acciones',
      key: 'acciones',
      align: 'center' as const,
      width: 120,
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Editar">
            <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(record)} />
          </Tooltip>
          <Popconfirm
            title="¿Eliminar consultorio?"
            description="¿Estás seguro de eliminar este consultorio?"
            onConfirm={() => handleDelete(record.id)}
            okText="Sí"
            cancelText="No"
          >
            <Tooltip title="Eliminar">
              <Button type="link" danger icon={<DeleteOutlined />} />
            </Tooltip>
          </Popconfirm>
        </Space>
      )
    }
  ];

  const handleAdd = () => {
    setEditingClinica(null);
    form.resetFields();
    form.setFieldsValue({ estado: 'activo' });
    if (isMobile) {
      setDrawerVisible(true);
    } else {
      setModalVisible(true);
    }
  };

  const handleEdit = (clinica: Clinica) => {
    setEditingClinica(clinica);
    form.setFieldsValue(clinica);
    if (isMobile) {
      setDrawerVisible(true);
    } else {
      setModalVisible(true);
    }
  };

  const handleView = (clinica: Clinica) => {
    setSelectedClinica(clinica);
    setDrawerVisible(true);
  };

  const handleDelete = (id: number) => {
    setClinicas(clinicas.filter(c => c.id !== id));
    message.success('Consultorio eliminado exitosamente');
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      
      if (editingClinica) {
        setClinicas(clinicas.map(c => c.id === editingClinica.id ? { ...c, ...values } : c));
        message.success('Consultorio actualizado exitosamente');
      } else {
        const newId = Math.max(...clinicas.map(c => c.id), 0) + 1;
        setClinicas([...clinicas, { ...values, id: newId, pacientes: 0 }]);
        message.success('Consultorio agregado exitosamente');
      }
      
      setModalVisible(false);
      setDrawerVisible(false);
      form.resetFields();
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Formulario compartido para modal y drawer
  const FormContent = () => (
    <Form form={form} layout="vertical">
      <Form.Item
        name="nombre"
        label="Nombre del Consultorio"
        rules={[{ required: true, message: 'Por favor ingrese el nombre' }]}
      >
        <Input placeholder="Ej: Consultorio Médico Matriz" size="large" />
      </Form.Item>
      
      <Form.Item
        name="ubicacion"
        label="Ubicación"
        rules={[{ required: true, message: 'Por favor ingrese la ubicación' }]}
      >
        <Input placeholder="Ej: Av. Principal #123" size="large" />
      </Form.Item>
      
      <Form.Item
        name="telefono"
        label="Teléfono"
        rules={[{ required: true, message: 'Por favor ingrese el teléfono' }]}
      >
        <Input placeholder="Ej: 555-1234" size="large" />
      </Form.Item>
      
      <Form.Item
        name="email"
        label="Correo Electrónico"
        rules={[
          { required: true, message: 'Por favor ingrese el email' },
          { type: 'email', message: 'Email inválido' }
        ]}
      >
        <Input placeholder="Ej: consultorio@medisys.com" size="large" />
      </Form.Item>
      
      <Form.Item
        name="capacidad"
        label="Capacidad (máx. pacientes)"
        rules={[{ required: true, message: 'Por favor ingrese la capacidad' }]}
      >
        <InputNumber min={1} max={200} style={{ width: '100%' }} size="large" />
      </Form.Item>
      
      <Form.Item
        name="estado"
        label="Estado"
        rules={[{ required: true, message: 'Por favor seleccione el estado' }]}
        initialValue="activo"
      >
        <Space.Compact block>
          <Button
            type={form.getFieldValue('estado') === 'activo' ? 'primary' : 'default'}
            onClick={() => form.setFieldsValue({ estado: 'activo' })}
            style={{ flex: 1 }}
          >
            Activo
          </Button>
          <Button
            type={form.getFieldValue('estado') === 'inactivo' ? 'primary' : 'default'}
            onClick={() => form.setFieldsValue({ estado: 'inactivo' })}
            style={{ flex: 1 }}
          >
            Inactivo
          </Button>
        </Space.Compact>
      </Form.Item>
    </Form>
  );

  // Vista de detalles para móvil
  const DetailsView = () => (
    <div className="clinica-details">
      <div className="detail-item">
        <EnvironmentOutlined style={{ color: '#50EBEC', fontSize: 18 }} />
        <div>
          <div className="detail-label">Ubicación</div>
          <div className="detail-value">{selectedClinica?.ubicacion}</div>
        </div>
      </div>
      <div className="detail-item">
        <PhoneOutlined style={{ color: '#50EBEC', fontSize: 18 }} />
        <div>
          <div className="detail-label">Teléfono</div>
          <div className="detail-value">{selectedClinica?.telefono}</div>
        </div>
      </div>
      <div className="detail-item">
        <MailOutlined style={{ color: '#50EBEC', fontSize: 18 }} />
        <div>
          <div className="detail-label">Email</div>
          <div className="detail-value">{selectedClinica?.email}</div>
        </div>
      </div>
      <div className="detail-row">
        <div className="detail-col">
          <div className="detail-label">Capacidad</div>
          <div className="detail-value">{selectedClinica?.capacidad} pacientes</div>
        </div>
        <div className="detail-col">
          <div className="detail-label">Pacientes</div>
          <div className="detail-value">{selectedClinica?.pacientes}</div>
        </div>
        <div className="detail-col">
          <div className="detail-label">Estado</div>
          <Tag color={selectedClinica?.estado === 'activo' ? 'success' : 'default'} style={{ margin: 0 }}>
            {selectedClinica?.estado === 'activo' ? 'Activo' : 'Inactivo'}
          </Tag>
        </div>
      </div>
      <div className="detail-actions">
        <Button 
          type="primary" 
          icon={<EditOutlined />} 
          onClick={() => {
            setDrawerVisible(false);
            setTimeout(() => handleEdit(selectedClinica!), 100);
          }}
          block
        >
          Editar Consultorio
        </Button>
        <Popconfirm
          title="¿Eliminar consultorio?"
          description="¿Estás seguro de eliminar este consultorio?"
          onConfirm={() => {
            handleDelete(selectedClinica!.id);
            setDrawerVisible(false);
          }}
          okText="Sí"
          cancelText="No"
        >
          <Button danger icon={<DeleteOutlined />} block style={{ marginTop: 12 }}>
            Eliminar Consultorio
          </Button>
        </Popconfirm>
      </div>
    </div>
  );

  // Vista de lista para móvil
  const MobileList = () => (
    <List
      dataSource={clinicas}
      renderItem={(item) => (
        <Card 
          className="clinica-card-mobile"
          hoverable
          onClick={() => handleView(item)}
        >
          <div className="clinica-card-header">
            <Space>
              <ShopOutlined style={{ color: '#50EBEC', fontSize: 20 }} />
              <span className="clinica-card-title">{item.nombre}</span>
            </Space>
            <Tag color={item.estado === 'activo' ? 'success' : 'default'}>
              {item.estado === 'activo' ? 'Activo' : 'Inactivo'}
            </Tag>
          </div>
          <div className="clinica-card-info">
            <div className="info-row">
              <EnvironmentOutlined style={{ color: '#50EBEC' }} />
              <span>{item.ubicacion}</span>
            </div>
            <div className="info-row">
              <PhoneOutlined style={{ color: '#50EBEC' }} />
              <span>{item.telefono}</span>
            </div>
            <div className="info-stats">
              <div className="stat">
                <span className="stat-label">Pacientes</span>
                <span className="stat-value">{item.pacientes}</span>
              </div>
              <div className="stat">
                <span className="stat-label">Capacidad</span>
                <span className="stat-value">{item.capacidad}</span>
              </div>
            </div>
          </div>
        </Card>
      )}
    />
  );

  return (
    <div className="clinicas-container">
      <Card
        title={
          <Space>
            <ShopOutlined style={{ color: '#50EBEC' }} />
            <span>Gestión de Consultorios</span>
          </Space>
        }
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            Agregar
          </Button>
        }
        className="clinicas-card"
      >
        {isMobile ? (
          <MobileList />
        ) : (
          <Table
            columns={columns}
            dataSource={clinicas}
            rowKey="id"
            pagination={{ pageSize: 10, showTotal: (total) => `Total ${total} consultorios` }}
            scroll={{ x: 1000 }}
          />
        )}
      </Card>

      {/* Modal para Desktop */}
      {!isMobile && (
        <Modal
          title={editingClinica ? 'Editar Consultorio' : 'Agregar Consultorio'}
          open={modalVisible}
          onCancel={() => setModalVisible(false)}
          onOk={handleSubmit}
          confirmLoading={loading}
          width={600}
        >
          <FormContent />
        </Modal>
      )}

      {/* Drawer para Móvil - Formulario */}
      {isMobile && (
        <Drawer
          title={editingClinica ? 'Editar Consultorio' : 'Agregar Consultorio'}
          placement="bottom"
          open={drawerVisible && !selectedClinica}
          onClose={() => {
            setDrawerVisible(false);
            setSelectedClinica(null);
            form.resetFields();
          }}
          height="auto"
          className="clinica-drawer"
        >
          <FormContent />
          <div className="drawer-actions">
            <Button onClick={() => {
              setDrawerVisible(false);
              setSelectedClinica(null);
            }} block>
              Cancelar
            </Button>
            <Button type="primary" onClick={handleSubmit} loading={loading} block>
              {editingClinica ? 'Actualizar' : 'Agregar'}
            </Button>
          </div>
        </Drawer>
      )}

      {/* Drawer para Móvil - Detalles */}
      {isMobile && (
        <Drawer
          title={selectedClinica?.nombre}
          placement="bottom"
          open={drawerVisible && !!selectedClinica}
          onClose={() => {
            setDrawerVisible(false);
            setSelectedClinica(null);
          }}
          height="auto"
          className="clinica-drawer"
          closeIcon={<CloseOutlined />}
        >
          <DetailsView />
        </Drawer>
      )}
    </div>
  );
};

export default Clinicas;