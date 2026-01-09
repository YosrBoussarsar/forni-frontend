import axios from "axios";

const axiosClient = axios.create({
  baseURL: "http://localhost:5000",
});

axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  // Check if token exists and is a valid JWT (not empty array or invalid string)
  if (token && token !== "[]" && token !== "null" && token !== "undefined" && token.length > 20) {
    config.headers.Authorization = `Bearer ${token}`;
  } else if (token && (token === "[]" || token.length < 20)) {
    console.error('Invalid token detected in localStorage:', token);
    console.error('Clearing invalid token...');
    localStorage.removeItem("token");
  }
  return config;
});

// Response interceptor to handle authentication errors
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only logout on actual authentication errors, not validation errors
    if (error.response?.status === 401) {
      console.error('Authentication error (401). Token is invalid.');
      console.error('Full error:', error.response?.data);
      console.error('Will logout in 5 seconds to allow error inspection...');
      
      setTimeout(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }, 5000);
    } else if (error.response?.status === 422) {
      // Only logout if it's a JWT-related error (token malformed/expired)
      const errorMsg = error.response?.data?.msg || error.response?.data?.message || '';
      const isJWTError = errorMsg.includes('segment') || 
                         errorMsg.includes('token') || 
                         errorMsg.includes('JWT') ||
                         errorMsg.includes('Signature');
      
      if (isJWTError) {
        console.error('========================================');
        console.error('JWT ERROR DETECTED - NOT ENOUGH SEGMENTS');
        console.error('Error message:', errorMsg);
        console.error('Full error:', error.response?.data);
        console.error('Current token:', localStorage.getItem('token'));
        console.error('Will logout in 5 seconds to allow error inspection...');
        console.error('========================================');
        
        // Don't logout immediately - give time to see the error
        setTimeout(() => {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }, 5000);
      }
      // Otherwise, let the error propagate normally (it's a validation error)
    }
    return Promise.reject(error);
  }
);

export default axiosClient;
