import React, { useEffect, useState } from "react";
import { surplusBagApi } from "../api/surplusBagApi";
import { bakeryApi } from "../api/bakeryApi";
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag";

export default function ManageSurplusBags() {
  const [bags, setBags] = useState([]);
  const [bakery, setBakery] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBag, setEditingBag] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    original_price: "",
    sale_price: "",
    quantity: "",
    pickup_time: "",
    tags: "",
  });

  const loadData = async () => {
    try {
      const bakeryRes = await bakeryApi.getMy();
      setBakery(bakeryRes.data);
      
      const bagsRes = await surplusBagApi.listByBakery(bakeryRes.data.id);
      setBags(bagsRes.data);
      setLoading(false);
    } catch (err) {
      console.error("Error loading data:", err);
      setError("Failed to load surplus bags");
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenDialog = (bag = null) => {
    if (bag) {
      setEditingBag(bag);
      setFormData({
        title: bag.title || "",
        description: bag.description || "",
        original_price: bag.original_price || "",
        sale_price: bag.sale_price || "",
        quantity: bag.quantity || "",
        pickup_time: bag.pickup_time || "",
        tags: Array.isArray(bag.tags) ? bag.tags.join(", ") : bag.tags || "",
      });
    } else {
      setEditingBag(null);
      setFormData({
        title: "",
        description: "",
        original_price: "",
        sale_price: "",
        quantity: "",
        pickup_time: "",
        tags: "",
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingBag(null);
    setError("");
    setSuccess(false);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setSaving(true);

    try {
      const submitData = {
        ...formData,
        bakery_id: bakery.id,
        original_price: parseFloat(formData.original_price),
        sale_price: parseFloat(formData.sale_price),
        quantity: parseInt(formData.quantity),
        tags: formData.tags,
      };

      if (editingBag) {
        await surplusBagApi.update(editingBag.id, submitData);
      } else {
        await surplusBagApi.create(submitData);
      }

      await loadData();
      setSuccess(true);
      setSaving(false);
      setTimeout(() => handleCloseDialog(), 1500);
    } catch (err) {
      console.error("Error saving surplus bag:", err);
      setError("Failed to save surplus bag. Please try again.");
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this surplus bag?")) return;

    try {
      await surplusBagApi.delete(id);
      await loadData();
    } catch (err) {
      console.error("Error deleting surplus bag:", err);
      alert("Failed to delete surplus bag");
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

  if (!bakery) {
    return (
      <BakeryOwnerLayout>
        <Box sx={{ maxWidth: 600, mx: "auto", py: 4 }}>
          <Alert severity="warning">
            You need to set up your bakery profile first before adding surplus bags.
          </Alert>
        </Box>
      </BakeryOwnerLayout>
    );
  }

  return (
    <BakeryOwnerLayout>
      <Box sx={{ maxWidth: 1200, mx: "auto", py: 4 }}>
        <Paper elevation={2} sx={{ p: 3, mb: 4, bgcolor: "#FDF2E9" }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <ShoppingBagIcon sx={{ fontSize: 40, color: "#D35400" }} />
              <Box>
                <Typography variant="h4">Manage Surplus Bags</Typography>
                <Typography variant="body1" color="text.secondary">
                  {bakery.name}
                </Typography>
              </Box>
            </Box>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog()}
            >
              Add Surplus Bag
            </Button>
          </Box>
        </Paper>

        {bags.length === 0 ? (
          <Alert severity="info">
            No surplus bags yet. Click "Add Surplus Bag" to create your first surprise bag.
          </Alert>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Title</TableCell>
                  <TableCell>Original Price</TableCell>
                  <TableCell>Sale Price</TableCell>
                  <TableCell>Quantity</TableCell>
                  <TableCell>Pickup Time</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {bags.map((bag) => (
                  <TableRow key={bag.id}>
                    <TableCell>
                      <Typography variant="body1" fontWeight="bold">
                        {bag.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {bag.description}
                      </Typography>
                    </TableCell>
                    <TableCell>{bag.original_price} TND</TableCell>
                    <TableCell>
                      <Typography color="success.main" fontWeight="bold">
                        {bag.sale_price} TND
                      </Typography>
                    </TableCell>
                    <TableCell>{bag.quantity}</TableCell>
                    <TableCell>{bag.pickup_time || "—"}</TableCell>
                    <TableCell align="right">
                      <IconButton
                        color="primary"
                        onClick={() => handleOpenDialog(bag)}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        color="error"
                        onClick={() => handleDelete(bag.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* Add/Edit Dialog */}
        <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
          <DialogTitle>
            {editingBag ? "Edit Surplus Bag" : "Add New Surplus Bag"}
          </DialogTitle>
          <DialogContent>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 2 }}>Surplus bag saved!</Alert>}
            
            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    required
                    label="Title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="e.g., Surprise Pastry Bag"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    label="Description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="What's inside the bag?"
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    required
                    type="number"
                    label="Original Price (TND)"
                    name="original_price"
                    value={formData.original_price}
                    onChange={handleChange}
                    inputProps={{ step: "0.01", min: "0" }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    required
                    type="number"
                    label="Sale Price (TND)"
                    name="sale_price"
                    value={formData.sale_price}
                    onChange={handleChange}
                    inputProps={{ step: "0.01", min: "0" }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    required
                    type="number"
                    label="Quantity Available"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleChange}
                    inputProps={{ min: "0" }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Pickup Time"
                    name="pickup_time"
                    value={formData.pickup_time}
                    onChange={handleChange}
                    placeholder="e.g., 5-7 PM"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Tags (comma-separated)"
                    name="tags"
                    value={formData.tags}
                    onChange={handleChange}
                    placeholder="e.g., sweet, vegan, pastry"
                  />
                </Grid>
              </Grid>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button
              onClick={handleSubmit}
              variant="contained"
              disabled={saving}
            >
              {saving ? <CircularProgress size={24} /> : "Save"}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </BakeryOwnerLayout>
  );
}
