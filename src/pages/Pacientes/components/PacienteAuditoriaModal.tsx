import React from 'react';
import { Empty, Modal, Spin, Timeline, Tag } from 'antd';
import {
  ClockCircleOutlined,
  EditOutlined,
  DeleteOutlined,
  PlusCircleOutlined,
} from '@ant-design/icons';

type Props = {
  open: boolean;
  loading: boolean;
  auditoria: any[];
  onClose: () => void;
};

const getActionIcon = (accion?: string) => {
  const value = String(accion || '').toLowerCase();

  if (value.includes('crear') || value.includes('insert')) return <PlusCircleOutlined />;
  if (value.includes('eliminar') || value.includes('delete')) return <DeleteOutlined />;
  if (value.includes('editar') || value.includes('update')) return <EditOutlined />;

  return <ClockCircleOutlined />;
};

const getActionColor = (accion?: string) => {
  const value = String(accion || '').toLowerCase();

  if (value.includes('crear') || value.includes('insert')) return 'green';
  if (value.includes('eliminar') || value.includes('delete')) return 'red';
  if (value.includes('editar') || value.includes('update')) return 'blue';

  return 'default';
};

const PacienteAuditoriaModal: React.FC<Props> = ({ open, loading, auditoria, onClose }) => {
  return (
    <Modal
      open={open}
      title="Historial de movimientos"
      onCancel={onClose}
      footer={null}
      width={760}
    >
      {loading ? (
        <div className="paciente-audit-loading">
          <Spin />
        </div>
      ) : auditoria.length ? (
        <Timeline
          className="paciente-audit-timeline"
          items={auditoria.map((item, index) => {
            const accion = item.accion || item.action || item.tipo || 'Movimiento';
            const fecha = item.fecha || item.created_at || item.fecha_registro || '-';
            const usuario = item.usuario || item.user || item.responsable || 'Sistema';

            return {
              dot: getActionIcon(accion),
              children: (
                <div className="paciente-audit-card" key={index}>
                  <div className="paciente-audit-card-head">
                    <Tag color={getActionColor(accion)}>{accion}</Tag>
                    <span>{fecha}</span>
                  </div>

                  <strong>Responsable: {usuario}</strong>

                  {item.descripcion && <p>{item.descripcion}</p>}

                  {!item.descripcion && (
                    <p>Se registró un movimiento en el expediente del paciente.</p>
                  )}
                </div>
              ),
            };
          })}
        />
      ) : (
        <Empty description="Este paciente aún no tiene movimientos registrados" />
      )}
    </Modal>
  );
};

export default PacienteAuditoriaModal;