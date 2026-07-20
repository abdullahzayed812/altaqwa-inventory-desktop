import axios from 'axios';

const BASE_URL = import.meta.env.DEV ? 'http://localhost:3000/api' : 'http://187.124.6.93/api';

const client = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
});

client.interceptors.response.use(
  r => r,
  err => Promise.reject(new Error(err.response?.data?.error || err.message || 'حدث خطأ غير متوقع'))
);

export default client;
