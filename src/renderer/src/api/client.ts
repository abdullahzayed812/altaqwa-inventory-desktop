import axios from 'axios';

const client = axios.create({
  baseURL: 'http://localhost:3000/api',
  timeout: 15000,
});

client.interceptors.response.use(
  r => r,
  err => Promise.reject(new Error(err.response?.data?.error || err.message || 'حدث خطأ غير متوقع'))
);

export default client;
