// src/services/auth/auth.service.ts
import axios from 'axios';
import type { LoginResponse, User } from '../../types/auth/auth.types';
import axiosInstance from '../../api/axios.config';
import { detectGender } from '../../utils/genderDetector';

const API_URL = import.meta.env.VITE_API_URL || 'https://api-medica.rexcoresolutions.com/api/v1';

// Función para decodificar el token JWT
const decodeToken = (token: string): any => {
  try {
    const payload = token.split('.')[1];
    const decoded = atob(payload);
    return JSON.parse(decoded);
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
};

class AuthService {
  private static instance: AuthService;
  private refreshTokenTimeout: number | null = null;

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  async login(email: string, password: string): Promise<LoginResponse> {
    try {
      const response = await axios.post(`${API_URL}/auth/login`, {
        email,
        password
      });
      
      console.log('📦 Respuesta del login:', JSON.stringify(response.data, null, 2));
      
      if (response.data?.success && response.data?.data) {
        const accessToken = response.data.data.accessToken;
        
        if (accessToken) {
          localStorage.setItem('access_token', accessToken);
          axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
          
          // Decodificar el token para obtener el userId
          const decodedToken = decodeToken(accessToken);
          console.log('🔓 Token decodificado:', decodedToken);
          
          const userId = decodedToken?.userId || decodedToken?.sub || decodedToken?.id;
          
          if (userId) {
            // Obtener datos completos del usuario por ID
            const completeUser = await this.getUserById(userId, accessToken);
            
            if (completeUser && completeUser.id) {
              localStorage.setItem('user', JSON.stringify(completeUser));
              this.startRefreshTokenTimer();
              
              return {
                success: true,
                data: {
                  user: completeUser,
                  token: accessToken,
                  refreshToken: undefined
                }
              };
            }
          }
          
          throw new Error('No se pudo obtener la información del usuario');
        }
      }
      
      throw new Error('No se encontraron datos de usuario en la respuesta');
      
    } catch (error: any) {
      console.error('❌ Login error:', error);
      
      if (error.response) {
        throw {
          response: {
            data: {
              message: error.response.data?.message || 'Credenciales incorrectas'
            }
          }
        };
      }
      
      throw error;
    }
  }

  // Obtener usuario por ID usando GET /api/v1/usuarios/{id}
  private async getUserById(userId: number, token: string): Promise<User | null> {
    try {
      const response = await axios.get(`${API_URL}/usuarios/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      console.log(`📋 Respuesta de /usuarios/${userId}:`, JSON.stringify(response.data, null, 2));
      
      // La API devuelve: { success, statusCode, message, data: { ... } }
      const userData = response.data?.data;
      
      if (userData) {
        console.log('✅ Usuario encontrado por ID:', userData);
        
        // Mapear los campos de la API a nuestros campos
        // API usa: primerApellido, segundoApellido, correo, cedulaProfesional
        // Nosotros usamos: primer_apellido, segundo_apellido, email, cedula_profesional
        const gender = detectGender(userData.nombre, userData.primerApellido);
        
        return {
          id: userData.id,
          nombre: userData.nombre || '',
          primer_apellido: userData.primerApellido || '',
          segundo_apellido: userData.segundoApellido || '',
          email: userData.correo || '',
          telefono: userData.telefono || '',
          rol_id: userData.rolId || 1,
          empresa_id: userData.empresaId || 1,
          sucursal_id: userData.sucursalId || null,
          cedula_profesional: userData.cedulaProfesional || '',
          especialidad: userData.especialidad || '',
          activo: userData.activo === true,
          ultimo_acceso: userData.ultimoAcceso || undefined,
          created_at: userData.createdAt,
          updated_at: userData.updatedAt,
          genero: gender
        };
      }
      
      console.warn('⚠️ No se encontraron datos de usuario en la respuesta');
      return null;
      
    } catch (error) {
      console.error(`Error obteniendo usuario ${userId}:`, error);
      return null;
    }
  }

  logout(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    this.stopRefreshTokenTimer();
    delete axiosInstance.defaults.headers.common['Authorization'];
  }

  getToken(): string | null {
    return localStorage.getItem('access_token');
  }

  getRefreshToken(): string | null {
    return localStorage.getItem('refresh_token');
  }

  getUser(): User | null {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        return JSON.parse(userStr) as User;
      } catch {
        console.error('Error parsing user from localStorage');
        return null;
      }
    }
    return null;
  }

  async refreshToken(): Promise<string | null> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) return null;

    try {
      const response = await axios.post(`${API_URL}/auth/refresh`, {
        refresh_token: refreshToken
      });
      
      const newToken = response.data.token || response.data.data?.accessToken;
      if (newToken) {
        localStorage.setItem('access_token', newToken);
        axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
        this.startRefreshTokenTimer();
        return newToken;
      }
      return null;
    } catch (error) {
      console.error('Refresh token error:', error);
      this.logout();
      return null;
    }
  }

  private startRefreshTokenTimer(): void {
    this.stopRefreshTokenTimer();
    this.refreshTokenTimeout = window.setTimeout(() => {
      this.refreshToken();
    }, 50 * 60 * 1000);
  }

  private stopRefreshTokenTimer(): void {
    if (this.refreshTokenTimeout) {
      clearTimeout(this.refreshTokenTimeout);
      this.refreshTokenTimeout = null;
    }
  }
}

export default AuthService.getInstance();