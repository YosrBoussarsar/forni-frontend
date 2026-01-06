import axios from "axios";

const axiosClient = axios.create({
  baseURL: "http://localhost:5000",
});

axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to handle authentication errors
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized and 422 with JWT errors
    if (error.response?.status === 401 || 
        (error.response?.status === 422 && 
         error.response?.data?.msg?.includes("segments"))) {
      console.error('Authentication error. Token is invalid. Clearing and redirecting to login.');
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default axiosClient;
