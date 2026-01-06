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
      login(res.data.access_token);
      navigate("/dashboard");
    } catch (err) {
      console.error("Login failed:", err);
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
