import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { authApi } from "../api/authApi";
import { useNavigate, Link } from "react-router-dom";
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Grid,
  InputAdornment,
  alpha,
  useTheme,
  ToggleButton,
  ToggleButtonGroup,
  Paper,
  Alert,
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import LockIcon from "@mui/icons-material/Lock";
import StorefrontIcon from "@mui/icons-material/Storefront";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import BakeryDiningIcon from "@mui/icons-material/BakeryDining";

export default function Register() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const theme = useTheme();

  const [form, setForm] = useState({
    email: "",
    password: "",
    first_name: "",
    last_name: "",
    phone: "",
    role: "customer", // Default to customer
  });

  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); // Clear previous errors
    
    try {
      console.log("Submitting registration with data:", form);
      const res = await authApi.register(form);
      const token = res.data.access_token;
      
      // Get user data from response or create complete user object
      let userData = res.data.user;
      
      // If user data is incomplete, try to decode token or fetch profile
      if (!userData || !userData.id) {
        try {
          // First try decoding the JWT token
          const base64Url = token.split('.')[1];
          const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
          const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
          }).join(''));
          
          const tokenData = JSON.parse(jsonPayload);
          
          userData = {
            id: tokenData.sub || tokenData.user_id || tokenData.id,
            email: form.email,
            role: form.role,
            name: `${form.first_name} ${form.last_name}`,
            first_name: form.first_name,
            last_name: form.last_name,
            phone: form.phone
          };
        } catch (decodeError) {
          console.warn("Could not decode token, using form data:", decodeError);
          // Fallback to form data
          userData = {
            email: form.email,
            role: form.role,
            name: `${form.first_name} ${form.last_name}`,
            first_name: form.first_name,
            last_name: form.last_name,
            phone: form.phone
          };
        }
      }
      
      // Ensure user data is saved in login function
      login(token, userData);
      
      // Double-check localStorage has the data
      console.log('Registration complete. Token stored:', !!localStorage.getItem('token'));
      console.log('User data stored:', localStorage.getItem('user'));
      
      // Redirect based on role
      if (form.role === 'bakery_owner') {
        navigate("/bakery-dashboard");
      } else {
        navigate("/customer-dashboard");
      }
    } catch (err) {
      console.error("Registration error:", err);
      console.error("Error response:", err.response?.data);
      
      // Extract error message from backend
      let errorMessage = "Registration failed. Please try again.";
      
      if (err.response?.data) {
        if (typeof err.response.data === 'string') {
          errorMessage = err.response.data;
        } else if (err.response.data.error) {
          errorMessage = err.response.data.error;
        } else if (err.response.data.message) {
          errorMessage = err.response.data.message;
        } else if (err.response.data.msg) {
          errorMessage = err.response.data.msg;
        } else if (err.response.data.detail) {
          // Handle validation error details
          const detail = err.response.data.detail;
          if (Array.isArray(detail)) {
            // Flask/FastAPI style validation errors
            errorMessage = detail.map(d => `${d.loc?.join('.')}: ${d.msg}`).join(', ');
          } else if (typeof detail === 'string') {
            errorMessage = detail;
          }
        } else if (err.response.data.errors) {
          // Handle multiple validation errors
          const errors = err.response.data.errors;
          if (typeof errors === 'object' && Object.keys(errors).length > 0) {
            errorMessage = Object.entries(errors).map(([key, val]) => `${key}: ${val}`).join(', ');
          }
        }
      }
      
      // If we got a generic "Validation failed" error, add helpful suggestions
      if (errorMessage.toLowerCase().includes('validation failed') || 
          errorMessage === 'Registration failed. Please try again.') {
        errorMessage = `Validation failed. Please check:

• Email: Must be unique and valid format (e.g., your.name@example.com)
• Phone: Try with country code (e.g., +21625777888) or leading zero
• Password: Minimum 6 characters, may require uppercase, lowercase, number
• All fields: First name, last name, email, phone, password are required

Common issues:
- Email already registered? Try a different email
- Phone format: Try +216XXXXXXXX or 0XXXXXXXXX
- Password too simple? Try adding uppercase and numbers`;
      }
      
      setError(errorMessage);
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
          width: 550,
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
              Join Forni
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Create your account and start saving food
            </Typography>
          </Box>

          {/* Role Selection */}
          <Paper elevation={0} sx={{ p: 2, mb: 3, bgcolor: "grey.50", borderRadius: 2 }}>
            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1.5, textAlign: "center" }}>
              I want to register as:
            </Typography>
            <ToggleButtonGroup
              value={form.role}
              exclusive
              onChange={(e, newRole) => {
                if (newRole !== null) {
                  setForm({ ...form, role: newRole });
                }
              }}
              fullWidth
              sx={{ 
                '& .MuiToggleButton-root': {
                  py: 1.5,
                  textTransform: 'none',
                  fontSize: '1rem',
                  '&.Mui-selected': {
                    bgcolor: theme.palette.primary.main,
                    color: 'white',
                    '&:hover': {
                      bgcolor: theme.palette.primary.dark,
                    },
                  },
                },
              }}
            >
              <ToggleButton value="customer">
                <ShoppingCartIcon sx={{ mr: 1 }} />
                Customer
              </ToggleButton>
              <ToggleButton value="bakery_owner">
                <BakeryDiningIcon sx={{ mr: 1 }} />
                Bakery Owner
              </ToggleButton>
            </ToggleButtonGroup>
            <Typography 
              variant="caption" 
              color="text.secondary" 
              sx={{ display: 'block', mt: 1, textAlign: 'center' }}
            >
              {form.role === 'customer' 
                ? '🛒 Browse bakeries and buy surplus bags' 
                : '🥖 Manage your bakery and reduce food waste'}
            </Typography>
          </Paper>

          {error && (
            <Alert 
              severity="error" 
              sx={{ 
                mb: 2,
                '& .MuiAlert-message': {
                  width: '100%',
                  userSelect: 'text',
                  fontFamily: 'monospace',
                  fontSize: '0.9rem',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word'
                }
              }}
            >
              <Typography component="div" sx={{ fontWeight: 600, mb: 0.5 }}>
                Registration Error:
              </Typography>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  required
                  label="First Name"
                  value={form.first_name}
                  onChange={(e) => setForm({ ...form, first_name: e.target.value })}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  required
                  label="Last Name"
                  value={form.last_name}
                  onChange={(e) => setForm({ ...form, last_name: e.target.value })}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  required
                  label="Email"
                  type="email"
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
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  required
                  label="Phone"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PhoneIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  required
                  label="Password"
                  type="password"
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
              </Grid>
            </Grid>

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
              Create Account
            </Button>
          </form>

          <Box sx={{ mt: 3, textAlign: "center" }}>
            <Typography variant="body2" color="text.secondary">
              Already have an account?{" "}
              <Link
                to="/"
                style={{
                  color: theme.palette.primary.main,
                  textDecoration: "none",
                  fontWeight: 600,
                }}
              >
                Login here
              </Link>
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
