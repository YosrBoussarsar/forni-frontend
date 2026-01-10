import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosClient from "../api/axiosClient";
import { reviewApi } from "../api/reviewApi";
import { CartContext } from "../context/CartContext";
import CustomerLayout from "../components/CustomerLayout";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Chip,
  alpha,
  useTheme,
  TextField,
  InputAdornment,
  IconButton,
  Stack,
  Button,
  Rating,
  Avatar,
  Divider,
  Alert,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import StarIcon from "@mui/icons-material/Star";
import PersonIcon from "@mui/icons-material/Person";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

export default function BakeryDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [bakery, setBakery] = useState(null);
  const [loading, setLoading] = useState(true);
  const [productSearchTags, setProductSearchTags] = useState("");
  const [selectedProductTags, setSelectedProductTags] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [newReview, setNewReview] = useState({ rating: 5, comment: "" });
  const [reviewError, setReviewError] = useState("");
  const [reviewSuccess, setReviewSuccess] = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);
  const { addToCart } = useContext(CartContext);
  const theme = useTheme();

  const popularProductTags = ["croissant", "bread", "chocolate", "pastry", "cake"];

  useEffect(() => {
    axiosClient
      .get(`/bakery/${id}`)
      .then((res) => {
        setBakery(res.data);
        setFilteredProducts(res.data.products || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error loading bakery:", err);
        setLoading(false);
      });

    // Load reviews
    reviewApi
      .listByBakery(id)
      .then((res) => {
        setReviews(res.data);
        setReviewsLoading(false);
      })
      .catch((err) => {
        console.error("Error loading reviews:", err);
        setReviewsLoading(false);
      });
  }, [id]);

  const filterProducts = (tags) => {
    if (!bakery || !bakery.products) return;

    if (tags.length === 0) {
      setFilteredProducts(bakery.products);
      return;
    }

    const filtered = bakery.products.filter((product) => {
      if (!product.tags) return false;
      const productTags = Array.isArray(product.tags) ? product.tags : product.tags.split(',').map(t => t.trim());
      if (productTags.length === 0) return false;
      return tags.some((tag) =>
        productTags.some((pTag) => pTag.toLowerCase().includes(tag.toLowerCase()))
      );
    });

    setFilteredProducts(filtered);
  };

  const handleProductSearch = () => {
    const tags = productSearchTags
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0);
    setSelectedProductTags(tags);
    filterProducts(tags);
  };

  const handleProductTagClick = (tag) => {
    const tags = [tag];
    setSelectedProductTags(tags);
    setProductSearchTags(tag);
    filterProducts(tags);
  };

  const handleClearProductFilters = () => {
    setProductSearchTags("");
    setSelectedProductTags([]);
    filterProducts([]);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleProductSearch();
    }
  };

  const handleSubmitReview = async () => {
    setReviewError("");
    setReviewSuccess(false);

    if (!newReview.comment.trim()) {
      setReviewError("Please write a comment");
      return;
    }

    setSubmittingReview(true);

    try {
      const reviewData = {
        bakery_id: parseInt(id),
        rating: newReview.rating,
        comment: newReview.comment,
      };

      await reviewApi.create(reviewData);
      
      // Reload reviews
      const res = await reviewApi.listByBakery(id);
      setReviews(res.data);
      
      // Reset form
      setNewReview({ rating: 5, comment: "" });
      setReviewSuccess(true);
      setSubmittingReview(false);

      // Clear success message after 3 seconds
      setTimeout(() => setReviewSuccess(false), 3000);
    } catch (err) {
      console.error("Error submitting review:", err);
      setReviewError("Failed to submit review. Please try again.");
      setSubmittingReview(false);
    }
  };

  const calculateAverageRating = () => {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return (sum / reviews.length).toFixed(1);
  };

  const handleAddProductToCart = (product) => {
    addToCart({
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      bakery_id: parseInt(id),
      bakery_name: bakery.name,
      type: "product",
    });
  };

  const handleAddBagToCart = (bag) => {
    addToCart({
      id: bag.id,
      title: bag.title,
      description: bag.description,
      sale_price: bag.sale_price,
      bakery_id: parseInt(id),
      bakery_name: bakery.name,
      type: "surplus_bag",
    });
  };

  if (loading) {
    return (
      <CustomerLayout>
        <Box display="flex" justifyContent="center" mt={5}>
          <CircularProgress />
        </Box>
      </CustomerLayout>
    );
  }

  if (!bakery) {
    return (
      <CustomerLayout>
        <Typography variant="h6" color="error">
          Bakery not found.
        </Typography>
      </CustomerLayout>
    );
  }

  return (
    <CustomerLayout>
      {/* Back Button */}
      <Box sx={{ mb: 3 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate("/bakeries")}
          sx={{
            color: "text.secondary",
            "&:hover": {
              color: "primary.main",
              bgcolor: alpha(theme.palette.primary.main, 0.1),
            },
          }}
        >
          Back to Bakeries
        </Button>
      </Box>

      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h3"
          fontWeight="bold"
          gutterBottom
          sx={{
            background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          {bakery.name}
        </Typography>
        <Typography variant="body1" gutterBottom color="text.secondary">
          <strong>Location:</strong> {bakery.address}, {bakery.city}
        </Typography>
        {bakery.description && (
          <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
            {bakery.description}
          </Typography>
        )}
      </Box>

      {/* Products Section */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h4" fontWeight="bold" sx={{ mb: 3 }}>
          Products
        </Typography>

        {Array.isArray(bakery.products) && bakery.products.length > 0 && (
          <>
            {/* Product Search */}
            <Box sx={{ mb: 2 }}>
              <TextField
                fullWidth
                placeholder="Filter products by tags: croissant, bread, chocolate..."
                value={productSearchTags}
                onChange={(e) => setProductSearchTags(e.target.value)}
                onKeyPress={handleKeyPress}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon color="action" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      {(productSearchTags || selectedProductTags.length > 0) && (
                        <IconButton size="small" onClick={handleClearProductFilters}>
                          <ClearIcon />
                        </IconButton>
                      )}
                      <IconButton color="primary" onClick={handleProductSearch}>
                        <SearchIcon />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    backgroundColor: alpha(theme.palette.background.paper, 0.8),
                  },
                }}
              />
            </Box>

            {/* Popular Product Tags */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Popular items:
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {popularProductTags.map((tag) => (
                  <Chip
                    key={tag}
                    label={tag}
                    onClick={() => handleProductTagClick(tag)}
                    sx={{
                      cursor: "pointer",
                      bgcolor: selectedProductTags.includes(tag)
                        ? theme.palette.primary.main
                        : alpha(theme.palette.primary.main, 0.1),
                      color: selectedProductTags.includes(tag) ? "white" : theme.palette.primary.main,
                      "&:hover": {
                        bgcolor: selectedProductTags.includes(tag)
                          ? theme.palette.primary.dark
                          : alpha(theme.palette.primary.main, 0.2),
                      },
                    }}
                  />
                ))}
              </Stack>
            </Box>
          </>
        )}

        {filteredProducts.length > 0 ? (
          <Grid container spacing={2}>
            {filteredProducts.map((p) => (
              <Grid item xs={12} sm={6} md={4} key={p.id}>
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
                      {p.name}
                    </Typography>
                    <Chip
                      label={`${p.price} TND`}
                      size="small"
                      sx={{
                        bgcolor: theme.palette.primary.main,
                        color: "white",
                        fontWeight: 600,
                        mb: 2,
                      }}
                    />
                    {p.description && (
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {p.description}
                      </Typography>
                    )}
                    {/* Display Product Tags */}
                    {p.tags && (Array.isArray(p.tags) ? p.tags.length > 0 : p.tags) && (
                      <Box sx={{ mb: 2 }}>
                        <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                          {(Array.isArray(p.tags) ? p.tags : p.tags.split(',')).map((tag, idx) => (
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
                    <Button
                      fullWidth
                      variant="contained"
                      size="small"
                      onClick={() => handleAddProductToCart(p)}
                    >
                      Add to Cart
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Box sx={{ textAlign: "center", py: 4 }}>
            <Typography variant="body1" color="text.secondary">
              {selectedProductTags.length > 0
                ? "No products found with these tags"
                : "No products listed."}
            </Typography>
            {selectedProductTags.length > 0 && (
              <Typography
                variant="body2"
                color="primary"
                sx={{ mt: 1, cursor: "pointer", textDecoration: "underline" }}
                onClick={handleClearProductFilters}
              >
                Clear filters
              </Typography>
            )}
          </Box>
        )}
      </Box>

      {/* Surprise Bags Section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" sx={{ mb: 3 }}>
          Surprise Bags
        </Typography>
        {Array.isArray(bakery.surplus_bags) && bakery.surplus_bags.length > 0 ? (
          <Grid container spacing={2}>
            {bakery.surplus_bags.map((b) => (
              <Grid item xs={12} sm={6} md={4} key={b.id}>
                <Card
                  sx={{
                    height: "100%",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      transform: "translateY(-4px)",
                      boxShadow: `0 8px 24px ${alpha(theme.palette.success.main, 0.15)}`,
                    },
                  }}
                >
                  <CardContent>
                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                      {b.title}
                    </Typography>
                    <Chip
                      label={`${b.sale_price} TND`}
                      size="small"
                      sx={{
                        bgcolor: theme.palette.success.main,
                        color: "white",
                        fontWeight: 600,
                        mb: 1,
                      }}
                    />
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      Available: {b.quantity_available}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Status: <strong>{b.status}</strong>
                    </Typography>
                    {b.description && (
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {b.description}
                      </Typography>
                    )}
                    {/* Display Surplus Bag Tags */}
                    {b.tags && (Array.isArray(b.tags) ? b.tags.length > 0 : b.tags) && (
                      <Box sx={{ mb: 2 }}>
                        <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                          {(Array.isArray(b.tags) ? b.tags : b.tags.split(',')).map((tag, idx) => (
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
                    <Button
                      fullWidth
                      variant="contained"
                      size="small"
                      onClick={() => handleAddBagToCart(b)}
                      sx={{
                        bgcolor: theme.palette.success.main,
                        "&:hover": {
                          bgcolor: theme.palette.success.dark,
                        },
                      }}
                    >
                      Add to Cart
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Typography color="text.secondary">No surprise bags available.</Typography>
        )}
      </Box>

      {/* Reviews Section */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: "flex", alignItems: "center", mb: 3, gap: 2 }}>
          <Typography variant="h4" fontWeight="bold">
            Reviews
          </Typography>
          {reviews.length > 0 && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Rating value={parseFloat(calculateAverageRating())} precision={0.1} readOnly />
              <Typography variant="h6" color="text.secondary">
                {calculateAverageRating()} ({reviews.length} {reviews.length === 1 ? 'review' : 'reviews'})
              </Typography>
            </Box>
          )}
        </Box>

        {/* Add Review Form */}
        <Card sx={{ mb: 3, bgcolor: alpha(theme.palette.primary.main, 0.02) }}>
          <CardContent>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Write a Review
            </Typography>

            {reviewSuccess && (
              <Alert severity="success" sx={{ mb: 2 }}>
                Review submitted successfully!
              </Alert>
            )}

            {reviewError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {reviewError}
              </Alert>
            )}

            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Rating
              </Typography>
              <Rating
                value={newReview.rating}
                onChange={(event, newValue) => {
                  setNewReview({ ...newReview, rating: newValue || 1 });
                }}
                size="large"
              />
            </Box>

            <TextField
              fullWidth
              multiline
              rows={4}
              label="Your Review"
              placeholder="Share your experience with this bakery..."
              value={newReview.comment}
              onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
              sx={{ mb: 2 }}
            />

            <Button
              variant="contained"
              onClick={handleSubmitReview}
              disabled={submittingReview}
              sx={{
                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
                "&:hover": {
                  background: `linear-gradient(135deg, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`,
                },
              }}
            >
              {submittingReview ? "Submitting..." : "Submit Review"}
            </Button>
          </CardContent>
        </Card>

        {/* Reviews List */}
        {reviewsLoading ? (
          <Box display="flex" justifyContent="center" py={4}>
            <CircularProgress />
          </Box>
        ) : reviews.length > 0 ? (
          <Stack spacing={2}>
            {reviews.map((review) => (
              <Card key={review.id}>
                <CardContent>
                  <Box sx={{ display: "flex", alignItems: "start", gap: 2 }}>
                    <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
                      <PersonIcon />
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1 }}>
                        <Typography variant="subtitle1" fontWeight="bold">
                          {review.user?.first_name} {review.user?.last_name}
                        </Typography>
                        <Rating value={review.rating} readOnly size="small" />
                        <Typography variant="caption" color="text.secondary">
                          {new Date(review.created_at).toLocaleDateString()}
                        </Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        {review.comment}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Stack>
        ) : (
          <Box sx={{ textAlign: "center", py: 4 }}>
            <Typography color="text.secondary">
              No reviews yet. Be the first to review this bakery!
            </Typography>
          </Box>
        )}
      </Box>
    </CustomerLayout>
  );
}
