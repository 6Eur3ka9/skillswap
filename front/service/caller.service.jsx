
// 192.168.1.42    ---   ip ecole = 192.168.1.29

import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const API_URL = 'http://192.168.1.42:4242/api'; 

const AxiosClient = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

AxiosClient.interceptors.request.use(
  async config => {
    const token = await SecureStore.getItemAsync('userAccessToken');

  
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  err => Promise.reject(err)
);

AxiosClient.interceptors.response.use(
  res => res,
  async err => {
    const originalReq = err.config;

    if (err.response?.status === 401 && !originalReq._retry) {
      if (isRefreshing) {
      
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
        .then(token => {
          originalReq.headers.Authorization = `Bearer ${token}`;
          return AxiosClient(originalReq);
        })
        .catch(e => Promise.reject(e));
      }

      originalReq._retry = true;
      isRefreshing = true;

      const refreshToken = await SecureStore.getItemAsync('userRefreshToken');
      console.log('Attempting to refresh token with:', refreshToken);
      
      try {
        const { data } = await axios.post(`${API_URL}/auth/refresh_token`, { refreshToken });
        const newAccessToken = data.accessToken;
        const newRefreshToken = data.refreshToken;

      
        await SecureStore.setItemAsync('userAccessToken', newAccessToken);
        if (newRefreshToken) {
          await SecureStore.setItemAsync('userRefreshToken', newRefreshToken);
        }

        AxiosClient.defaults.headers.Authorization = `Bearer ${newAccessToken}`;
        processQueue(null, newAccessToken);

     
        originalReq.headers.Authorization = `Bearer ${newAccessToken}`;
        return AxiosClient(originalReq);
      } catch (refreshError) {
        processQueue(refreshError, null);
      
        await SecureStore.deleteItemAsync('userAccessToken');
        await SecureStore.deleteItemAsync('userRefreshToken');
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(err);
  }
);

export default AxiosClient;
