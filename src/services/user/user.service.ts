import axiosInstance from '../../api/axios.config';
import authService from '../auth/auth.service';

// Exportar la interfaz UserData
export interface UserData {
  id?: number;
  nombre: string;
  primer_apellido: string;
  segundo_apellido?: string;
  email: string;
  telefono?: string;
  rol_id?: number;
  empresa_id?: number;
  sucursal_id?: number;
  activo?: boolean;
}

class UserService {
  private static instance: UserService;

  static getInstance(): UserService {
    if (!UserService.instance) {
      UserService.instance = new UserService();
    }
    return UserService.instance;
  }

  // Obtener todos los usuarios (GET /api/v1/usuarios)
  async getUsuarios(): Promise<UserData[]> {
    try {
      const response = await axiosInstance.get('/usuarios');
      // Ajustar según la estructura real de la respuesta
      if (response.data && response.data.data) {
        return response.data.data;
      }
      if (Array.isArray(response.data)) {
        return response.data;
      }
      return [];
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  }

  // Obtener usuario por ID (GET /api/v1/usuarios/{id})
  async getUsuarioById(id: number): Promise<UserData> {
    try {
      const response = await axiosInstance.get(`/usuarios/${id}`);
      if (response.data && response.data.data) {
        return response.data.data;
      }
      return response.data;
    } catch (error) {
      console.error(`Error fetching user ${id}:`, error);
      throw error;
    }
  }

  // Crear nuevo usuario (POST /api/v1/usuarios)
  async createUsuario(userData: UserData): Promise<UserData> {
    try {
      const response = await axiosInstance.post('/usuarios', userData);
      if (response.data && response.data.data) {
        return response.data.data;
      }
      return response.data;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  // Actualizar usuario (PATCH /api/v1/usuarios/{id})
  async updateUsuario(id: number, userData: Partial<UserData>): Promise<UserData> {
    try {
      const response = await axiosInstance.patch(`/usuarios/${id}`, userData);
      if (response.data && response.data.data) {
        return response.data.data;
      }
      return response.data;
    } catch (error) {
      console.error(`Error updating user ${id}:`, error);
      throw error;
    }
  }

  // Eliminar usuario (DELETE /api/v1/usuarios/{id})
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