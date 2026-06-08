import axiosInstance from '../../api/axios.config';

export interface WelcomeStats {
  usuariosActivos: number;
  medicosActivos: number;
  consultoresActivos: number;
  sucursalesActivas: number;

  pacientesHoy: number;
  proximasCitas: number;
  pendientes: number;
  pacientesActivos: number;
  citasRegistradas: number;
  consultasRevisadas: number;
}

class WelcomeService {
  private normalizeArray(responseData: any): any[] {
    const data =
      responseData?.data?.data ||
      responseData?.data ||
      responseData?.items ||
      responseData;

    return Array.isArray(data) ? data : [];
  }

  async getWelcomeStats(): Promise<WelcomeStats> {
    const [usuariosResponse, sucursalesResponse] = await Promise.allSettled([
      axiosInstance.get('/usuarios?page=1&limit=1000'),
      axiosInstance.get('/sucursales?page=1&limit=1000'),
    ]);

    const usuarios =
      usuariosResponse.status === 'fulfilled'
        ? this.normalizeArray(usuariosResponse.value.data)
        : [];

    const sucursales =
      sucursalesResponse.status === 'fulfilled'
        ? this.normalizeArray(sucursalesResponse.value.data)
        : [];

    const usuariosActivos = usuarios.filter(
      (user) => user.activo === true || user.activo === 1
    ).length;

    const medicosActivos = usuarios.filter(
      (user) =>
        Number(user.rolId ?? user.rol_id) === 2 &&
        (user.activo === true || user.activo === 1)
    ).length;

    const consultoresActivos = usuarios.filter(
      (user) =>
        Number(user.rolId ?? user.rol_id) === 3 &&
        (user.activo === true || user.activo === 1)
    ).length;

    const sucursalesActivas = sucursales.filter(
      (sucursal) => sucursal.activo === true || sucursal.activo === 1
    ).length;

    return {
      usuariosActivos,
      medicosActivos,
      consultoresActivos,
      sucursalesActivas,

      // Preparadas para futuras APIs
      pacientesHoy: 0,
      proximasCitas: 0,
      pendientes: 0,
      pacientesActivos: 0,
      citasRegistradas: 0,
      consultasRevisadas: 0,
    };
  }
}

export default new WelcomeService();