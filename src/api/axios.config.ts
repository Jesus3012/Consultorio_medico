import axios from 'axios';
import createAuthRefreshInterceptor from 'axios-auth-refresh';
import authService from '../services/auth/auth.service';

const axiosInstance = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL ||
    'https://api-medica.rexcoresolutions.com/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = authService.getToken();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    console.error('❌ Request error:', error);
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response) {
      console.error('❌ Response status:', error.response.status);
      console.error('❌ Response data:', JSON.stringify(error.response.data, null, 2));
    } else if (error.request) {
      console.error('❌ No response from server:', error.request);
    } else {
      console.error('❌ Request error:', error.message);
    }

    return Promise.reject(error);
  }
);

const refreshAuthLogic = async (failedRequest: any) => {
  const newToken = await authService.refreshToken();

  if (newToken) {
    failedRequest.response.config.headers.Authorization = `Bearer ${newToken}`;
    return Promise.resolve();
  }

  return Promise.reject();
};

createAuthRefreshInterceptor(axiosInstance, refreshAuthLogic);

export default axiosInstance;