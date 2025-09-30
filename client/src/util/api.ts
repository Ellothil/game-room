import axios from "axios";

const API_TIMEOUT = 10_000; // 10 second timeout
const UNAUTHORIZED_STATUS = 401;

// Create axios instance with base URL
export const api = axios.create({
  // biome-ignore lint: axios requires baseURL property name
  baseURL: import.meta.env.VITE_SERVER_URL,
  timeout: API_TIMEOUT,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor (optional - for adding auth tokens later)
api.interceptors.request.use(
  (config) => {
    // You can add auth tokens here if needed
    // const token = localStorage.getItem('token');
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor (optional - for handling common errors)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle common errors here (e.g., 401 unauthorized)
    if (error.response?.status === UNAUTHORIZED_STATUS) {
      // Redirect to login or clear stored tokens
      // Handle unauthorized access here
    }
    return Promise.reject(error);
  }
);
