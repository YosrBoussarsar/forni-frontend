import React, { useEffect, useState, useContext } from "react";
import { bakeryApi } from "../api/bakeryApi";
import { AuthContext } from "../context/AuthContext";
import BakeryOwnerLayout from "../components/BakeryOwnerLayout";
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Grid,
  Paper,
} from "@mui/material";
import StorefrontIcon from "@mui/icons-material/Storefront";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";

export default function ManageBakery() {
  const { user } = useContext(AuthContext);
  const [bakery, setBakery] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    address: "",
    phone: "",
    opening_hours: "",
  });
  const [originalFormData, setOriginalFormData] = useState({
    name: "",
    description: "",
    address: "",
    phone: "",
    opening_hours: "",
  });

  useEffect(() => {
    // Fetch bakery owned by current user
    bakeryApi
      .getMy()
      .then((res) => {
        setBakery(res.data);
        const data = {
          name: res.data.name || "",
          description: res.data.description || "",
          address: res.data.address || "",
          phone: res.data.phone || "",
          opening_hours: res.data.opening_hours || "",
        };
        setFormData(data);
        setOriginalFormData(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error loading bakery:", err);
        // If no bakery exists, enable edit mode to create one
        setIsEditMode(true);
        setLoading(false);
      });
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleEdit = () => {
    setIsEditMode(true);
  };

  const handleCancel = () => {
    if (bakery) {
      setFormData(originalFormData);
      setIsEditMode(false);
      setError("");
      setSuccess(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setSaving(true);

    try {
      if (bakery) {
        // Update existing bakery
        await bakeryApi.update(bakery.id, formData);
        setSuccess(true);
        setOriginalFormData(formData);
        setIsEditMode(false);
      } else {
        // Create new bakery
        const res = await bakeryApi.create(formData);
        setBakery(res.data);
        setOriginalFormData(formData);
        setSuccess(true);
        setIsEditMode(false);
      }
      setSaving(false);
    } catch (err) {
      console.error("Error saving bakery:", err);
      console.error("Error response:", err.response?.data);
      
      // Extract detailed error message from backend
      let errorMessage = "Failed to save bakery information. Please try again.";
      
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
          errorMessage = err.response.data.detail;
        }
      }
      
      setError(errorMessage);
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <BakeryOwnerLayout>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress />
        </Box>
      </BakeryOwnerLayout>
    );
  }

  return (
    <BakeryOwnerLayout>
      <Box sx={{ maxWidth: 800, mx: "auto", py: 4 }}>
        <Paper elevation={2} sx={{ p: 3, mb: 4, bgcolor: "#FDF2E9" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, justifyContent: "space-between" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <StorefrontIcon sx={{ fontSize: 40, color: "#D35400" }} />
              <Box>
                <Typography variant="h4" gutterBottom>
                  {bakery ? "Your Bakery" : "Create Your Bakery"}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  {bakery
                    ? isEditMode ? "Update your bakery information" : "View your bakery information"
                    : "Set up your bakery profile to start selling"}
                </Typography>
              </Box>
            </Box>
            {bakery && !isEditMode && (
              <Button
                variant="contained"
                startIcon={<EditIcon />}
                onClick={handleEdit}
              >
                Edit
              </Button>
            )}
          </Box>
        </Paper>

        <Card>
          <CardContent sx={{ p: 4 }}>
            {error && (
              <Alert 
                severity="error" 
                sx={{ 
                  mb: 3,
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
                  Error from backend:
                </Typography>
                {error}
              </Alert>
            )}
            {success && (
              <Alert severity="success" sx={{ mb: 3 }}>
                Bakery information saved successfully!
              </Alert>
            )}

            <form onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    required
                    label="Bakery Name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    disabled={!isEditMode}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    required
                    multiline
                    rows={4}
                    label="Description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    disabled={!isEditMode}
                    placeholder="Tell customers about your bakery..."
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    required
                    label="Address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    disabled={!isEditMode}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    required
                    label="Phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    disabled={!isEditMode}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Opening Hours"
                    name="opening_hours"
                    value={formData.opening_hours}
                    onChange={handleChange}
                    disabled={!isEditMode}
                    placeholder="e.g., Mon-Fri: 7am-7pm"
                  />
                </Grid>

                {isEditMode && (
                  <Grid item xs={12}>
                    <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
                      {bakery && (
                        <Button
                          variant="outlined"
                          startIcon={<CancelIcon />}
                          onClick={handleCancel}
                          disabled={saving}
                        >
                          Cancel
                        </Button>
                      )}
                      <Button
                        type="submit"
                        variant="contained"
                        startIcon={<SaveIcon />}
                        size="large"
                        disabled={saving}
                        sx={{ py: 1.5 }}
                      >
                        {saving ? (
                          <CircularProgress size={24} color="inherit" />
                        ) : bakery ? (
                          "Save Changes"
                        ) : (
                          "Create Bakery"
                        )}
                      </Button>
                    </Box>
                  </Grid>
                )}
              </Grid>
            </form>
          </CardContent>
        </Card>
      </Box>
    </BakeryOwnerLayout>
  );
}
