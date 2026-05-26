import React, { useState } from 'react';
import { Card, Table, Button, Space, Modal, Form, Input, InputNumber, message, Tag, Popconfirm, Tooltip } from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  ShopOutlined,
  EnvironmentOutlined,
  PhoneOutlined,
  MailOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

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
  const [editingClinica, setEditingClinica] = useState<Clinica | null>(null);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  // Datos de ejemplo
  const [clinicas, setClinicas] = useState<Clinica[]>([
    { id: 1, nombre: 'Consultorio Médico Matriz', ubicacion: 'Av. Principal #123', telefono: '555-1234', email: 'matriz@medisys.com', capacidad: 50, estado: 'activo', pacientes: 1247 },
    { id: 2, nombre: 'Sucursal Norte', ubicacion: 'Calle Norte #456', telefono: '555-5678', email: 'norte@medisys.com', capacidad: 35, estado: 'activo', pacientes: 856 },
    { id: 3, nombre: 'Sucursal Sur', ubicacion: 'Av. Sur #789', telefono: '555-9012', email: 'sur@medisys.com', capacidad: 40, estado: 'activo', pacientes: 623 },
    { id: 4, nombre: 'Consultorio Especialidades', ubicacion: 'Blvd. Centro #321', telefono: '555-3456', email: 'especialidades@medisys.com', capacidad: 25, estado: 'inactivo', pacientes: 432 },
  ]);

  const columns: ColumnsType<Clinica> = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 70 },
    { title: 'Nombre', dataIndex: 'nombre', key: 'nombre', width: 200 },
    { title: 'Ubicación', dataIndex: 'ubicacion', key: 'ubicacion', render: (text) => <><EnvironmentOutlined /> {text}</> },
    { title: 'Teléfono', dataIndex: 'telefono', key: 'telefono', render: (text) => <><PhoneOutlined /> {text}</> },
    { title: 'Email', dataIndex: 'email', key: 'email', render: (text) => <><MailOutlined /> {text}</> },
    { title: 'Capacidad', dataIndex: 'capacidad', key: 'capacidad', align: 'center' as const },
    { title: 'Pacientes', dataIndex: 'pacientes', key: 'pacientes', align: 'center' as const },
    { 
      title: 'Estado', 
      dataIndex: 'estado', 
      key: 'estado',
      align: 'center' as const,
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
      render: (_, record) => (
        <Space>
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
    setModalVisible(true);
  };

  const handleEdit = (clinica: Clinica) => {
    setEditingClinica(clinica);
    form.setFieldsValue(clinica);
    setModalVisible(true);
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
        // Editar
        setClinicas(clinicas.map(c => c.id === editingClinica.id ? { ...c, ...values } : c));
        message.success('Consultorio actualizado exitosamente');
      } else {
        // Agregar
        const newId = Math.max(...clinicas.map(c => c.id), 0) + 1;
        setClinicas([...clinicas, { ...values, id: newId, pacientes: 0 }]);
        message.success('Consultorio agregado exitosamente');
      }
      
      setModalVisible(false);
      form.resetFields();
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Card
        title={
          <Space>
            <ShopOutlined style={{ color: '#50EBEC' }} />
            <span>Gestión de Consultorios</span>
          </Space>
        }
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            Agregar Consultorio
          </Button>
        }
        className="clinicas-card"
      >
        <Table
          columns={columns}
          dataSource={clinicas}
          rowKey="id"
          pagination={{ pageSize: 10, showTotal: (total) => `Total ${total} consultorios` }}
        />
      </Card>

      <Modal
        title={editingClinica ? 'Editar Consultorio' : 'Agregar Consultorio'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={handleSubmit}
        confirmLoading={loading}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="nombre"
            label="Nombre del Consultorio"
            rules={[{ required: true, message: 'Por favor ingrese el nombre' }]}
          >
            <Input placeholder="Ej: Consultorio Médico Matriz" />
          </Form.Item>
          
          <Form.Item
            name="ubicacion"
            label="Ubicación"
            rules={[{ required: true, message: 'Por favor ingrese la ubicación' }]}
          >
            <Input placeholder="Ej: Av. Principal #123" />
          </Form.Item>
          
          <Form.Item
            name="telefono"
            label="Teléfono"
            rules={[{ required: true, message: 'Por favor ingrese el teléfono' }]}
          >
            <Input placeholder="Ej: 555-1234" />
          </Form.Item>
          
          <Form.Item
            name="email"
            label="Correo Electrónico"
            rules={[
              { required: true, message: 'Por favor ingrese el email' },
              { type: 'email', message: 'Email inválido' }
            ]}
          >
            <Input placeholder="Ej: consultorio@medisys.com" />
          </Form.Item>
          
          <Form.Item
            name="capacidad"
            label="Capacidad (máx. pacientes)"
            rules={[{ required: true, message: 'Por favor ingrese la capacidad' }]}
          >
            <InputNumber min={1} max={200} style={{ width: '100%' }} />
          </Form.Item>
          
          <Form.Item
            name="estado"
            label="Estado"
            rules={[{ required: true, message: 'Por favor seleccione el estado' }]}
          >
            <Input.Group compact>
              <Button
                type={form.getFieldValue('estado') === 'activo' ? 'primary' : 'default'}
                onClick={() => form.setFieldsValue({ estado: 'activo' })}
              >
                Activo
              </Button>
              <Button
                type={form.getFieldValue('estado') === 'inactivo' ? 'primary' : 'default'}
                onClick={() => form.setFieldsValue({ estado: 'inactivo' })}
              >
                Inactivo
              </Button>
            </Input.Group>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Clinicas;