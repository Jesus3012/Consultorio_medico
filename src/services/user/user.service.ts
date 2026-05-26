// src/services/user/user.service.ts
import axiosInstance from '../../api/axios.config';

export interface UserData {
  id?: number;
  nombre: string;
  primer_apellido: string;
  segundo_apellido?: string;
  email: string;
  telefono?: string;
  rol_id?: number;
  empresa_id?: number;
  sucursal_id?: number | null;  // Permitir null
  activo?: boolean;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

class UserService {
  private static instance: UserService;

  static getInstance(): UserService {
    if (!UserService.instance) {
      UserService.instance = new UserService();
    }
    return UserService.instance;
  }

  async getUsuarios(page: number = 1, limit: number = 100): Promise<UserData[]> {
    try {
      const response = await axiosInstance.get(`/usuarios?page=${page}&limit=${limit}`);
      const responseData = response.data;
      let usersArray: any[] = [];
      
      if (responseData?.data?.data && Array.isArray(responseData.data.data)) {
        usersArray = responseData.data.data;
      } else if (responseData?.data && Array.isArray(responseData.data)) {
        usersArray = responseData.data;
      } else if (Array.isArray(responseData)) {
        usersArray = responseData;
      }
      
      return usersArray.map((user: any) => ({
        id: user.id,
        nombre: user.nombre || '',
        primer_apellido: user.primerApellido || user.primer_apellido || '',
        segundo_apellido: user.segundoApellido || user.segundo_apellido || '',
        email: user.correo || user.email || '',
        telefono: user.telefono || '',
        rol_id: user.rolId || user.rol_id || 2,
        empresa_id: user.empresaId || user.empresa_id || 1,
        sucursal_id: user.sucursalId || user.sucursal_id || null,
        activo: user.activo === true || user.activo === 1,
      }));
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  }

  async getUsuarioById(id: number): Promise<UserData> {
    try {
      const response = await axiosInstance.get(`/usuarios/${id}`);
      const user = response.data?.data || response.data;
      
      return {
        id: user.id,
        nombre: user.nombre || '',
        primer_apellido: user.primerApellido || user.primer_apellido || '',
        segundo_apellido: user.segundoApellido || user.segundo_apellido || '',
        email: user.correo || user.email || '',
        telefono: user.telefono || '',
        rol_id: user.rolId || user.rol_id || 2,
        empresa_id: user.empresaId || user.empresa_id || 1,
        sucursal_id: user.sucursalId || user.sucursal_id || null,
        activo: user.activo === true || user.activo === 1,
      };
    } catch (error) {
      console.error(`Error fetching user ${id}:`, error);
      throw error;
    }
  }

  async createUsuario(userData: UserData): Promise<UserData> {
    try {
      // Validar campos obligatorios
      if (!userData.nombre) throw new Error('El nombre es obligatorio');
      if (!userData.primer_apellido) throw new Error('El primer apellido es obligatorio');
      if (!userData.email) throw new Error('El email es obligatorio');
      if (!(userData as any).password) throw new Error('La contraseña es obligatoria');
      
      // IMPORTANTE: Usar EXACTAMENTE los mismos nombres de campo que Swagger
      // Swagger usa: primerApellido, segundoApellido, correo, rolId, empresaId
      const payload: any = {
        nombre: userData.nombre,
        primerApellido: userData.primer_apellido,
        correo: userData.email,
        password: (userData as any).password,
      };
      
      // Agregar segundoApellido solo si tiene valor
      if (userData.segundo_apellido && userData.segundo_apellido.trim() !== '') {
        payload.segundoApellido = userData.segundo_apellido;
      }
      
      // Agregar teléfono solo si tiene valor
      if (userData.telefono && userData.telefono.trim() !== '') {
        payload.telefono = userData.telefono;
      }
      
      // Agregar rolId si viene (por defecto 2 = Médico)
      if (userData.rol_id !== undefined) {
        payload.rolId = userData.rol_id;
      }
      
      // Agregar empresaId si viene
      if (userData.empresa_id !== undefined) {
        payload.empresaId = userData.empresa_id;
      }
      
      // Agregar activo si viene
      if (userData.activo !== undefined) {
        payload.activo = userData.activo;
      }
      
      console.log('📤 Enviando a la API:', JSON.stringify(payload, null, 2));
      
      const response = await axiosInstance.post('/usuarios', payload);
      console.log('✅ Respuesta:', response.data);
      
      const newUser = response.data?.data || response.data;
      return {
        id: newUser.id,
        nombre: newUser.nombre || '',
        primer_apellido: newUser.primerApellido || '',
        segundo_apellido: newUser.segundoApellido || '',
        email: newUser.correo || '',
        telefono: newUser.telefono || '',
        rol_id: newUser.rolId || 2,
        empresa_id: newUser.empresaId || 1,
        sucursal_id: null,
        activo: newUser.activo === true,
      };
    } catch (error: any) {
      console.error('Error creating user:', error);
      if (error.response?.data) {
        console.error('Error response:', JSON.stringify(error.response.data, null, 2));
        throw new Error(error.response.data.message || 'Error al crear usuario');
      }
      throw error;
    }
  }

  async updateUsuario(id: number, userData: Partial<UserData>): Promise<UserData> {
    try {
      const payload: any = {};
      
      // Usar los mismos nombres de campo que la API espera
      if (userData.nombre !== undefined && userData.nombre !== '') payload.nombre = userData.nombre;
      if (userData.primer_apellido !== undefined && userData.primer_apellido !== '') payload.primerApellido = userData.primer_apellido;
      if (userData.segundo_apellido !== undefined) payload.segundoApellido = userData.segundo_apellido;
      if (userData.email !== undefined && userData.email !== '') payload.correo = userData.email;
      if (userData.telefono !== undefined) payload.telefono = userData.telefono;
      if (userData.rol_id !== undefined) payload.rolId = userData.rol_id;
      if (userData.empresa_id !== undefined) payload.empresaId = userData.empresa_id;
      if (userData.activo !== undefined) payload.activo = userData.activo;
      
      if (Object.keys(payload).length === 0) {
        throw new Error('No hay campos para actualizar');
      }
      
      console.log('📤 Actualizando:', JSON.stringify(payload, null, 2));
      const response = await axiosInstance.patch(`/usuarios/${id}`, payload);
      console.log('✅ Respuesta:', response.data);
      
      const updatedUser = response.data?.data || response.data;
      return {
        id: updatedUser.id,
        nombre: updatedUser.nombre || '',
        primer_apellido: updatedUser.primerApellido || '',
        segundo_apellido: updatedUser.segundoApellido || '',
        email: updatedUser.correo || '',
        telefono: updatedUser.telefono || '',
        rol_id: updatedUser.rolId || 2,
        empresa_id: updatedUser.empresaId || 1,
        sucursal_id: null,
        activo: updatedUser.activo === true,
      };
    } catch (error: any) {
      console.error(`Error updating user ${id}:`, error);
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw error;
    }
  }

  async changePassword(id: number, passwords: ChangePasswordData): Promise<void> {
    try {
      await axiosInstance.patch(`/usuarios/${id}`, {
        password: passwords.newPassword
      });
    } catch (error) {
      console.error(`Error changing password for user ${id}:`, error);
      throw error;
    }
  }

  async deleteUsuario(id: number): Promise<void> {
    try {
      await axiosInstance.delete(`/usuarios/${id}`);
    } catch (error) {
      console.error(`Error deleting user ${id}:`, error);
      throw error;
    }
  }
}

export default UserService.getInstance();