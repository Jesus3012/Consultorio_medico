import axiosInstance from '../../api/axios.config';

export interface PacienteData {
  id?: number;

  sucursal_id?: number;
  sucursalId?: number;

  nombre: string;
  primer_apellido: string;
  segundo_apellido?: string;

  fecha_nacimiento?: string;
  sexo?: string;
  tipo_sangre?: string;

  curp?: string;
  curp_generico?: string;
  lugar_origen?: string;
  pais_nacimiento?: string;
  estado_civil?: string;
  escolaridad?: string;
  ocupacion?: string;

  telefono?: string;
  celular?: string;
  correo?: string;

  numero_expediente?: string;

  activo?: boolean;
  created_at?: string;
  updated_at?: string;
}

class PacientesService {
  private readonly basePath = '/pacientes';
  private readonly usuariosMePath = '/usuarios/me';

  private normalizeArray(responseData: any): any[] {
    const data =
      responseData?.data?.data ||
      responseData?.data?.items ||
      responseData?.data ||
      responseData?.items ||
      responseData;

    return Array.isArray(data) ? data : [];
  }

  private getResponseData(responseData: any): any {
    return (
      responseData?.data?.data ||
      responseData?.data?.paciente ||
      responseData?.data ||
      responseData?.paciente ||
      responseData
    );
  }

  private normalizePaciente(paciente: any): PacienteData {
    return {
      id: paciente?.id,

      sucursal_id: paciente?.sucursal_id ?? paciente?.sucursalId,
      sucursalId: paciente?.sucursalId ?? paciente?.sucursal_id,

      nombre: paciente?.nombre || '',

      primer_apellido:
        paciente?.primer_apellido ||
        paciente?.primerApellido ||
        '',

      segundo_apellido:
        paciente?.segundo_apellido ||
        paciente?.segundoApellido ||
        '',

      fecha_nacimiento:
        paciente?.fecha_nacimiento ||
        paciente?.fechaNacimiento ||
        '',

      sexo: paciente?.sexo || '',

      tipo_sangre:
        paciente?.tipo_sangre ||
        paciente?.tipoSangre ||
        '',

      curp: paciente?.curp || '',

      curp_generico:
        paciente?.curp_generico ||
        paciente?.curpGenerico ||
        '',

      lugar_origen:
        paciente?.lugar_origen ||
        paciente?.lugarOrigen ||
        '',

      pais_nacimiento:
        paciente?.pais_nacimiento ||
        paciente?.paisNacimiento ||
        '',

      estado_civil:
        paciente?.estado_civil ||
        paciente?.estadoCivil ||
        '',

      escolaridad: paciente?.escolaridad || '',
      ocupacion: paciente?.ocupacion || '',

      telefono: paciente?.telefono || '',
      celular: paciente?.celular || '',
      correo: paciente?.correo || '',

      numero_expediente:
        paciente?.numero_expediente ||
        paciente?.numeroExpediente ||
        '',

      activo: paciente?.activo === true || paciente?.activo === 1,

      created_at: paciente?.created_at || paciente?.createdAt,
      updated_at: paciente?.updated_at || paciente?.updatedAt,
    };
  }

  private async getSucursalIdFromMe(): Promise<number | null> {
    try {
      const response = await axiosInstance.get(this.usuariosMePath);

      const user =
        response.data?.data ||
        response.data?.user ||
        response.data?.usuario ||
        response.data;

      const sucursalId = Number(
        user?.sucursalId ??
          user?.sucursal_id ??
          null
      );

      return Number.isFinite(sucursalId) && sucursalId > 0
        ? sucursalId
        : null;
    } catch (error) {
      console.error('Error obteniendo sucursal del usuario:', error);
      return null;
    }
  }

  private buildPayload(data: any): any {
    const payload: any = {};

    const addField = (key: string, value: any) => {
      if (value !== undefined && value !== null && String(value).trim() !== '') {
        payload[key] = typeof value === 'string' ? value.trim() : value;
      }
    };

    const sucursalId = Number(data.sucursal_id ?? data.sucursalId);

    if (Number.isFinite(sucursalId) && sucursalId > 0) {
      payload.sucursalId = sucursalId;
    }

    addField('nombre', data.nombre);

    addField(
      'primerApellido',
      data.primer_apellido ?? data.primerApellido
    );

    addField(
      'segundoApellido',
      data.segundo_apellido ?? data.segundoApellido
    );

    addField(
      'fechaNacimiento',
      data.fecha_nacimiento ?? data.fechaNacimiento
    );

    addField('sexo', data.sexo);

    addField(
      'tipoSangre',
      data.tipo_sangre ?? data.tipoSangre
    );

    addField('curp', data.curp?.toUpperCase());

    addField(
      'curpGenerico',
      (data.curp_generico ?? data.curpGenerico)?.toUpperCase()
    );

    addField(
      'lugarOrigen',
      data.lugar_origen ?? data.lugarOrigen
    );

    addField(
      'paisNacimiento',
      data.pais_nacimiento ?? data.paisNacimiento ?? 'Mexico'
    );

    addField(
      'estadoCivil',
      data.estado_civil ?? data.estadoCivil
    );

    addField('escolaridad', data.escolaridad);
    addField('ocupacion', data.ocupacion);
    addField('telefono', data.telefono);
    addField('celular', data.celular);
    addField('correo', data.correo);

    addField(
      'numeroExpediente',
      data.numero_expediente ?? data.numeroExpediente
    );

    return payload;
  }

  async getPacientes(): Promise<PacienteData[]> {
  const response = await axiosInstance.get(this.basePath, {
      params: {
      page: 1,
      limit: 100,
      },
  });

    const pacientes = this.normalizeArray(response.data);

    return pacientes.map((paciente) => this.normalizePaciente(paciente));
    }

  async getPacienteById(id: number): Promise<PacienteData> {
    const response = await axiosInstance.get(
      `${this.basePath}/${id}`
    );

    const paciente = this.getResponseData(response.data);

    return this.normalizePaciente(paciente);
  }

  async createPaciente(data: any): Promise<PacienteData> {
    const sucursalId =
      data.sucursal_id ||
      data.sucursalId ||
      (await this.getSucursalIdFromMe());

    if (!sucursalId) {
      throw new Error('No se pudo obtener la sucursal del usuario');
    }

    const payload = {
      sucursalId: Number(sucursalId),

      nombre: String(data.nombre ?? '').trim(),
      primerApellido: String(data.primer_apellido ?? data.primerApellido ?? '').trim(),
      segundoApellido: String(data.segundo_apellido ?? data.segundoApellido ?? '').trim(),

      fechaNacimiento: data.fecha_nacimiento ?? data.fechaNacimiento ?? '',
      sexo: data.sexo ?? '',
      tipoSangre: data.tipo_sangre ?? data.tipoSangre ?? '',

      curp: String(data.curp ?? '').trim().toUpperCase(),
      curpGenerico: String(data.curp_generico ?? data.curpGenerico ?? '').trim().toUpperCase(),

      lugarOrigen: String(data.lugar_origen ?? data.lugarOrigen ?? '').trim(),
      paisNacimiento: String(data.pais_nacimiento ?? data.paisNacimiento ?? 'Mexico').trim(),
      estadoCivil: data.estado_civil ?? data.estadoCivil ?? '',
      escolaridad: data.escolaridad ?? '',
      ocupacion: String(data.ocupacion ?? '').trim(),

      telefono: String(data.telefono ?? '').trim(),
      celular: String(data.celular ?? '').trim(),
      ...(String(data.correo ?? '').trim()
      ? { correo: String(data.correo ?? '').trim() }
      : {}),

      numeroExpediente: String(data.numero_expediente ?? data.numeroExpediente ?? '').trim(),
    };

    console.log('BODY REAL ENVIADO A /pacientes:', payload);

    const response = await axiosInstance.post(this.basePath, payload, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const paciente = this.getResponseData(response.data);

    return this.normalizePaciente(paciente);
  }

  async updatePaciente(
    id: number,
    data: Partial<PacienteData>
  ): Promise<PacienteData> {
    const payload = this.buildPayload(data);

    const response = await axiosInstance.patch(
      `${this.basePath}/${id}`,
      payload
    );

    const paciente = this.getResponseData(response.data);

    return this.normalizePaciente(paciente);
  }

  async deletePaciente(id: number): Promise<void> {
    await axiosInstance.delete(`${this.basePath}/${id}`);
  }

  async getAuditoriaPaciente(id: number): Promise<any[]> {
    const response = await axiosInstance.get(
      `${this.basePath}/${id}/auditoria`
    );

    return this.normalizeArray(response.data);
  }
}

export default new PacientesService();