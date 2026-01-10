import React, { useState, useContext } from "react";
import { productApi } from "../api/productApi";
import { reviewApi } from "../api/reviewApi";
import { bakeryApi } from "../api/bakeryApi";
import CustomerLayout from "../components/CustomerLayout";
import { CartContext } from "../context/CartContext";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  Button,
  TextField,
  CircularProgress,
  Stack,
  Rating,
  Container,
  Paper,
  alpha,
  useTheme,
  InputAdornment,
  IconButton,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";

export default function Products() {
  const [search, setSearch] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { addToCart } = useContext(CartContext);
  const theme = useTheme();

  const handleSearch = async () => {
    setLoading(true);
    setError("");
    setResults([]);
    try {
      // Get all products matching the search tag
      const productsRes = await productApi.listByTags([search]);
      const products = productsRes.data;
      // For each product, fetch its bakery and bakery reviews
      const allResults = await Promise.all(
        products.map(async (product) => {
          let bakery = null;
          let bakeryReviews = [];
          try {
            const bakeryRes = await bakeryApi.get(product.bakery_id);
            bakery = bakeryRes.data;
          } catch {}
          try {
            const reviewsRes = await reviewApi.listByBakery(product.bakery_id);
            bakeryReviews = reviewsRes.data;
          } catch {}
          return {
            bakery,
            product,
            bakeryReviews,
          };
        })
      );
      setResults(allResults);
    } catch (err) {
      setError("Failed to search products.");
    }
    setLoading(false);
  };

  return (
    <CustomerLayout>
      <Container maxWidth="lg">
        <Box sx={{ py: 4 }}>
          <Paper elevation={2} sx={{ p: 3, mb: 4, bgcolor: "#FDF2E9" }}>
            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
              <ShoppingCartIcon sx={{ fontSize: 40, color: theme.palette.primary.main, mr: 2 }} />
              <Typography variant="h4" fontWeight="bold">
                Product Price Comparator
              </Typography>
            </Box>
            <Typography variant="body1" color="text.secondary">
              Search and compare prices for products across all bakeries.
            </Typography>
          </Paper>
          <Paper elevation={1} sx={{ p: 2, mb: 4 }}>
            <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
              <TextField
                fullWidth
                label="Search for a product"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
              <Button variant="contained" onClick={handleSearch} disabled={loading} sx={{ minWidth: 120 }}>
                Search
              </Button>
            </Box>
            {loading && <Box sx={{ mt: 2 }}><CircularProgress /></Box>}
            {error && <Typography color="error" sx={{ mt: 2 }}>{error}</Typography>}
          </Paper>
          <Grid container spacing={2}>
            {results.length === 0 && !loading && (
              <Grid item xs={12}>
                <Box sx={{ textAlign: "center", py: 4 }}>
                  <Typography variant="body1" color="text.secondary">
                    No products found. Try searching for another product.
                  </Typography>
                </Box>
              </Grid>
            )}
            {results.map(({ bakery, product, bakeryReviews }, idx) => (
              <Grid item xs={12} sm={6} md={4} key={idx}>
                <Card
                  sx={{
                    height: "100%",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      transform: "translateY(-4px)",
                      boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.15)}`,
                    },
                  }}
                >
                  <CardContent>
                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                      {product.name}
                    </Typography>
                    <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                      <Chip
                        label={`${product.price} TND`}
                        size="small"
                        sx={{
                          bgcolor: theme.palette.primary.main,
                          color: "white",
                          fontWeight: 600,
                        }}
                      />
                      <Chip
                        label={product.is_available ? "Available" : "Not Available"}
                        color={product.is_available ? "success" : "error"}
                        size="small"
                      />
                    </Stack>
                    {product.description && (
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {product.description}
                      </Typography>
                    )}
                    {/* Display Product Tags */}
                    {product.tags && (Array.isArray(product.tags) ? product.tags.length > 0 : product.tags) && (
                      <Box sx={{ mb: 2 }}>
                        <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                          {(Array.isArray(product.tags) ? product.tags : product.tags.split(',')).map((tag, idx) => (
                            <Chip
                              key={idx}
                              label={typeof tag === 'string' ? tag.trim() : tag}
                              size="small"
                              sx={{
                                bgcolor: alpha(theme.palette.info.main, 0.1),
                                color: theme.palette.info.main,
                                fontSize: "0.7rem",
                              }}
                            />
                          ))}
                        </Stack>
                      </Box>
                    )}
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="subtitle2">Bakery: {bakery?.name || "-"}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {bakery?.address}, {bakery?.city}
                      </Typography>
                      <Box sx={{ display: "flex", alignItems: "center", mt: 1 }}>
                        <Rating
                          value={
                            bakeryReviews.length > 0
                              ? bakeryReviews.reduce((a, r) => a + r.rating, 0) /
                                bakeryReviews.length
                              : 0
                          }
                          precision={0.1}
                          readOnly
                          size="small"
                        />
                        <Typography variant="body2" sx={{ ml: 1 }}>
                          {bakeryReviews.length > 0
                            ? `${(
                                bakeryReviews.reduce((a, r) => a + r.rating, 0) /
                                bakeryReviews.length
                              ).toFixed(1)} (${bakeryReviews.length} reviews)`
                            : "No reviews"}
                        </Typography>
                      </Box>
                    </Box>
                    <Button
                      fullWidth
                      variant="contained"
                      size="small"
                      sx={{ mt: 2 }}
                      onClick={() => addToCart && addToCart({
                        id: product.id,
                        name: product.name,
                        description: product.description,
                        price: product.price,
                        bakery_id: product.bakery_id,
                        bakery_name: bakery?.name,
                        type: "product",
                      })}
                      disabled={!product.is_available}
                    >
                      Add to Cart
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Container>
    </CustomerLayout>
  );
}
