import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { authApi } from "../api/authApi";
import { userApi } from "../api/userApi";
import { useNavigate, Link } from "react-router-dom";
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
} from "@mui/material";

export default function Login() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.email || !form.password) {
      setError("Please enter both email and password.");
      return;
    }

    try {
      const res = await authApi.login(form);
      const token = res.data.access_token;
      
      // Store token first so it can be used in the next request
      localStorage.setItem("token", token);
      
      // Check if user data is in login response
      if (res.data.user) {
        const userData = res.data.user;
        login(token, userData);
        
        // Redirect based on role
        if (userData.role === 'admin') {
          navigate("/admin-dashboard");
        } else if (userData.role === 'bakery_owner') {
          navigate("/bakery-dashboard");
        } else {
          navigate("/customer-dashboard");
        }
      } else {
        // Decode JWT token to get user info
        try {
          const base64Url = token.split('.')[1];
          const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
          const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
          }).join(''));
          
          const tokenData = JSON.parse(jsonPayload);
          
          // Extract user data from token
          const userData = {
            id: tokenData.sub || tokenData.user_id || tokenData.id,
            email: tokenData.email,
            role: tokenData.role,
            name: tokenData.name
          };
          
          login(token, userData);
          
          // Redirect based on role
          if (userData.role === 'admin') {
            navigate("/admin-dashboard");
          } else if (userData.role === 'bakery_owner') {
            navigate("/bakery-dashboard");
          } else {
            navigate("/customer-dashboard");
          }
        } catch (decodeError) {
          console.error("Failed to decode token:", decodeError);
          // Fallback: try to fetch profile
          try {
            const profileRes = await userApi.getProfile();
            const userData = profileRes.data;
            
            login(token, userData);
            
            // Redirect based on role
            if (userData.role === 'admin') {
              navigate("/admin-dashboard");
            } else if (userData.role === 'bakery_owner') {
              navigate("/bakery-dashboard");
            } else {
              navigate("/customer-dashboard");
            }
          } catch (profileError) {
            console.error("Failed to fetch profile:", profileError);
            localStorage.removeItem("token");
            setError("Failed to retrieve user information. Please try again.");
          }
        }
      }
    } catch (err) {
      console.error("Login failed:", err);
      localStorage.removeItem("token"); // Clean up token if login fails
      setError("Invalid credentials. Please try again.");
    }
  };

  return (
    <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
      <Card sx={{ width: 400, p: 2 }}>
        <CardContent>
          <Typography variant="h5" sx={{ mb: 2 }}>
            Login to Forni
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Email"
              type="email"
              margin="normal"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />

            <TextField
              fullWidth
              label="Password"
              type="password"
              margin="normal"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />

            <Button
              fullWidth
              variant="contained"
              color="primary"
              sx={{ mt: 2 }}
              type="submit"
            >
              Login
            </Button>
          </form>

          <Typography variant="body2" sx={{ mt: 2 }}>
            Don’t have an account?{" "}
            <Link to="/register" style={{ color: "#D35400" }}>
              Register here
            </Link>
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
