import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import BakeryOwnerLayout from "../components/BakeryOwnerLayout";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Paper,
  Container,
  Alert,
  Chip,
} from "@mui/material";
import AddBusinessIcon from "@mui/icons-material/AddBusiness";
import InventoryIcon from "@mui/icons-material/Inventory";
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag";
import AssessmentIcon from "@mui/icons-material/Assessment";
import ListAltIcon from "@mui/icons-material/ListAlt";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import StarIcon from "@mui/icons-material/Star";
import { bakeryApi } from "../api/bakeryApi";
import { orderApi } from "../api/orderApi";
import { reviewApi } from "../api/reviewApi";

export default function BakeryOwnerDashboard() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [bakeryInfo, setBakeryInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    averageRating: 0,
    reviewCount: 0,
  });

  useEffect(() => {
    // Fetch bakery info for the logged-in owner
    bakeryApi
      .getAll()
      .then((res) => {
        // Find the bakery owned by this user
        const myBakery = res.data.find((b) => b.owner_id === user?.id);
        setBakeryInfo(myBakery);
        
        if (myBakery) {
          // Fetch orders for this bakery
          orderApi.list().then((orderRes) => {
            const bakeryOrders = orderRes.data.filter(
              order => order.bakery_id === myBakery.id && order.status === 'completed'
            );
            
            const totalRevenue = bakeryOrders.reduce((sum, order) => sum + parseFloat(order.total_price || 0), 0);
            
            setAnalytics(prev => ({
              ...prev,
              totalRevenue,
              totalOrders: bakeryOrders.length,
            }));
          }).catch(err => console.error("Error fetching orders:", err));
          
          // Fetch reviews for this bakery
          reviewApi.listByBakery(myBakery.id).then((reviewRes) => {
            const reviews = reviewRes.data;
            const avgRating = reviews.length > 0
              ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
              : 0;
            
            setAnalytics(prev => ({
              ...prev,
              averageRating: avgRating,
              reviewCount: reviews.length,
            }));
          }).catch(err => console.error("Error fetching reviews:", err));
        }
        
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error loading bakery info:", err);
        setLoading(false);
      });
  }, [user]);

  const quickActions = [
    {
      title: "Manage Bakery",
      description: "Update your bakery profile and information",
      icon: <AddBusinessIcon sx={{ fontSize: 40, color: "#D35400" }} />,
      path: "/manage-bakery",
    },
    {
      title: "Manage Products",
      description: "Add, edit, or remove your bakery products",
      icon: <InventoryIcon sx={{ fontSize: 40, color: "#E67E22" }} />,
      path: "/manage-products",
    },
    {
      title: "Manage Surplus Bags",
      description: "Create surprise bags to reduce food waste",
      icon: <ShoppingBagIcon sx={{ fontSize: 40, color: "#F39C12" }} />,
      path: "/manage-surplus-bags",
    },
    {
      title: "View Orders",
      description: "Check incoming orders and manage fulfillment",
      icon: <ListAltIcon sx={{ fontSize: 40, color: "#E59866" }} />,
      path: "/orders",
    },
    {
      title: "Analytics",
      description: "View sales statistics and performance",
      icon: <AssessmentIcon sx={{ fontSize: 40, color: "#9B59B6" }} />,
      path: "/bakery-analytics",
    },
  ];

  return (
    <BakeryOwnerLayout>
      <Container maxWidth="lg">
        <Box sx={{ py: 4 }}>
          <Paper elevation={2} sx={{ p: 3, mb: 4, bgcolor: "#E3F2FD" }}>
            <Typography variant="h4" gutterBottom>
              Welcome, {bakeryInfo?.name || user?.name || "Bakery Owner"}! 🥐
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Manage your bakery, products, and orders all in one place.
            </Typography>
          </Paper>

          {!bakeryInfo && !loading && (
            <Alert severity="info" sx={{ mb: 3 }}>
              <Typography variant="body2">
                You haven't set up your bakery profile yet.{" "}
                <Button
                  size="small"
                  onClick={() => navigate("/manage-bakery")}
                  sx={{ textTransform: "none" }}
                >
                  Set up your bakery
                </Button>
              </Typography>
            </Alert>
          )}

          {/* Analytics Overview */}
          {bakeryInfo && (
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} md={4}>
                <Paper 
                  elevation={3} 
                  sx={{ 
                    p: 3, 
                    background: "linear-gradient(135deg, #1976d2 0%, #1565c0 100%)",
                    color: "white",
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                    <AttachMoneyIcon sx={{ fontSize: 32, mr: 1 }} />
                    <Typography variant="h6">Total Revenue</Typography>
                  </Box>
                  <Typography variant="h3" fontWeight="bold">
                    ${analytics.totalRevenue.toFixed(2)}
                  </Typography>
                  <Box sx={{ display: "flex", alignItems: "center", mt: 1 }}>
                    <TrendingUpIcon sx={{ mr: 1 }} />
                    <Typography variant="body2">
                      {analytics.totalOrders} completed orders
                    </Typography>
                  </Box>
                </Paper>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Paper 
                  elevation={3} 
                  sx={{ 
                    p: 3, 
                    background: "linear-gradient(135deg, #FF9800 0%, #F57C00 100%)",
                    color: "white",
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                    <ListAltIcon sx={{ fontSize: 32, mr: 1 }} />
                    <Typography variant="h6">Orders</Typography>
                  </Box>
                  <Typography variant="h3" fontWeight="bold">
                    {analytics.totalOrders}
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    Total completed orders
                  </Typography>
                </Paper>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Paper 
                  elevation={3} 
                  sx={{ 
                    p: 3, 
                    background: "linear-gradient(135deg, #FFC107 0%, #FFA000 100%)",
                    color: "white",
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                    <StarIcon sx={{ fontSize: 32, mr: 1 }} />
                    <Typography variant="h6">Customer Reviews</Typography>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "baseline", gap: 1 }}>
                    <Typography variant="h3" fontWeight="bold">
                      {analytics.averageRating.toFixed(1)}
                    </Typography>
                    <Typography variant="h6">/5.0</Typography>
                  </Box>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    {analytics.reviewCount} reviews received
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
          )}

          <Grid container spacing={3}>
            {quickActions.map((action, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Card
                  sx={{
                    height: "100%",
                    cursor: "pointer",
                    transition: "transform 0.2s, box-shadow 0.2s",
                    "&:hover": {
                      transform: "translateY(-4px)",
                      boxShadow: 4,
                    },
                  }}
                  onClick={() => navigate(action.path)}
                >
                  <CardContent sx={{ textAlign: "center", py: 4 }}>
                    {action.icon}
                    <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
                      {action.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {action.description}
                    </Typography>
                    <Button
                      variant="outlined"
                      sx={{ mt: 2 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(action.path);
                      }}
                    >
                      Go
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Container>
    </BakeryOwnerLayout>
  );
}
