import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import CustomerLayout from "../components/CustomerLayout";
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
  Chip,
} from "@mui/material";
import StorefrontIcon from "@mui/icons-material/Storefront";
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag";
import ReceiptIcon from "@mui/icons-material/Receipt";
import RecommendIcon from "@mui/icons-material/Recommend";
import SavingsIcon from "@mui/icons-material/Savings";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import { orderApi } from "../api/orderApi";

export default function CustomerDashboard() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [savingsData, setSavingsData] = useState({
    totalSavings: 0,
    itemsSaved: 0,
    loading: true,
  });

  useEffect(() => {
    // Fetch customer's orders to calculate savings
    orderApi
      .list()
      .then((res) => {
        const myOrders = res.data.filter(order => order.user_id === user?.id && order.status === 'completed');
        
        // Calculate total savings from surplus bags
        const totalSavings = myOrders.reduce((sum, order) => {
          if (order.surplus_bag_id) {
            // Assuming surplus bags save ~40% on average
            const estimatedOriginalPrice = order.total_price / 0.6;
            return sum + (estimatedOriginalPrice - order.total_price);
          }
          return sum;
        }, 0);
        
        const surplusBagOrders = myOrders.filter(order => order.surplus_bag_id).length;
        
        setSavingsData({
          totalSavings: totalSavings,
          itemsSaved: surplusBagOrders,
          loading: false,
        });
      })
      .catch((err) => {
        console.error("Error loading savings data:", err);
        setSavingsData(prev => ({ ...prev, loading: false }));
      });
  }, [user]);

  const quickActions = [
        {
          title: "Products",
          description: "Compare prices across bakeries",
          icon: <ShoppingCartIcon sx={{ fontSize: 40, color: "#1976D2" }} />,
          path: "/products",
        },
    {
      title: "Browse Bakeries",
      description: "Discover local bakeries and their offerings",
      icon: <StorefrontIcon sx={{ fontSize: 40, color: "#D35400" }} />,
      path: "/bakeries",
    },
    {
      title: "Surplus Bags",
      description: "Get surprise bags at discounted prices",
      icon: <ShoppingBagIcon sx={{ fontSize: 40, color: "#E67E22" }} />,
      path: "/surplus-bags",
    },
    {
      title: "My Orders",
      description: "View your order history and track orders",
      icon: <ReceiptIcon sx={{ fontSize: 40, color: "#F39C12" }} />,
      path: "/orders",
    },
    {
      title: "Recommendations",
      description: "Personalized bakery recommendations for you",
      icon: <RecommendIcon sx={{ fontSize: 40, color: "#E59866" }} />,
      path: "/recommendations",
    },
  ];

  return (
    <CustomerLayout>
      <Container maxWidth="lg">
        <Box sx={{ py: 4 }}>
          <Paper elevation={2} sx={{ p: 3, mb: 4, bgcolor: "#FDF2E9" }}>
            <Typography variant="h4" gutterBottom>
              Welcome back, {user?.name || "Customer"}! 👋
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Discover fresh bakery items and save surplus bags from your favorite local bakeries.
            </Typography>
          </Paper>

          {/* Savings Analytics Card */}
          <Paper 
            elevation={3} 
            sx={{ 
              p: 3, 
              mb: 4, 
              background: "linear-gradient(135deg, #4CAF50 0%, #66BB6A 100%)",
              color: "white",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
              <SavingsIcon sx={{ fontSize: 40, mr: 2 }} />
              <Typography variant="h5" fontWeight="bold">
                Your Impact & Savings
              </Typography>
            </Box>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Box sx={{ bgcolor: "rgba(255,255,255,0.2)", p: 2, borderRadius: 2 }}>
                  <Typography variant="h3" fontWeight="bold">
                    ${savingsData.totalSavings.toFixed(2)}
                  </Typography>
                  <Box sx={{ display: "flex", alignItems: "center", mt: 1 }}>
                    <TrendingDownIcon sx={{ mr: 1 }} />
                    <Typography variant="body1">
                      Total Money Saved
                    </Typography>
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box sx={{ bgcolor: "rgba(255,255,255,0.2)", p: 2, borderRadius: 2 }}>
                  <Typography variant="h3" fontWeight="bold">
                    {savingsData.itemsSaved}
                  </Typography>
                  <Typography variant="body1" sx={{ mt: 1 }}>
                    Surplus Bags Purchased
                  </Typography>
                  <Chip 
                    label="Helping reduce food waste!" 
                    size="small"
                    sx={{ mt: 1, bgcolor: "rgba(255,255,255,0.3)" }}
                  />
                </Box>
              </Grid>
            </Grid>
          </Paper>

          <Grid container spacing={3}>
            {quickActions.map((action, index) => (
              <Grid item xs={12} sm={6} md={6} key={index}>
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
    </CustomerLayout>
  );
}
