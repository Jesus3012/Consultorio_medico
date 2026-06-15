import React, { useEffect } from 'react';
import { Button, Col, Form, Input, Modal, Row, Select, Typography } from 'antd';
import {
  UserOutlined,
  HeartOutlined,
  PhoneOutlined,
  IdcardOutlined,
  SaveOutlined,
} from '@ant-design/icons';
import type { PacienteData } from '../../../services/pacientes/pacientes.service';
import './PacienteEditModal.css';

const { Text } = Typography;

type Props = {
  open: boolean;
  paciente: PacienteData | null;
  loading: boolean;
  onClose: () => void;
  onSubmit: (values: PacienteData) => void;
};

const formatDate = (fecha?: string) => {
  if (!fecha) return '';
  return fecha.split('T')[0];
};

const PacienteEditModal: React.FC<Props> = ({ open, paciente, loading, onClose, onSubmit }) => {
  const [form] = Form.useForm<PacienteData>();

  useEffect(() => {
    if (paciente && open) {
      form.setFieldsValue({
        ...paciente,
        fecha_nacimiento: formatDate(paciente.fecha_nacimiento),
      });
    }

    if (!open) {
      form.resetFields();
    }
  }, [paciente, open, form]);

  return (
    <Modal
      open={open}
      title={null}
      onCancel={onClose}
      width={940}
      centered
      className="paciente-edit-modal"
      footer={[
        <Button key="cancel" onClick={onClose}>
          Cancelar
        </Button>,
        <Button
          key="save"
          type="primary"
          loading={loading}
          icon={<SaveOutlined />}
          onClick={() => form.submit()}
        >
          Guardar cambios
        </Button>,
      ]}
    >
      <div className="paciente-edit-header">
        <div className="paciente-edit-header-icon">
          <UserOutlined />
        </div>

        <div>
          <Text className="paciente-edit-eyebrow">Editar paciente</Text>
          <h2>Actualizar información del paciente</h2>
          <p>Modifica los datos necesarios y guarda los cambios al finalizar.</p>
        </div>
      </div>

      <Form form={form} layout="vertical" onFinish={onSubmit} className="paciente-edit-form">
        <section className="paciente-edit-section">
          <div className="paciente-edit-section-title">
            <UserOutlined />
            <div>
              <h3>Identidad del paciente</h3>
              <span>Nombre, nacimiento y datos generales</span>
            </div>
          </div>

          <Row gutter={[16, 4]}>
            <Col xs={24} md={8}>
              <Form.Item
                name="nombre"
                label="Nombre"
                rules={[{ required: true, message: 'Ingresa el nombre' }]}
              >
                <Input placeholder="Nombre del paciente" />
              </Form.Item>
            </Col>

            <Col xs={24} md={8}>
              <Form.Item
                name="primer_apellido"
                label="Primer apellido"
                rules={[{ required: true, message: 'Ingresa el primer apellido' }]}
              >
                <Input placeholder="Primer apellido" />
              </Form.Item>
            </Col>

            <Col xs={24} md={8}>
              <Form.Item name="segundo_apellido" label="Segundo apellido">
                <Input placeholder="Segundo apellido" />
              </Form.Item>
            </Col>

            <Col xs={24} md={8}>
              <Form.Item
                name="fecha_nacimiento"
                label="Fecha nacimiento"
                rules={[{ required: true, message: 'Selecciona la fecha de nacimiento' }]}
              >
                <Input type="date" />
              </Form.Item>
            </Col>

            <Col xs={24} md={8}>
              <Form.Item name="sexo" label="Sexo">
                <Select
                  placeholder="Seleccionar"
                  allowClear
                  options={[
                    { value: 'F', label: 'Femenino' },
                    { value: 'M', label: 'Masculino' },
                  ]}
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={8}>
              <Form.Item name="estado_civil" label="Estado civil">
                <Select
                  placeholder="Seleccionar"
                  allowClear
                  options={[
                    { value: 'SOLTERO/A', label: 'Soltero/a' },
                    { value: 'CASADO/A', label: 'Casado/a' },
                    { value: 'UNIÓN LIBRE', label: 'Unión libre' },
                    { value: 'DIVORCIADO/A', label: 'Divorciado/a' },
                    { value: 'VIUDO/A', label: 'Viudo/a' },
                  ]}
                />
              </Form.Item>
            </Col>

            <Col xs={24}>
              <Form.Item name="curp" label="CURP">
                <Input maxLength={18} placeholder="CURP del paciente" />
              </Form.Item>
            </Col>
          </Row>
        </section>

        <section className="paciente-edit-section">
          <div className="paciente-edit-section-title">
            <HeartOutlined />
            <div>
              <h3>Datos médicos y expediente</h3>
              <span>Información clínica básica</span>
            </div>
          </div>

          <Row gutter={[16, 4]}>
            <Col xs={24} md={8}>
              <Form.Item name="numero_expediente" label="Número expediente">
                <Input prefix={<IdcardOutlined />} placeholder="Ej. EXP-001" />
              </Form.Item>
            </Col>

            <Col xs={24} md={8}>
              <Form.Item name="tipo_sangre" label="Tipo sangre">
                <Select
                  placeholder="Seleccionar"
                  allowClear
                  options={['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((v) => ({
                    value: v,
                    label: v,
                  }))}
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={8}>
              <Form.Item name="escolaridad" label="Escolaridad">
                <Input placeholder="Ej. Licenciatura, Bachillerato..." />
              </Form.Item>
            </Col>

            <Col xs={24} md={8}>
              <Form.Item name="ocupacion" label="Ocupación">
                <Input placeholder="Ocupación actual" />
              </Form.Item>
            </Col>

            <Col xs={24} md={8}>
              <Form.Item name="lugar_origen" label="Lugar de origen">
                <Input placeholder="Ciudad o estado" />
              </Form.Item>
            </Col>

            <Col xs={24} md={8}>
              <Form.Item name="pais_nacimiento" label="País de nacimiento">
                <Input placeholder="País de nacimiento" />
              </Form.Item>
            </Col>
          </Row>
        </section>

        <section className="paciente-edit-section">
          <div className="paciente-edit-section-title">
            <PhoneOutlined />
            <div>
              <h3>Contacto</h3>
              <span>Teléfono, celular y correo electrónico</span>
            </div>
          </div>

          <Row gutter={[16, 4]}>
            <Col xs={24} md={8}>
              <Form.Item name="telefono" label="Teléfono">
                <Input placeholder="Teléfono fijo" />
              </Form.Item>
            </Col>

            <Col xs={24} md={8}>
              <Form.Item name="celular" label="Celular">
                <Input placeholder="Número celular" />
              </Form.Item>
            </Col>

            <Col xs={24} md={8}>
              <Form.Item
                name="correo"
                label="Correo"
                rules={[{ type: 'email', message: 'Ingresa un correo válido' }]}
              >
                <Input placeholder="correo@ejemplo.com" />
              </Form.Item>
            </Col>
          </Row>
        </section>
      </Form>
    </Modal>
  );
};

export default PacienteEditModal;