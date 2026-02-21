import axios from 'axios';

const BASE_URL = (import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') || 'http://localhost:5000') + '/api/v1';

export const axiosPublic = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

export const axiosPrivate = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});
