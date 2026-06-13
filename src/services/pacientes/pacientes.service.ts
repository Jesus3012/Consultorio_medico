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

  private buildPayload(data: Partial<PacienteData>): any {
    const payload: any = {};

    const addField = (key: string, value: any) => {
      if (
        value !== undefined &&
        value !== null &&
        String(value).trim() !== ''
      ) {
        payload[key] = value;
      }
    };

    const sucursalId = Number(data.sucursal_id ?? data.sucursalId);

    if (Number.isFinite(sucursalId) && sucursalId > 0) {
      payload.sucursalId = sucursalId;
    }

    addField('nombre', data.nombre?.trim());

    addField(
      'primerApellido',
      data.primer_apellido?.trim()
    );

    addField(
      'segundoApellido',
      data.segundo_apellido?.trim()
    );

    addField(
      'fechaNacimiento',
      data.fecha_nacimiento
    );

    addField('sexo', data.sexo);

    addField(
      'tipoSangre',
      data.tipo_sangre
    );

    addField(
      'curp',
      data.curp?.trim().toUpperCase()
    );

    addField(
      'curpGenerico',
      data.curp_generico?.trim().toUpperCase()
    );

    addField(
      'lugarOrigen',
      data.lugar_origen?.trim()
    );

    addField(
      'paisNacimiento',
      data.pais_nacimiento?.trim()
    );

    addField(
      'estadoCivil',
      data.estado_civil
    );

    addField(
      'escolaridad',
      data.escolaridad
    );

    addField(
      'ocupacion',
      data.ocupacion?.trim()
    );

    addField(
      'telefono',
      data.telefono?.trim()
    );

    addField(
      'celular',
      data.celular?.trim()
    );

    addField(
      'correo',
      data.correo?.trim()
    );

    addField(
      'numeroExpediente',
      data.numero_expediente?.trim()
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

  async createPaciente(data: PacienteData): Promise<PacienteData> {
    const sucursalId =
      data.sucursal_id ||
      data.sucursalId ||
      (await this.getSucursalIdFromMe());

    if (!sucursalId) {
      throw new Error('No se pudo obtener la sucursal del usuario');
    }

    const payload = this.buildPayload({
      ...data,
      sucursal_id: Number(sucursalId),
    });

    const response = await axiosInstance.post(
      this.basePath,
      payload
    );

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