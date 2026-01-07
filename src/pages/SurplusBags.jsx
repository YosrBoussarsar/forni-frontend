import React, { useEffect, useState, useContext } from "react";
import { surplusBagApi } from "../api/surplusBagApi";
import { bakeryApi } from "../api/bakeryApi";
import { CartContext } from "../context/CartContext";
import CustomerLayout from "../components/CustomerLayout";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  Button,
  CircularProgress,
  alpha,
  useTheme,
  TextField,
  InputAdornment,
  IconButton,
  Stack,
} from "@mui/material";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";

export default function SurplusBags() {
  const [bags, setBags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTags, setSearchTags] = useState("");
  const [selectedTags, setSelectedTags] = useState([]);
  const { addToCart } = useContext(CartContext);
  const theme = useTheme();

  const popularTags = ["sweet", "savory", "vegan", "gluten-free", "pastry"];

  const loadBags = (tags = []) => {
    setLoading(true);
    const apiCall = tags.length > 0 ? surplusBagApi.listByTags(tags) : surplusBagApi.list();
    
    apiCall
      .then((res) => {
        setBags(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error loading bags:", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadBags();
  }, []);

  const handleSearch = () => {
    const tags = searchTags
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0);
    setSelectedTags(tags);
    loadBags(tags);
  };

  const handleTagClick = (tag) => {
    const tags = [tag];
    setSelectedTags(tags);
    setSearchTags(tag);
    loadBags(tags);
  };

  const handleClearFilters = () => {
    setSearchTags("");
    setSelectedTags([]);
    loadBags([]);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleAddToCart = async (bag) => {
    // Get bakery information from the nested bakery object or fetch it
    let bakeryId = bag.bakery_id;
    let bakeryName = bag.bakery?.name;
    
    // If bakery info is in nested object, extract it
    if (bag.bakery && bag.bakery.id) {
      bakeryId = bag.bakery.id;
      bakeryName = bag.bakery.name;
    }
    
    // If still missing, fetch from API
    if (!bakeryName && bakeryId) {
      try {
        const response = await bakeryApi.get(bakeryId);
        bakeryName = response.data.name;
      } catch (error) {
        console.error("Error fetching bakery info:", error);
        bakeryName = "Unknown Bakery";
      }
    }
    
    if (!bakeryId) {
      console.error("Cannot add to cart: missing bakery_id", bag);
      alert("Unable to add this item to cart. Please try again from the bakery page.");
      return;
    }
    
    addToCart({
      id: bag.id,
      title: bag.title,
      description: bag.description,
      sale_price: bag.sale_price,
      bakery_id: bakeryId,
      bakery_name: bakeryName || "Unknown Bakery",
      type: "surplus_bag",
    });
  };

  if (loading) {
    return (
      <CustomerLayout>
        <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" minHeight="60vh">
          <CircularProgress size={60} thickness={4} />
          <Typography sx={{ mt: 2 }} color="text.secondary">Loading surprise bags...</Typography>
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
          Surprise Bags
        </Typography>
        <Typography variant="body1" color="text.secondary" gutterBottom>
          Save food and money with our surprise bags
        </Typography>

        {/* Search Box */}
        <Box sx={{ mt: 3, mb: 2 }}>
          <TextField
            fullWidth
            placeholder="Filter by tags: sweet, savory, vegan..."
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
            Popular categories:
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
                    ? theme.palette.success.main
                    : alpha(theme.palette.success.main, 0.1),
                  color: selectedTags.includes(tag) ? "white" : theme.palette.success.main,
                  "&:hover": {
                    bgcolor: selectedTags.includes(tag)
                      ? theme.palette.success.dark
                      : alpha(theme.palette.success.main, 0.2),
                  },
                }}
              />
            ))}
          </Stack>
        </Box>

        {/* Active Filters Display */}
        {selectedTags.length > 0 && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Filtering by: {selectedTags.join(", ")}
            </Typography>
          </Box>
        )}
      </Box>

      {bags.length === 0 ? (
        <Box sx={{ textAlign: "center", py: 8 }}>
          <LocalOfferIcon sx={{ fontSize: 80, color: "text.secondary", mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            {selectedTags.length > 0
              ? "No surprise bags found with these tags"
              : "No surprise bags available right now"}
          </Typography>
          {selectedTags.length > 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Try different tags or{" "}
              <Typography
                component="span"
                color="primary"
                sx={{ cursor: "pointer", textDecoration: "underline" }}
                onClick={handleClearFilters}
              >
                clear filters
              </Typography>
            </Typography>
          ) : (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Check back later for new offers!
            </Typography>
          )}
        </Box>
      ) : (
        <Grid container spacing={3}>
          {bags.map((bag) => (
            <Grid item xs={12} sm={6} md={4} key={bag.id}>
              <Card
                sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
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
                    background: `linear-gradient(90deg, ${theme.palette.success.main}, ${theme.palette.success.light})`,
                  },
                  "&:hover": {
                    transform: "translateY(-8px)",
                    boxShadow: `0 12px 32px ${alpha(theme.palette.success.main, 0.2)}`,
                  },
                }}
              >
                <CardContent sx={{ flexGrow: 1, p: 3 }}>
                  <Box sx={{ display: "flex", alignItems: "start", mb: 2 }}>
                    <Box
                      sx={{
                        p: 1.5,
                        borderRadius: 2,
                        background: `linear-gradient(135deg, ${alpha(theme.palette.success.main, 0.1)}, ${alpha(theme.palette.success.light, 0.2)})`,
                        mr: 2,
                      }}
                    >
                      <ShoppingBagIcon sx={{ fontSize: 32, color: theme.palette.success.main }} />
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6" fontWeight="bold" gutterBottom>
                        {bag.title}
                      </Typography>
                      <Chip
                        label={`${bag.sale_price} TND`}
                        size="small"
                        sx={{
                          bgcolor: theme.palette.success.main,
                          color: "white",
                          fontWeight: 700,
                        }}
                      />
                    </Box>
                  </Box>

                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {bag.description}
                  </Typography>

                  {/* Display Tags */}
                  {bag.tags && (Array.isArray(bag.tags) ? bag.tags.length > 0 : bag.tags) && (
                    <Box sx={{ mb: 2 }}>
                      <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                        {(Array.isArray(bag.tags) ? bag.tags : bag.tags.split(',')).map((tag, idx) => (
                          <Chip
                            key={idx}
                            label={typeof tag === 'string' ? tag.trim() : tag}
                            size="small"
                            sx={{
                              bgcolor: alpha(theme.palette.info.main, 0.1),
                              color: theme.palette.info.main,
                              fontSize: "0.75rem",
                            }}
                          />
                        ))}
                      </Stack>
                    </Box>
                  )}

                  <Button
                    fullWidth
                    variant="contained"
                    onClick={() => handleAddToCart(bag)}
                    sx={{
                      background: `linear-gradient(135deg, ${theme.palette.success.main}, ${theme.palette.success.light})`,
                      "&:hover": {
                        background: `linear-gradient(135deg, ${theme.palette.success.dark}, ${theme.palette.success.main})`,
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
      )}
    </CustomerLayout>
  );
}
