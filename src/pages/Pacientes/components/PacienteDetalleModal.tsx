import React from 'react';
import { Avatar, Button, Descriptions, Modal, Typography } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import type { PacienteData } from '../../../services/pacientes/pacientes.service';

const { Title, Text } = Typography;

type Props = {
  open: boolean;
  paciente: PacienteData | null;
  onClose: () => void;
  onConsulta: (paciente: PacienteData) => void;
};

const formatDate = (fecha?: string) => {
  if (!fecha) return '-';
  return fecha.split('T')[0];
};

const getFullName = (paciente: PacienteData) =>
  `${paciente.nombre || ''} ${paciente.primer_apellido || ''} ${paciente.segundo_apellido || ''}`
    .replace(/\s+/g, ' ')
    .trim();

const PacienteDetalleModal: React.FC<Props> = ({ open, paciente, onClose, onConsulta }) => {
  if (!paciente) return null;

  return (
    <Modal
      open={open}
      onCancel={onClose}
      width={850}
      title="Información del paciente"
      footer={[
        <Button key="close" onClick={onClose}>
          Cerrar
        </Button>,
        <Button key="consulta" type="primary" onClick={() => onConsulta(paciente)}>
          Ir a consulta externa
        </Button>,
      ]}
    >
      <div className="paciente-detail-header">
        <Avatar size={72} icon={<UserOutlined />} className="paciente-detail-avatar" />

        <div>
          <Title level={4}>{getFullName(paciente)}</Title>
          <Text type="secondary">{paciente.correo || 'Sin correo registrado'}</Text>
        </div>
      </div>

      <Descriptions bordered column={2} size="small" className="paciente-detail-descriptions">
        <Descriptions.Item label="Expediente">
          {paciente.numero_expediente || '-'}
        </Descriptions.Item>

        <Descriptions.Item label="Fecha nacimiento">
          {formatDate(paciente.fecha_nacimiento)}
        </Descriptions.Item>

        <Descriptions.Item label="CURP">{paciente.curp || '-'}</Descriptions.Item>

        <Descriptions.Item label="Sexo">{paciente.sexo || '-'}</Descriptions.Item>

        <Descriptions.Item label="Tipo sangre">{paciente.tipo_sangre || '-'}</Descriptions.Item>

        <Descriptions.Item label="Estado civil">{paciente.estado_civil || '-'}</Descriptions.Item>

        <Descriptions.Item label="Lugar origen">{paciente.lugar_origen || '-'}</Descriptions.Item>

        <Descriptions.Item label="País nacimiento">{paciente.pais_nacimiento || '-'}</Descriptions.Item>

        <Descriptions.Item label="Teléfono">{paciente.telefono || '-'}</Descriptions.Item>

        <Descriptions.Item label="Celular">{paciente.celular || '-'}</Descriptions.Item>

        <Descriptions.Item label="Escolaridad">{paciente.escolaridad || '-'}</Descriptions.Item>

        <Descriptions.Item label="Ocupación">{paciente.ocupacion || '-'}</Descriptions.Item>
      </Descriptions>
    </Modal>
  );
};

export default PacienteDetalleModal;