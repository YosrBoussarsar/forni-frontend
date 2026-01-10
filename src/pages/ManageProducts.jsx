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
  FormControlLabel,
  Switch,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import InventoryIcon from "@mui/icons-material/Inventory";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import LocalFireDepartmentIcon from "@mui/icons-material/LocalFireDepartment";

export default function ManageProducts() {
  const [products, setProducts] = useState([]);
  const [bakery, setBakery] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [templatesDialogOpen, setTemplatesDialogOpen] = useState(false);
  const [recommendations, setRecommendations] = useState([]);
  const [loadingTemplates, setLoadingTemplates] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    is_available: true,
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
        is_available: product.is_available !== undefined ? product.is_available : true,
        tags: Array.isArray(product.tags) ? product.tags.join(", ") : product.tags || "",
        image_url: product.image_url || "",
      });
    } else {
      setEditingProduct(null);
      setFormData({
        name: "",
        description: "",
        price: "",
        is_available: true,
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
        price: parseFloat(formData.price),
        is_available: formData.is_available,
        tags: formData.tags,
      };

      if (editingProduct) {
        // When updating, don't send bakery_id
        await productApi.update(editingProduct.id, submitData);
      } else {
        // When creating, include bakery_id
        await productApi.create({ ...submitData, bakery_id: bakery.id });
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

  const handleLoadTemplates = async () => {
    console.log("Loading templates...");
    setLoadingTemplates(true);
    setDialogOpen(false); // Ensure custom product dialog is closed
    try {
      const response = await productApi.getRecommendations(bakery.id);
      console.log("Templates loaded:", response.data.recommendations);
      setRecommendations(response.data.recommendations || []);
      setTemplatesDialogOpen(true);
      console.log("Templates dialog opened");
    } catch (err) {
      console.error("Error loading templates:", err);
      alert("Failed to load product templates");
    } finally {
      setLoadingTemplates(false);
    }
  };

  const handleAddFromTemplate = async (template) => {
    const price = prompt(
      `Enter your price for "${template.name}" (Average: ${template.avg_price || 'N/A'} TND):`
    );
    if (!price) return;

    try {
      await productApi.createFromTemplate(template.template_product_id, {
        bakery_id: bakery.id,
        price: parseFloat(price),
        is_available: true,
      });
      
      await loadData();
      setTemplatesDialogOpen(false);
      alert(`Product "${template.name}" added successfully!`);
    } catch (err) {
      console.error("Error adding from template:", err);
      alert(err.response?.data?.message || "Failed to add product from template");
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
            <Box sx={{ display: "flex", gap: 2 }}>
              <Button
                variant="outlined"
                startIcon={<ContentCopyIcon />}
                onClick={handleLoadTemplates}
                disabled={loadingTemplates}
              >
                {loadingTemplates ? "Loading..." : "Product Templates"}
              </Button>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => handleOpenDialog()}
              >
                Add Custom Product
              </Button>
            </Box>
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
                  <TableCell>Status</TableCell>
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
                    <TableCell>
                      <Box
                        sx={{
                          display: "inline-block",
                          px: 1.5,
                          py: 0.5,
                          borderRadius: 1,
                          bgcolor: product.is_available ? "#E8F5E9" : "#FFEBEE",
                          color: product.is_available ? "#2E7D32" : "#C62828",
                          fontSize: "0.875rem",
                          fontWeight: 500,
                        }}
                      >
                        {product.is_available ? "Available" : "Not Available"}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {product.tags || "—"}
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
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.is_available}
                        onChange={(e) => setFormData({ ...formData, is_available: e.target.checked })}
                        name="is_available"
                        color="success"
                      />
                    }
                    label={formData.is_available ? "Available" : "Not Available"}
                    sx={{ mt: 2 }}
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

        {/* Templates Dialog */}
        <Dialog 
          open={templatesDialogOpen} 
          onClose={() => setTemplatesDialogOpen(false)} 
          maxWidth="md" 
          fullWidth
        >
          <DialogTitle>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <ContentCopyIcon />
              Product Templates
            </Box>
          </DialogTitle>
          <DialogContent>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Choose from popular products used by other bakeries. You'll set your own price and quantity.
            </Typography>
            
            {recommendations.length === 0 ? (
              <Alert severity="info">
                No templates available yet. Create your first products!
              </Alert>
            ) : (
              <Grid container spacing={2}>
                {recommendations.map((template) => (
                  <Grid item xs={12} sm={6} key={template.template_product_id}>
                    <Card 
                      elevation={2} 
                      sx={{ 
                        height: "100%",
                        display: "flex",
                        flexDirection: "column",
                        "&:hover": { boxShadow: 4 }
                      }}
                    >
                      {template.image_url && (
                        <Box
                          component="img"
                          src={`http://localhost:5000${template.image_url}`}
                          alt={template.name}
                          sx={{
                            width: "100%",
                            height: 150,
                            objectFit: "cover",
                          }}
                        />
                      )}
                      <CardContent sx={{ flexGrow: 1 }}>
                        <Typography variant="h6" gutterBottom>
                          {template.name}
                        </Typography>
                        
                        <Box sx={{ display: "flex", gap: 1, mb: 1, flexWrap: "wrap" }}>
                          {template.category && (
                            <Box
                              sx={{
                                bgcolor: "#E8F5E9",
                                color: "#2E7D32",
                                px: 1,
                                py: 0.5,
                                borderRadius: 1,
                                fontSize: "0.75rem",
                              }}
                            >
                              {template.category}
                            </Box>
                          )}
                          <Box
                            sx={{
                              bgcolor: "#FFF3E0",
                              color: "#E65100",
                              px: 1,
                              py: 0.5,
                              borderRadius: 1,
                              fontSize: "0.75rem",
                              display: "flex",
                              alignItems: "center",
                              gap: 0.5,
                            }}
                          >
                            <LocalFireDepartmentIcon sx={{ fontSize: 14 }} />
                            {template.popularity} bakeries
                          </Box>
                        </Box>

                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          {template.description}
                        </Typography>

                        {template.avg_price && (
                          <Typography variant="body2" color="text.secondary">
                            Avg price: <strong>{template.avg_price} TND</strong>
                          </Typography>
                        )}

                        {template.allergens && (
                          <Typography variant="body2" color="error" sx={{ mt: 1 }}>
                            ⚠️ {template.allergens}
                          </Typography>
                        )}

                        {template.tags && (
                          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block" }}>
                            Tags: {template.tags}
                          </Typography>
                        )}

                        <Button
                          fullWidth
                          variant="contained"
                          color="success"
                          startIcon={<AddIcon />}
                          onClick={() => handleAddFromTemplate(template)}
                          sx={{ mt: 2 }}
                        >
                          Add to My Bakery
                        </Button>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setTemplatesDialogOpen(false)}>Close</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </BakeryOwnerLayout>
  );
}
