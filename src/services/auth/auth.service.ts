// src/services/auth/auth.service.ts
import axios from 'axios';
import type { LoginResponse, User } from '../../types/auth/auth.types';
import axiosInstance from '../../api/axios.config';
import { detectGender } from '../../utils/genderDetector';

const API_URL =
  import.meta.env.VITE_API_URL || 'https://api-medica.rexcoresolutions.com/api/v1';

const decodeToken = (token: string): any => {
  try {
    const payload = token.split('.')[1];
    return JSON.parse(atob(payload));
  } catch {
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

  private normalizeUser(userData: any, tokenData?: any): User {
    const rolId =
      userData?.rolId ||
      userData?.rol_id ||
      tokenData?.rolId ||
      tokenData?.rol_id ||
      1;

    const gender = detectGender(userData?.nombre || '', userData?.primerApellido || '');

    return {
      id: userData?.id || tokenData?.userId || tokenData?.sub || tokenData?.id,
      nombre: userData?.nombre || '',
      primer_apellido: userData?.primerApellido || userData?.primer_apellido || '',
      segundo_apellido: userData?.segundoApellido || userData?.segundo_apellido || '',
      email: userData?.correo || userData?.email || tokenData?.email || '',
      telefono: userData?.telefono || '',
      rol_id: Number(rolId),
      empresa_id: userData?.empresaId || userData?.empresa_id || tokenData?.empresaId || null,
      sucursal_id: userData?.sucursalId ?? userData?.sucursal_id ?? tokenData?.sucursalId ?? null,
      cedula_profesional: userData?.cedulaProfesional || userData?.cedula_profesional || '',
      especialidad: userData?.especialidad || '',
      activo: userData?.activo === true || userData?.activo === 1,
      ultimo_acceso: userData?.ultimoAcceso || undefined,
      created_at: userData?.createdAt,
      updated_at: userData?.updatedAt,
      genero: gender,
    };
  }

  async login(email: string, password: string): Promise<LoginResponse> {
    try {
      const response = await axios.post(`${API_URL}/auth/login`, {
        email,
        password,
      });

      if (!response.data?.success || !response.data?.data) {
        throw new Error('No se encontraron datos de usuario en la respuesta');
      }

      const accessToken = response.data.data.accessToken;

      if (!accessToken) {
        throw new Error('No se recibió token de acceso');
      }

      localStorage.setItem('access_token', accessToken);
      axiosInstance.defaults.headers.common.Authorization = `Bearer ${accessToken}`;

      const decodedToken = decodeToken(accessToken);

      let completeUser: User | null = null;

      try {
        completeUser = await this.getMe(accessToken, decodedToken);
      } catch {
        completeUser = null;
      }

      if (!completeUser) {
        completeUser = this.normalizeUser(response.data.data.user || {}, decodedToken);
      }

      const allowedRoles = [1, 2, 3];

      if (!allowedRoles.includes(Number(completeUser.rol_id))) {
        this.logout();
        throw new Error('Rol no autorizado para iniciar sesión');
      }

      localStorage.setItem('user', JSON.stringify(completeUser));
      this.startRefreshTokenTimer();

      return {
        success: true,
        data: {
          user: completeUser,
          token: accessToken,
          refreshToken: undefined,
        },
      };
    } catch (error: any) {
      console.error('❌ Login error:', error);

      if (error.response) {
        throw {
          response: {
            status: error.response.status,
            data: {
              message: error.response.data?.message || 'Credenciales incorrectas',
            },
          },
        };
      }

      throw error;
    }
  }

  private async getMe(token: string, tokenData?: any): Promise<User | null> {
    try {
      const response = await axios.get(`${API_URL}/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const userData = response.data?.data || response.data;

      if (!userData) return null;

      return this.normalizeUser(userData, tokenData);
    } catch (error) {
      console.error('Error obteniendo /auth/me:', error);
      return null;
    }
  }

  logout(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    this.stopRefreshTokenTimer();
    delete axiosInstance.defaults.headers.common.Authorization;
  }

  getToken(): string | null {
    return localStorage.getItem('access_token');
  }

  getRefreshToken(): string | null {
    return localStorage.getItem('refresh_token');
  }

  getUser(): User | null {
    const userStr = localStorage.getItem('user');

    if (!userStr) return null;

    try {
      return JSON.parse(userStr) as User;
    } catch {
      return null;
    }
  }

  async refreshToken(): Promise<string | null> {
    const refreshToken = this.getRefreshToken();

    if (!refreshToken) return null;

    try {
      const response = await axios.post(`${API_URL}/auth/refresh`, {
        refresh_token: refreshToken,
      });

      const newToken = response.data.token || response.data.data?.accessToken;

      if (!newToken) return null;

      localStorage.setItem('access_token', newToken);
      axiosInstance.defaults.headers.common.Authorization = `Bearer ${newToken}`;
      this.startRefreshTokenTimer();

      return newToken;
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