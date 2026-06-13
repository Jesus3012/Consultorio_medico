import React, { useEffect, useMemo, useState } from 'react';
import {
  Avatar,
  Button,
  Card,
  Col,
  Drawer,
  Empty,
  Form,
  Input,
  Modal,
  Row,
  Select,
  Space,
  Spin,
  Switch,
  Table,
  Tag,
  Typography,
  Tooltip,
  App,
  Divider,
  Pagination,
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  UserOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  HistoryOutlined,
  ReloadOutlined,
  SyncOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import Swal from 'sweetalert2';
import PacientesService, {
  type PacienteData,
} from '../../services/pacientes/pacientes.service';
import './Pacientes.css';

const { Title, Text } = Typography;

const generarCurpGenerica = () => {
  const letras = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numeros = '0123456789';

  return `XEXX010101MNEXXX${
    letras.charAt(Math.floor(Math.random() * letras.length))
  }${numeros.charAt(Math.floor(Math.random() * numeros.length))}`;
};

const Pacientes: React.FC = () => {
  const [form] = Form.useForm<PacienteData>();
  const { message } = App.useApp();

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [pacientes, setPacientes] = useState<PacienteData[]>([]);

  const [nombreBusqueda, setNombreBusqueda] = useState('');
  const [primerApellidoBusqueda, setPrimerApellidoBusqueda] = useState('');
  const [segundoApellidoBusqueda, setSegundoApellidoBusqueda] = useState('');
  const [fechaNacimientoBusqueda, setFechaNacimientoBusqueda] = useState('');
  const [numeroExpedienteBusqueda, setNumeroExpedienteBusqueda] = useState('');

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [auditOpen, setAuditOpen] = useState(false);

  const [selectedPaciente, setSelectedPaciente] = useState<PacienteData | null>(null);
  const [auditoria, setAuditoria] = useState<any[]>([]);
  const [auditLoading, setAuditLoading] = useState(false);
  const [usarCurpGenerica, setUsarCurpGenerica] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const desktopPageSize = 10;
  const mobilePageSize = 5;

  const isEditing = Boolean(selectedPaciente?.id && drawerOpen);

  const loadPacientes = async () => {
    try {
      setLoading(true);
      const data = await PacientesService.getPacientes();
      setPacientes(data);
    } catch (error) {
      console.error(error);
      message.error('No fue posible cargar los pacientes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPacientes();
  }, []);

  const getFullName = (paciente: PacienteData) =>
    `${paciente.nombre || ''} ${paciente.primer_apellido || ''} ${
      paciente.segundo_apellido || ''
    }`
      .replace(/\s+/g, ' ')
      .trim();

  const formatDate = (fecha?: string) => {
    if (!fecha) return '-';
    return fecha.split('T')[0];
  };

  const resetPagination = () => setCurrentPage(1);

  const limpiarBusqueda = () => {
    setNombreBusqueda('');
    setPrimerApellidoBusqueda('');
    setSegundoApellidoBusqueda('');
    setFechaNacimientoBusqueda('');
    setNumeroExpedienteBusqueda('');
    resetPagination();
  };

  const filteredPacientes = useMemo(() => {
    return pacientes.filter((paciente) => {
      const nombre = String(paciente.nombre || '').toLowerCase();
      const primerApellido = String(paciente.primer_apellido || '').toLowerCase();
      const segundoApellido = String(paciente.segundo_apellido || '').toLowerCase();
      const fechaNacimiento = formatDate(paciente.fecha_nacimiento);
      const numeroExpediente = String(paciente.numero_expediente || '').toLowerCase();

      return (
        (!nombreBusqueda || nombre.includes(nombreBusqueda.toLowerCase().trim())) &&
        (!primerApellidoBusqueda ||
          primerApellido.includes(primerApellidoBusqueda.toLowerCase().trim())) &&
        (!segundoApellidoBusqueda ||
          segundoApellido.includes(segundoApellidoBusqueda.toLowerCase().trim())) &&
        (!fechaNacimientoBusqueda || fechaNacimiento === fechaNacimientoBusqueda) &&
        (!numeroExpedienteBusqueda ||
          numeroExpediente.includes(numeroExpedienteBusqueda.toLowerCase().trim()))
      );
    });
  }, [
    pacientes,
    nombreBusqueda,
    primerApellidoBusqueda,
    segundoApellidoBusqueda,
    fechaNacimientoBusqueda,
    numeroExpedienteBusqueda,
  ]);

  const paginatedMobilePacientes = useMemo(() => {
    const start = (currentPage - 1) * mobilePageSize;
    return filteredPacientes.slice(start, start + mobilePageSize);
  }, [filteredPacientes, currentPage]);

  const openCreate = () => {
    setSelectedPaciente(null);
    setUsarCurpGenerica(false);
    form.resetFields();

    form.setFieldsValue({
      sexo: undefined,
      tipo_sangre: undefined,
      estado_civil: undefined,
      pais_nacimiento: 'Mexico',
      curp: '',
      curp_generico: '',
    } as Partial<PacienteData>);

    setDrawerOpen(true);
  };

  const openEdit = (paciente: PacienteData) => {
    const tieneCurpGenerica =
      Boolean(paciente.curp_generico) && paciente.curp === paciente.curp_generico;

    setSelectedPaciente(paciente);
    setUsarCurpGenerica(tieneCurpGenerica);

    form.setFieldsValue({
      ...paciente,
      fecha_nacimiento: formatDate(paciente.fecha_nacimiento),
      sexo: paciente.sexo || undefined,
      tipo_sangre: paciente.tipo_sangre || undefined,
      estado_civil: paciente.estado_civil || undefined,
    });

    setDrawerOpen(true);
  };

  const openDetail = (paciente: PacienteData) => {
    setSelectedPaciente(paciente);
    setDetailOpen(true);
  };

  const openAudit = async (paciente: PacienteData) => {
    if (!paciente.id) return;

    try {
      setSelectedPaciente(paciente);
      setAuditOpen(true);
      setAuditLoading(true);

      const data = await PacientesService.getAuditoriaPaciente(paciente.id);
      setAuditoria(data);
    } catch (error) {
      console.error(error);
      message.error('No fue posible cargar la auditoría');
    } finally {
      setAuditLoading(false);
    }
  };

  const handleCloseDrawer = () => {
    setDrawerOpen(false);
    setSelectedPaciente(null);
    setUsarCurpGenerica(false);
    form.resetFields();
  };

  const handleToggleCurpGenerica = (checked: boolean) => {
    setUsarCurpGenerica(checked);

    if (checked) {
      const curpGenerica = generarCurpGenerica();

      form.setFieldsValue({
        curp: curpGenerica,
        curp_generico: curpGenerica,
      } as Partial<PacienteData>);
    } else {
      form.setFieldsValue({
        curp: '',
        curp_generico: '',
      } as Partial<PacienteData>);
    }
  };

  const handleRegenerarCurpGenerica = () => {
    const curpGenerica = generarCurpGenerica();

    form.setFieldsValue({
      curp: curpGenerica,
      curp_generico: curpGenerica,
    } as Partial<PacienteData>);
  };

  const handleSubmit = async (values: PacienteData) => {
    try {
      setSaving(true);

      const curpFinal = values.curp?.trim().toUpperCase() || '';

      const payload: PacienteData = {
        nombre: values.nombre?.trim(),
        primer_apellido: values.primer_apellido?.trim(),
        segundo_apellido: values.segundo_apellido?.trim() || '',
        fecha_nacimiento: values.fecha_nacimiento || '',
        sexo: values.sexo || '',
        tipo_sangre: values.tipo_sangre || '',
        curp: curpFinal,
        curp_generico: usarCurpGenerica
          ? curpFinal
          : values.curp_generico?.trim().toUpperCase() || '',
        lugar_origen: values.lugar_origen?.trim() || '',
        pais_nacimiento: values.pais_nacimiento?.trim() || 'Mexico',
        estado_civil: values.estado_civil || '',
        escolaridad: values.escolaridad || '',
        ocupacion: values.ocupacion?.trim() || '',
        telefono: values.telefono?.trim() || '',
        celular: values.celular?.trim() || '',
        correo: values.correo?.trim() || '',
        numero_expediente: values.numero_expediente?.trim() || '',
        activo: true,
      };

      Swal.fire({
        title: isEditing ? 'Actualizando paciente...' : 'Registrando paciente...',
        text: 'Por favor espera un momento',
        allowOutsideClick: false,
        allowEscapeKey: false,
        didOpen: () => Swal.showLoading(),
      });

      if (isEditing && selectedPaciente?.id) {
        await PacientesService.updatePaciente(selectedPaciente.id, payload);
      } else {
        await PacientesService.createPaciente(payload);
      }

      Swal.close();

      await Swal.fire({
        icon: 'success',
        title: isEditing ? 'Paciente actualizado' : 'Paciente registrado',
        text: isEditing
          ? 'La información del paciente se actualizó correctamente.'
          : 'El paciente se registró correctamente.',
        confirmButtonColor: '#36c6c7',
      });

      handleCloseDrawer();
      resetPagination();
      loadPacientes();
    } catch (error: any) {
      Swal.close();

      const backendMessage =
        error?.response?.data?.details ||
        error?.response?.data?.message ||
        error?.response?.data?.error;

      Swal.fire({
        icon: 'error',
        title: 'Error al guardar paciente',
        html: Array.isArray(backendMessage)
          ? backendMessage.join('<br>')
          : backendMessage || error?.message || 'No fue posible guardar el paciente',
        confirmButtonColor: '#ff4d4f',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (paciente: PacienteData) => {
    if (!paciente.id) return;

    const result = await Swal.fire({
      icon: 'warning',
      title: '¿Eliminar paciente?',
      text: `Se eliminará el registro de ${getFullName(paciente)}.`,
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#ff4d4f',
    });

    if (!result.isConfirmed) return;

    try {
      Swal.fire({
        title: 'Eliminando paciente...',
        allowOutsideClick: false,
        allowEscapeKey: false,
        didOpen: () => Swal.showLoading(),
      });

      await PacientesService.deletePaciente(paciente.id);

      Swal.close();

      await Swal.fire({
        icon: 'success',
        title: 'Paciente eliminado',
        text: 'El registro se eliminó correctamente.',
        confirmButtonColor: '#36c6c7',
      });

      resetPagination();
      loadPacientes();
    } catch (error: any) {
      Swal.close();

      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error?.message || 'No fue posible eliminar el paciente',
        confirmButtonColor: '#ff4d4f',
      });
    }
  };

  const columns: ColumnsType<PacienteData> = [
    {
      title: 'Paciente',
      key: 'paciente',
      width: '25%',
      render: (_, paciente) => (
        <Space size={8} className="paciente-cell-space">
          <Avatar icon={<UserOutlined />} className="paciente-avatar" />

          <div className="paciente-name-cell">
            <strong title={getFullName(paciente)}>{getFullName(paciente)}</strong>
            <span title={paciente.numero_expediente || 'Sin expediente'}>
              {paciente.numero_expediente || 'Sin expediente'}
            </span>
          </div>
        </Space>
      ),
    },
    {
      title: 'Nacimiento',
      dataIndex: 'fecha_nacimiento',
      width: '11%',
      render: (fecha) => formatDate(fecha),
    },
    {
      title: 'Expediente',
      dataIndex: 'numero_expediente',
      width: '12%',
      render: (expediente) => expediente || '-',
    },
    {
      title: 'CURP',
      dataIndex: 'curp',
      width: '18%',
      render: (curp) => curp || <Text type="secondary">Sin CURP</Text>,
    },
    {
      title: 'Contacto',
      key: 'contacto',
      width: '18%',
      render: (_, paciente) => (
        <div className="paciente-contact-cell">
          <strong title={paciente.celular || paciente.telefono || '-'}>
            {paciente.celular || paciente.telefono || '-'}
          </strong>
          <span title={paciente.correo || 'Sin correo'}>{paciente.correo || 'Sin correo'}</span>
        </div>
      ),
    },
    {
      title: 'Estado',
      dataIndex: 'activo',
      width: '8%',
      align: 'center',
      render: (activo) =>
        activo ? (
          <Tag className="paciente-status activo">Activo</Tag>
        ) : (
          <Tag className="paciente-status inactivo">Inactivo</Tag>
        ),
    },
    {
      title: 'Acciones',
      key: 'acciones',
      width: '12%',
      align: 'center',
      render: (_, paciente) => (
        <Space size={3} className="paciente-actions-space">
          <Tooltip title="Ver detalle">
            <Button icon={<EyeOutlined />} onClick={() => openDetail(paciente)} />
          </Tooltip>

          <Tooltip title="Auditoría">
            <Button icon={<HistoryOutlined />} onClick={() => openAudit(paciente)} />
          </Tooltip>

          <Tooltip title="Editar">
            <Button icon={<EditOutlined />} onClick={() => openEdit(paciente)} />
          </Tooltip>

          <Tooltip title="Eliminar">
            <Button danger icon={<DeleteOutlined />} onClick={() => handleDelete(paciente)} />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className="pacientes-page">
      <div className="pacientes-header">
        <div>
          <Text className="pacientes-subtitle">Expediente electrónico</Text>

          <Title level={2}>Buscar paciente</Title>

          <Text type="secondary">
            Localiza pacientes por nombre, fecha de nacimiento o número de expediente.
          </Text>
        </div>

        <Button
          type="primary"
          icon={<PlusOutlined />}
          className="pacientes-primary-btn"
          onClick={openCreate}
        >
          Crear paciente
        </Button>
      </div>

      <Card className="pacientes-card">
        <div className="pacientes-search-panel">
          <div className="pacientes-search-title">
            <SearchOutlined />
            <span>Buscar paciente</span>
          </div>

          <div className="pacientes-search-form">
            <Input
              placeholder="Nombre"
              value={nombreBusqueda}
              onChange={(e) => {
                setNombreBusqueda(e.target.value);
                resetPagination();
              }}
              allowClear
            />

            <Input
              placeholder="Primer apellido"
              value={primerApellidoBusqueda}
              onChange={(e) => {
                setPrimerApellidoBusqueda(e.target.value);
                resetPagination();
              }}
              allowClear
            />

            <Input
              placeholder="Segundo apellido"
              value={segundoApellidoBusqueda}
              onChange={(e) => {
                setSegundoApellidoBusqueda(e.target.value);
                resetPagination();
              }}
              allowClear
            />

            <Input
              type="date"
              value={fechaNacimientoBusqueda}
              onChange={(e) => {
                setFechaNacimientoBusqueda(e.target.value);
                resetPagination();
              }}
            />

            <Input
              placeholder="Número expediente"
              value={numeroExpedienteBusqueda}
              onChange={(e) => {
                setNumeroExpedienteBusqueda(e.target.value);
                resetPagination();
              }}
              allowClear
            />

            <Button type="primary" icon={<SearchOutlined />} className="pacientes-search-btn">
              Buscar
            </Button>

            <Button onClick={limpiarBusqueda}>Limpiar</Button>

            <Button icon={<ReloadOutlined />} onClick={loadPacientes}>
              Actualizar
            </Button>
          </div>
        </div>

        <Table
          className="pacientes-table-desktop"
          columns={columns}
          dataSource={filteredPacientes}
          rowKey={(record) => String(record.id)}
          loading={loading}
          size="small"
          tableLayout="fixed"
          pagination={{
            current: currentPage,
            pageSize: desktopPageSize,
            total: filteredPacientes.length,
            showSizeChanger: false,
            position: ['bottomCenter'],
            onChange: (page) => setCurrentPage(page),
          }}
          locale={{
            emptyText: <Empty description="No hay pacientes registrados" />,
          }}
        />

        <div className="pacientes-mobile-list">
          {loading ? (
            <div className="pacientes-mobile-loading">
              <Spin />
            </div>
          ) : paginatedMobilePacientes.length ? (
            paginatedMobilePacientes.map((paciente) => (
              <Card key={paciente.id} className="paciente-mobile-card">
                <div className="paciente-mobile-header">
                  <Avatar icon={<UserOutlined />} className="paciente-avatar" />

                  <div>
                    <strong>{getFullName(paciente)}</strong>
                    <p>{paciente.numero_expediente || 'Sin expediente'}</p>
                  </div>
                </div>

                <div className="paciente-mobile-extra">
                  <p>
                    <strong>Fecha nacimiento:</strong> {formatDate(paciente.fecha_nacimiento)}
                  </p>

                  <p>
                    <strong>CURP:</strong> {paciente.curp || 'Sin CURP'}
                  </p>

                  <p>
                    <strong>Contacto:</strong> {paciente.celular || paciente.telefono || '-'}
                  </p>

                  <p>
                    <strong>Correo:</strong> {paciente.correo || 'Sin correo'}
                  </p>
                </div>

                <div className="paciente-mobile-actions">
                  <Button icon={<EyeOutlined />} onClick={() => openDetail(paciente)}>
                    Ver
                  </Button>

                  <Button icon={<EditOutlined />} onClick={() => openEdit(paciente)}>
                    Editar
                  </Button>

                  <Button icon={<HistoryOutlined />} onClick={() => openAudit(paciente)}>
                    Audit.
                  </Button>

                  <Button danger icon={<DeleteOutlined />} onClick={() => handleDelete(paciente)}>
                    Eliminar
                  </Button>
                </div>
              </Card>
            ))
          ) : (
            <Empty description="No hay pacientes registrados" />
          )}

          {filteredPacientes.length > mobilePageSize && (
            <Pagination
              current={currentPage}
              pageSize={mobilePageSize}
              total={filteredPacientes.length}
              showSizeChanger={false}
              size="small"
              onChange={(page) => setCurrentPage(page)}
              className="pacientes-mobile-pagination"
            />
          )}
        </div>
      </Card>

      <Drawer
        title={isEditing ? 'Editar paciente' : 'Nuevo paciente'}
        width={860}
        open={drawerOpen}
        onClose={handleCloseDrawer}
        destroyOnHidden
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            sexo: undefined,
            tipo_sangre: undefined,
            estado_civil: undefined,
            pais_nacimiento: 'Mexico',
          }}
        >
          <Row gutter={[16, 0]}>
            <Col xs={24}>
              <div className="pacientes-curp-switch">
                <div>
                  <strong>Registro con CURP genérica</strong>
                  <p>Actívalo si el paciente no cuenta con CURP.</p>
                </div>

                <Switch checked={usarCurpGenerica} onChange={handleToggleCurpGenerica} />
              </div>

              <Divider />
            </Col>

            <Col xs={24} md={12}>
              <Form.Item name="nombre" label="Nombre" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item name="primer_apellido" label="Primer apellido" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item name="segundo_apellido" label="Segundo apellido">
                <Input />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item name="fecha_nacimiento" label="Fecha de nacimiento" rules={[{ required: true }]}>
                <Input type="date" max={new Date().toISOString().split('T')[0]} />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item name="sexo" label="Sexo" rules={[{ required: true }]}>
                <Select
                  options={[
                    { value: 'F', label: 'Femenino' },
                    { value: 'M', label: 'Masculino' },
                  ]}
                  allowClear
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item name="tipo_sangre" label="Tipo de sangre" rules={[{ required: true }]}>
                <Select
                  options={['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((v) => ({
                    value: v,
                    label: v,
                  }))}
                  allowClear
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={usarCurpGenerica ? 12 : 24}>
              <Form.Item
                name="curp"
                label={usarCurpGenerica ? 'CURP generada' : 'CURP'}
                rules={[
                  { required: true },
                  { len: 18, message: 'La CURP debe tener 18 caracteres' },
                ]}
              >
                <Input maxLength={18} disabled={usarCurpGenerica} />
              </Form.Item>
            </Col>

            {usarCurpGenerica && (
              <Col xs={24} md={12}>
                <Form.Item label="Regenerar CURP genérica">
                  <Button icon={<SyncOutlined />} onClick={handleRegenerarCurpGenerica} block>
                    Generar otra
                  </Button>
                </Form.Item>
              </Col>
            )}

            <Form.Item name="curp_generico" hidden>
              <Input />
            </Form.Item>

            <Col xs={24} md={12}>
              <Form.Item name="lugar_origen" label="Lugar de origen">
                <Input />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item name="pais_nacimiento" label="País de nacimiento">
                <Input />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item name="estado_civil" label="Estado civil">
                <Select
                  allowClear
                  options={[
                    'Soltero',
                    'Casado',
                    'Divorciado',
                    'Viudo',
                    'Union libre',
                  ].map((v) => ({
                    value: v,
                    label: v,
                  }))}
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item name="escolaridad" label="Escolidad">
                <Select
                  allowClear
                  options={[
                    'Primaria',
                    'Secundaria',
                    'Preparatoria',
                    'Licenciatura',
                    'Maestria',
                    'Doctorado',
                    'Otro',
                  ].map((v) => ({
                    value: v,
                    label: v,
                  }))}
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item name="ocupacion" label="Ocupación">
                <Input />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item name="numero_expediente" label="Número de expediente">
                <Input />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item name="telefono" label="Teléfono">
                <Input />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item name="celular" label="Celular">
                <Input />
              </Form.Item>
            </Col>

            <Col xs={24}>
              <Form.Item name="correo" label="Correo" rules={[{ type: 'email' }]}>
                <Input />
              </Form.Item>
            </Col>
          </Row>

          <div className="pacientes-drawer-actions">
            <Button onClick={handleCloseDrawer}>Cancelar</Button>

            <Button
              type="primary"
              htmlType="submit"
              loading={saving}
              className="pacientes-primary-btn"
            >
              {isEditing ? 'Actualizar paciente' : 'Registrar paciente'}
            </Button>
          </div>
        </Form>
      </Drawer>

      <Modal
        open={detailOpen}
        title="Detalle del paciente"
        onCancel={() => setDetailOpen(false)}
        footer={[
          <Button key="close" onClick={() => setDetailOpen(false)}>
            Cerrar
          </Button>,
        ]}
      >
        {selectedPaciente && (
          <div className="paciente-detail">
            <Avatar size={72} icon={<UserOutlined />} className="paciente-detail-avatar" />

            <Title level={4}>{getFullName(selectedPaciente)}</Title>

            <Text type="secondary">{selectedPaciente.correo || 'Sin correo'}</Text>

            <div className="paciente-detail-grid">
              <div>
                <strong>Expediente:</strong>
                <span>{selectedPaciente.numero_expediente || '-'}</span>
              </div>

              <div>
                <strong>Fecha nacimiento:</strong>
                <span>{formatDate(selectedPaciente.fecha_nacimiento)}</span>
              </div>

              <div>
                <strong>CURP:</strong>
                <span>{selectedPaciente.curp || '-'}</span>
              </div>

              <div>
                <strong>Teléfono:</strong>
                <span>{selectedPaciente.telefono || '-'}</span>
              </div>

              <div>
                <strong>Celular:</strong>
                <span>{selectedPaciente.celular || '-'}</span>
              </div>

              <div>
                <strong>Sexo:</strong>
                <span>{selectedPaciente.sexo || '-'}</span>
              </div>

              <div>
                <strong>Tipo de sangre:</strong>
                <span>{selectedPaciente.tipo_sangre || '-'}</span>
              </div>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        open={auditOpen}
        title="Auditoría del paciente"
        onCancel={() => setAuditOpen(false)}
        footer={[
          <Button key="close" onClick={() => setAuditOpen(false)}>
            Cerrar
          </Button>,
        ]}
      >
        {auditLoading ? (
          <Spin />
        ) : auditoria.length ? (
          <pre className="paciente-audit-pre">{JSON.stringify(auditoria, null, 2)}</pre>
        ) : (
          <Empty description="Sin registros de auditoría" />
        )}
      </Modal>
    </div>
  );
};

export default Pacientes;