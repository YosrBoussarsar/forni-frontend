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
  InputAdornment,
  alpha,
  useTheme,
  Paper,
  Chip,
} from "@mui/material";
import EmailIcon from "@mui/icons-material/Email";
import LockIcon from "@mui/icons-material/Lock";
import StorefrontIcon from "@mui/icons-material/Storefront";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import BakeryDiningIcon from "@mui/icons-material/BakeryDining";

export default function Login() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const theme = useTheme();

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
      console.log('Login response:', res.data);
      const token = res.data.access_token;
      console.log('Token received:', token ? 'Yes (' + token.substring(0, 20) + '...)' : 'No');
      
      // Store token first so it can be used in the next request
      localStorage.setItem("token", token);
      
      // Check if user data is in login response
      if (res.data.user && res.data.user.role) {
        const userData = res.data.user;
        console.log('✓ Login successful with user data from response');
        console.log('User role:', userData.role);
        console.log('User data:', userData);
        login(token, userData);
        
        // Verify localStorage after login
        console.log('Verifying localStorage after login...');
        console.log('Token in localStorage:', !!localStorage.getItem('token'));
        console.log('User in localStorage:', localStorage.getItem('user'));
        
        // Redirect based on role
        console.log('Redirecting based on role:', userData.role);
        if (userData.role === 'admin') {
          console.log('Navigating to /admin-dashboard');
          navigate("/admin-dashboard");
        } else if (userData.role === 'bakery_owner') {
          console.log('Navigating to /bakery-dashboard');
          navigate("/bakery-dashboard");
        } else {
          console.log('Navigating to /customer-dashboard');
          navigate("/customer-dashboard");
        }
      } else {
        // Decode JWT token to get user info
        console.log('User data not in response, decoding token...');
        try {
          console.log('Token parts:', token.split('.').length);
          const base64Url = token.split('.')[1];
          const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
          const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
          }).join(''));
          
          const tokenData = JSON.parse(jsonPayload);
          console.log('Decoded token data:', tokenData);
          
          // Extract user data from token
          const userData = {
            id: tokenData.sub || tokenData.user_id || tokenData.id,
            email: tokenData.email,
            role: tokenData.role,
            name: tokenData.name
          };
          
          console.log('✓ Extracted user data from token');
          console.log('User role:', userData.role);
          console.log('User data:', userData);
          
          // If role is missing from token, fetch from profile API
          if (!userData.role) {
            console.log('⚠️ Role missing from token, fetching user profile...');
            try {
              const profileRes = await userApi.getProfile();
              const profileData = profileRes.data;
              console.log('Profile data received:', profileData);
              
              // Merge profile data with token data
              const completeUserData = {
                id: userData.id || profileData.id,
                email: profileData.email,
                role: profileData.role,
                name: profileData.name || `${profileData.first_name} ${profileData.last_name}`,
                first_name: profileData.first_name,
                last_name: profileData.last_name,
                phone: profileData.phone
              };
              
              console.log('✓ Complete user data:', completeUserData);
              login(token, completeUserData);
              
              // Redirect based on role from profile
              console.log('Redirecting based on role:', completeUserData.role);
              if (completeUserData.role === 'admin') {
                console.log('Navigating to /admin-dashboard');
                navigate("/admin-dashboard");
              } else if (completeUserData.role === 'bakery_owner') {
                console.log('Navigating to /bakery-dashboard');
                navigate("/bakery-dashboard");
              } else {
                console.log('Navigating to /customer-dashboard');
                navigate("/customer-dashboard");
              }
              return; // Exit early after successful profile fetch
            } catch (profileError) {
              console.error("Failed to fetch profile:", profileError);
              localStorage.removeItem("token");
              setError("Failed to retrieve user information. Please try again.");
              return;
            }
          }
          
          login(token, userData);
          
          // Verify localStorage after login
          console.log('Verifying localStorage after login...');
          console.log('Token in localStorage:', !!localStorage.getItem('token'));
          console.log('User in localStorage:', localStorage.getItem('user'));
          
          // Redirect based on role
          console.log('Redirecting based on role:', userData.role);
          if (userData.role === 'admin') {
            console.log('Navigating to /admin-dashboard');
            navigate("/admin-dashboard");
          } else if (userData.role === 'bakery_owner') {
            console.log('Navigating to /bakery-dashboard');
            navigate("/bakery-dashboard");
          } else {
            console.log('Navigating to /customer-dashboard');
            navigate("/customer-dashboard");
          }
        } catch (decodeError) {
          console.error("Failed to decode token:", decodeError);
          // Fallback: try to fetch profile
          try {
            console.log('Fetching user profile as fallback...');
            const profileRes = await userApi.getProfile();
            const userData = profileRes.data;
            console.log('Profile data received:', userData);
            console.log('User role from profile:', userData.role);
            
            login(token, userData);
            
            // Verify localStorage after login
            console.log('Verifying localStorage after login...');
            console.log('Token in localStorage:', !!localStorage.getItem('token'));
            console.log('User in localStorage:', localStorage.getItem('user'));
            
            // Redirect based on role
            console.log('Redirecting based on role:', userData.role);
            if (userData.role === 'admin') {
              console.log('Navigating to /admin-dashboard');
              navigate("/admin-dashboard");
            } else if (userData.role === 'bakery_owner') {
              console.log('Navigating to /bakery-dashboard');
              navigate("/bakery-dashboard");
            } else {
              console.log('Navigating to /customer-dashboard');
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
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 50%, ${theme.palette.secondary.dark} 100%)`,
        py: 4,
      }}
    >
      <Card
        elevation={12}
        sx={{
          width: 450,
          p: 4,
          borderRadius: 4,
          background: "rgba(255, 255, 255, 0.98)",
          backdropFilter: "blur(20px)",
        }}
      >
        <CardContent>
          <Box sx={{ textAlign: "center", mb: 4 }}>
            <Box
              sx={{
                display: "inline-flex",
                p: 2,
                borderRadius: "50%",
                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
                mb: 2,
              }}
            >
              <StorefrontIcon sx={{ fontSize: 48, color: "white" }} />
            </Box>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                mb: 1,
              }}
            >
              Welcome to Forni
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Login to access your account
            </Typography>
          </Box>

          {/* User Type Info */}
          <Paper elevation={0} sx={{ p: 2, mb: 3, bgcolor: "grey.50", borderRadius: 2 }}>
            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Chip 
                icon={<ShoppingCartIcon />} 
                label="Customer" 
                size="small"
                sx={{ bgcolor: 'white' }}
              />
              <Chip 
                icon={<BakeryDiningIcon />} 
                label="Bakery Owner" 
                size="small"
                sx={{ bgcolor: 'white' }}
              />
            </Box>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1, textAlign: 'center' }}>
              Login with your credentials - you'll be directed to the right dashboard
            </Typography>
          </Paper>

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
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              fullWidth
              label="Password"
              type="password"
              margin="normal"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />

            <Button
              fullWidth
              variant="contained"
              size="large"
              type="submit"
              sx={{
                mt: 3,
                py: 1.5,
                fontSize: "1.1rem",
                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
                boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.4)}`,
                "&:hover": {
                  background: `linear-gradient(135deg, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`,
                  boxShadow: `0 6px 24px ${alpha(theme.palette.primary.main, 0.5)}`,
                },
              }}
            >
              Login
            </Button>
          </form>

          <Box sx={{ mt: 3, textAlign: "center" }}>
            <Typography variant="body2" color="text.secondary">
              Don't have an account?{" "}
              <Link
                to="/register"
                style={{
                  color: theme.palette.primary.main,
                  textDecoration: "none",
                  fontWeight: 600,
                }}
              >
                Register here
              </Link>
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
