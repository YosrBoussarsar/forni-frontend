import React, { useEffect, useState, useContext } from "react";
import { userApi } from "../api/userApi";
import { AuthContext } from "../context/AuthContext";
import CustomerLayout from "../components/CustomerLayout";
import BakeryOwnerLayout from "../components/BakeryOwnerLayout";
import {
  Box,
  TextField,
  Button,
  Typography,
  CircularProgress,
  Paper,
  Grid,
  Alert,
  Snackbar,
  Avatar,
  Divider,
  Card,
  CardContent,
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";

export default function Profile() {
  const { user } = useContext(AuthContext);
  const [profile, setProfile] = useState(null);
  const [originalProfile, setOriginalProfile] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem("token");
    if (!token) {
      setError("Please log in to view your profile");
      setLoading(false);
      return;
    }

    setLoading(true);
    
    // Try to get user data from localStorage first
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setProfile(userData);
        setLoading(false);
        return;
      } catch (e) {
        console.error("Failed to parse stored user data:", e);
      }
    }

    // If no stored user data, decode JWT token
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
        name: tokenData.name,
        phone: tokenData.phone || "",
        address: tokenData.address || ""
      };
      
      setProfile(userData);
      setOriginalProfile(userData);
      setLoading(false);
    } catch (decodeError) {
      console.error("Failed to decode token:", decodeError);
      
      // Fallback: try API call
      userApi
        .getProfile()
        .then((res) => {
          console.log("Profile data received:", res.data);
          setProfile(res.data);
          setOriginalProfile(res.data);
          setLoading(false);
          setError("");
        })
        .catch((err) => {
          console.error("Error loading profile:", err);
          setError("Failed to load profile. Please log in again.");
          setLoading(false);
        });
    }
  }, []);

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleEdit = () => {
    setIsEditMode(true);
  };

  const handleCancel = () => {
    setProfile(originalProfile);
    setIsEditMode(false);
    setError("");
  };

  const handleSave = () => {
    setSaving(true);
    setError("");
    userApi
      .updateProfile(profile)
      .then(() => {
        setSaving(false);
        setOriginalProfile(profile);
        setIsEditMode(false);
        setSuccessMsg("Profile updated successfully!");
      })
      .catch((err) => {
        console.error("Error updating profile:", err);
        let errorMsg = "Failed to update profile";
        if (err.response?.data?.message) {
          errorMsg = err.response.data.message;
        }
        setError(String(errorMsg));
        setSaving(false);
      });
  };

  if (loading) {
    const LayoutComponent = user?.role === 'bakery_owner' ? BakeryOwnerLayout : CustomerLayout;
    return (
      <LayoutComponent>
        <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress size={60} />
          <Typography sx={{ mt: 2 }}>Loading profile...</Typography>
        </Box>
      </LayoutComponent>
    );
  }

  if (error && !profile) {
    const LayoutComponent = user?.role === 'bakery_owner' ? BakeryOwnerLayout : CustomerLayout;
    return (
      <LayoutComponent>
        <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" minHeight="60vh">
          <Alert severity="error" sx={{ maxWidth: 500, mb: 2 }}>
            {error}
          </Alert>
          <Button 
            variant="contained" 
            onClick={() => window.location.href = "/login"}
          >
            Go to Login
          </Button>
        </Box>
      </LayoutComponent>
    );
  }

  if (!profile) {
    const LayoutComponent = user?.role === 'bakery_owner' ? BakeryOwnerLayout : CustomerLayout;
    return (
      <LayoutComponent>
        <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" minHeight="60vh">
          <Typography>No profile data available</Typography>
          <Button 
            variant="contained" 
            sx={{ mt: 2 }}
            onClick={() => window.location.reload()}
          >
            Reload
          </Button>
        </Box>
      </LayoutComponent>
    );
  }

  const LayoutComponent = user?.role === 'bakery_owner' ? BakeryOwnerLayout : CustomerLayout;

  return (
    <LayoutComponent>
      <Box sx={{ maxWidth: 1000, mx: "auto", py: 4 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
          <Typography variant="h4" sx={{ fontWeight: "bold" }}>
            My Profile
          </Typography>
          {!isEditMode && (
            <Button
              variant="contained"
              startIcon={<EditIcon />}
              onClick={handleEdit}
            >
              Edit Profile
            </Button>
          )}
        </Box>

        <Grid container spacing={3}>
          {/* Profile Summary Card */}
          <Grid item xs={12} md={4}>
            <Card elevation={3}>
              <CardContent sx={{ textAlign: "center", py: 4 }}>
                <Avatar
                  sx={{
                    width: 100,
                    height: 100,
                    mx: "auto",
                    mb: 2,
                    bgcolor: "primary.main",
                    fontSize: 40,
                  }}
                >
                  {profile.first_name?.[0]?.toUpperCase() || profile.email?.[0]?.toUpperCase() || "U"}
                </Avatar>
                <Typography variant="h5" gutterBottom>
                  {profile.first_name || ""} {profile.last_name || ""}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {profile.email || ""}
                </Typography>
                <Box
                  sx={{
                    mt: 2,
                    px: 2,
                    py: 0.5,
                    bgcolor: profile.role === "admin" ? "error.light" : 
                            profile.role === "bakery_owner" ? "warning.light" : "success.light",
                    borderRadius: 2,
                    display: "inline-block",
                  }}
                >
                  <Typography variant="caption" sx={{ textTransform: "capitalize", fontWeight: "bold" }}>
                    {profile.role?.replace("_", " ") || "customer"}
                  </Typography>
                </Box>
                <Divider sx={{ my: 2 }} />
                <Typography variant="body2" color="text.secondary">
                  Member since {profile.created_at ? new Date(profile.created_at).toLocaleDateString() : "N/A"}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Profile Edit Form */}
          <Grid item xs={12} md={8}>
            <Paper elevation={3} sx={{ p: 4 }}>
              <Typography variant="h6" sx={{ mb: 3 }}>
                Personal Information
              </Typography>

              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="First Name"
                    name="first_name"
                    value={profile.first_name || ""}
                    onChange={handleChange}
                    disabled={!isEditMode}
                    InputProps={{
                      startAdornment: <PersonIcon sx={{ mr: 1, color: "action.active" }} />,
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Last Name"
                    name="last_name"
                    value={profile.last_name || ""}
                    onChange={handleChange}
                    disabled={!isEditMode}
                    InputProps={{
                      startAdornment: <PersonIcon sx={{ mr: 1, color: "action.active" }} />,
                    }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Email"
                    name="email"
                    value={profile.email || ""}
                    disabled
                    InputProps={{
                      startAdornment: <EmailIcon sx={{ mr: 1, color: "action.active" }} />,
                    }}
                    helperText="Email cannot be changed"
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Phone Number"
                    name="phone"
                    value={profile.phone || ""}
                    onChange={handleChange}
                    disabled={!isEditMode}
                    placeholder="12345678"
                    InputProps={{
                      startAdornment: <PhoneIcon sx={{ mr: 1, color: "action.active" }} />,
                    }}
                    helperText="8 digits phone number"
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Latitude"
                    name="latitude"
                    type="number"
                    value={profile.latitude || ""}
                    onChange={handleChange}
                    disabled={!isEditMode}
                    InputProps={{
                      startAdornment: <LocationOnIcon sx={{ mr: 1, color: "action.active" }} />,
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Longitude"
                    name="longitude"
                    type="number"
                    value={profile.longitude || ""}
                    onChange={handleChange}
                    disabled={!isEditMode}
                    InputProps={{
                      startAdornment: <LocationOnIcon sx={{ mr: 1, color: "action.active" }} />,
                    }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end", mt: 2 }}>
                    {isEditMode ? (
                      <>
                        <Button
                          variant="outlined"
                          startIcon={<CancelIcon />}
                          onClick={handleCancel}
                        >
                          Cancel
                        </Button>
                        <Button
                          variant="contained"
                          startIcon={<SaveIcon />}
                          onClick={handleSave}
                          disabled={saving}
                          size="large"
                        >
                          {saving ? "Saving..." : "Save Changes"}
                        </Button>
                      </>
                    ) : null}
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        </Grid>
      </Box>

      <Snackbar
        open={!!successMsg}
        autoHideDuration={4000}
        onClose={() => setSuccessMsg("")}
      >
        <Alert severity="success" onClose={() => setSuccessMsg("")}>
          {successMsg}
        </Alert>
      </Snackbar>
    </LayoutComponent>
  );
}
