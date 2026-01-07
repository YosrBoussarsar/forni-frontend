import React, { useEffect, useState } from "react";
import { productApi } from "../api/productApi";
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
import InventoryIcon from "@mui/icons-material/Inventory";

export default function ManageProducts() {
  const [products, setProducts] = useState([]);
  const [bakery, setBakery] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    quantity_available: "",
    tags: "",
    image_url: "",
  });

  const loadData = async () => {
    try {
      const bakeryRes = await bakeryApi.getMy();
      setBakery(bakeryRes.data);
      
      const productsRes = await productApi.listByBakery(bakeryRes.data.id);
      setProducts(productsRes.data);
      setLoading(false);
    } catch (err) {
      console.error("Error loading data:", err);
      setError("Failed to load products");
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenDialog = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name || "",
        description: product.description || "",
        price: product.price || "",
        quantity_available: product.quantity_available || "",
        tags: Array.isArray(product.tags) ? product.tags.join(", ") : product.tags || "",
        image_url: product.image_url || "",
      });
    } else {
      setEditingProduct(null);
      setFormData({
        name: "",
        description: "",
        price: "",
        quantity_available: "",
        tags: "",
        image_url: "",
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingProduct(null);
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
        price: parseFloat(formData.price),
        quantity_available: parseInt(formData.quantity_available),
        tags: formData.tags,
      };

      if (editingProduct) {
        await productApi.update(editingProduct.id, submitData);
      } else {
        await productApi.create(submitData);
      }

      await loadData();
      setSuccess(true);
      setSaving(false);
      setTimeout(() => handleCloseDialog(), 1500);
    } catch (err) {
      console.error("Error saving product:", err);
      setError("Failed to save product. Please try again.");
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;

    try {
      await productApi.delete(id);
      await loadData();
    } catch (err) {
      console.error("Error deleting product:", err);
      alert("Failed to delete product");
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
            You need to set up your bakery profile first before adding products.
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
              <InventoryIcon sx={{ fontSize: 40, color: "#D35400" }} />
              <Box>
                <Typography variant="h4">Manage Products</Typography>
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
              Add Product
            </Button>
          </Box>
        </Paper>

        {products.length === 0 ? (
          <Alert severity="info">
            No products yet. Click "Add Product" to create your first product.
          </Alert>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Price (TND)</TableCell>
                  <TableCell>Available</TableCell>
                  <TableCell>Tags</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <Typography variant="body1" fontWeight="bold">
                        {product.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {product.description}
                      </Typography>
                    </TableCell>
                    <TableCell>{product.price}</TableCell>
                    <TableCell>{product.quantity_available}</TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {Array.isArray(product.tags) 
                          ? product.tags.join(", ") 
                          : product.tags || "—"}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        color="primary"
                        onClick={() => handleOpenDialog(product)}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        color="error"
                        onClick={() => handleDelete(product.id)}
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
            {editingProduct ? "Edit Product" : "Add New Product"}
          </DialogTitle>
          <DialogContent>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 2 }}>Product saved!</Alert>}
            
            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    required
                    label="Product Name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
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
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    required
                    type="number"
                    label="Price (TND)"
                    name="price"
                    value={formData.price}
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
                    name="quantity_available"
                    value={formData.quantity_available}
                    onChange={handleChange}
                    inputProps={{ min: "0" }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Tags (comma-separated)"
                    name="tags"
                    value={formData.tags}
                    onChange={handleChange}
                    placeholder="e.g., bread, croissant, pastry"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Image URL"
                    name="image_url"
                    value={formData.image_url}
                    onChange={handleChange}
                    placeholder="https://example.com/image.jpg"
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
