import axios from 'axios';

export const axiosInstance = axios.create({
  baseURL: 'http://localhost:5000/api',
});

// Interceptor to add token
axiosInstance.interceptors.request.use((config) => {
  const userInfo = localStorage.getItem('userInfo');
  if (userInfo) {
    const parsedUser = JSON.parse(userInfo);
    config.headers.Authorization = `Bearer ${parsedUser.token}`;
  }
  return config;
});
