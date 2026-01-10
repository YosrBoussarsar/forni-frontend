import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { bakeryApi } from "../api/bakeryApi";
import { reviewApi } from "../api/reviewApi";
import CustomerLayout from "../components/CustomerLayout";
import {
  Box,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Grid,
  Chip,
  alpha,
  useTheme,
  TextField,
  InputAdornment,
  IconButton,
  Stack,
  Rating,
} from "@mui/material";
import StorefrontIcon from "@mui/icons-material/Storefront";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";

export default function Bakeries() {
  const [bakeries, setBakeries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchTags, setSearchTags] = useState("");
  const [selectedTags, setSelectedTags] = useState([]);
  const [bakeryRatings, setBakeryRatings] = useState({});
  const theme = useTheme();

  const popularTags = ["croissant", "bread", "pastry", "cake", "sandwich"];

  const loadBakeries = async (tags = [], nameQuery = "") => {
    setLoading(true);
    const apiCall = tags.length > 0 ? bakeryApi.listByProductTags(tags) : bakeryApi.list();
    
    try {
      const res = await apiCall;
      let bakeriesData = res.data;
      
      // Filter by bakery name if search query exists
      if (nameQuery && nameQuery.trim()) {
        bakeriesData = bakeriesData.filter(bakery => 
          bakery.name.toLowerCase().includes(nameQuery.toLowerCase())
        );
      }
      
      setBakeries(bakeriesData);
      
      // Load reviews for each bakery to calculate ratings
      const ratingsMap = {};
      await Promise.all(
        bakeriesData.map(async (bakery) => {
          try {
            const reviewsRes = await reviewApi.listByBakery(bakery.id);
            const reviews = reviewsRes.data;
            if (reviews.length > 0) {
              const avgRating = reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length;
              ratingsMap[bakery.id] = {
                average: avgRating,
                count: reviews.length
              };
            }
          } catch (err) {
            console.error(`Error loading reviews for bakery ${bakery.id}:`, err);
          }
        })
      );
      
      setBakeryRatings(ratingsMap);
      setLoading(false);
    } catch (err) {
      console.error("Error loading bakeries:", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBakeries();
  }, []);

  const handleSearch = () => {
    const tags = searchTags
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0);
    setSelectedTags(tags);
    loadBakeries(tags, searchQuery);
  };

  const handleTagClick = (tag) => {
    const tags = [tag];
    setSelectedTags(tags);
    setSearchTags(tag);
    loadBakeries(tags, searchQuery);
  };

  const handleClearFilters = () => {
    setSearchQuery("");
    setSearchTags("");
    setSelectedTags([]);
    loadBakeries([]);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  if (loading) {
    return (
      <CustomerLayout>
        <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" minHeight="60vh">
          <CircularProgress size={60} thickness={4} />
          <Typography sx={{ mt: 2 }} color="text.secondary">Loading bakeries...</Typography>
        </Box>
      </CustomerLayout>
    );
  }

  return (
    <CustomerLayout>
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
          Discover Bakeries
        </Typography>
        <Typography variant="body1" color="text.secondary" gutterBottom>
          Explore local bakeries and find your favorite treats
        </Typography>

        {/* Search Box */}
        <Box sx={{ mt: 3, mb: 2 }}>
          <TextField
            fullWidth
            placeholder="Search by bakery name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  {(searchQuery || searchTags || selectedTags.length > 0) && (
                    <IconButton size="small" onClick={handleClearFilters}>
                      <ClearIcon />
                    </IconButton>
                  )}
                  <IconButton color="primary" onClick={handleSearch}>
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

        {/* Product Tags Search */}
        <Box sx={{ mt: 2, mb: 2 }}>
          <TextField
            fullWidth
            placeholder="Search by products: croissant, bread, pastry..."
            value={searchTags}
            onChange={(e) => setSearchTags(e.target.value)}
            onKeyPress={handleKeyPress}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  {(searchTags || selectedTags.length > 0) && (
                    <IconButton size="small" onClick={handleClearFilters}>
                      <ClearIcon />
                    </IconButton>
                  )}
                  <IconButton color="primary" onClick={handleSearch}>
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

        {/* Popular Tags */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Popular products:
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {popularTags.map((tag) => (
              <Chip
                key={tag}
                label={tag}
                onClick={() => handleTagClick(tag)}
                sx={{
                  cursor: "pointer",
                  bgcolor: selectedTags.includes(tag)
                    ? theme.palette.primary.main
                    : alpha(theme.palette.primary.main, 0.1),
                  color: selectedTags.includes(tag) ? "white" : theme.palette.primary.main,
                  "&:hover": {
                    bgcolor: selectedTags.includes(tag)
                      ? theme.palette.primary.dark
                      : alpha(theme.palette.primary.main, 0.2),
                  },
                }}
              />
            ))}
          </Stack>
        </Box>

        {/* Active Filters Display */}
        {(selectedTags.length > 0 || searchQuery) && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary">
              {searchQuery && `Bakery name: "${searchQuery}"`}
              {searchQuery && selectedTags.length > 0 && " | "}
              {selectedTags.length > 0 && `Products: ${selectedTags.join(", ")}`}
            </Typography>
          </Box>
        )}
      </Box>

      {bakeries.length === 0 ? (
        <Box sx={{ textAlign: "center", py: 8 }}>
          <StorefrontIcon sx={{ fontSize: 80, color: "text.secondary", mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            {selectedTags.length > 0 || searchQuery
              ? "No bakeries found with these search criteria"
              : "No bakeries available at the moment"}
          </Typography>
          {(selectedTags.length > 0 || searchQuery) && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Try different search terms or{" "}
              <Typography
                component="span"
                color="primary"
                sx={{ cursor: "pointer", textDecoration: "underline" }}
                onClick={handleClearFilters}
              >
                clear filters
              </Typography>
            </Typography>
          )}
        </Box>
      ) : (
        <Grid container spacing={3}>
          {bakeries.map((bakery) => (
            <Grid item xs={12} sm={6} md={4} key={bakery.id}>
              <Card
                component={Link}
                to={`/bakeries/${bakery.id}`}
                sx={{
                  textDecoration: "none",
                  height: "100%",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  position: "relative",
                  overflow: "hidden",
                  "&::before": {
                    content: '""',
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: 6,
                    background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  },
                  "&:hover": {
                    transform: "translateY(-8px)",
                    boxShadow: `0 12px 32px ${alpha(theme.palette.primary.main, 0.2)}`,
                  },
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: "flex", alignItems: "start", mb: 2 }}>
                    <Box
                      sx={{
                        p: 1.5,
                        borderRadius: 2,
                        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)}, ${alpha(theme.palette.primary.light, 0.2)})`,
                        mr: 2,
                      }}
                    >
                      <StorefrontIcon sx={{ fontSize: 32, color: theme.palette.primary.main }} />
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6" fontWeight="bold" gutterBottom>
                        {bakery.name}
                      </Typography>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 0.5 }}>
                        <LocationOnIcon sx={{ fontSize: 16, color: "text.secondary" }} />
                        <Typography variant="body2" color="text.secondary">
                          {bakery.city}
                        </Typography>
                      </Box>
                      {bakeryRatings[bakery.id] && (
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                          <Rating 
                            value={bakeryRatings[bakery.id].average} 
                            precision={0.1} 
                            size="small" 
                            readOnly 
                          />
                          <Typography variant="caption" color="text.secondary">
                            ({bakeryRatings[bakery.id].count})
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </Box>

                  {bakery.description && (
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {bakery.description}
                    </Typography>
                  )}

                  <Chip
                    label="View Details"
                    size="small"
                    sx={{
                      bgcolor: alpha(theme.palette.primary.main, 0.1),
                      color: theme.palette.primary.main,
                      fontWeight: 600,
                    }}
                  />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </CustomerLayout>
  );
}
