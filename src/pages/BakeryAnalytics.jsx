import React, { useEffect, useState } from "react";
import { bakeryApi } from "../api/bakeryApi";
import { orderApi } from "../api/orderApi";
import BakeryOwnerLayout from "../components/BakeryOwnerLayout";
import {
  Box,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Grid,
  Paper,
} from "@mui/material";
import AssessmentIcon from "@mui/icons-material/Assessment";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import InventoryIcon from "@mui/icons-material/Inventory";

export default function BakeryAnalytics() {
  const [bakery, setBakery] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    activeProducts: 0,
    activeSurplusBags: 0,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const bakeryRes = await bakeryApi.getMy();
      setBakery(bakeryRes.data);
      
      // Fetch orders for this bakery
      const ordersRes = await orderApi.list();
      const bakeryOrders = ordersRes.data.filter(
        (order) => order.bakery_id === bakeryRes.data.id
      );
      setOrders(bakeryOrders);

      // Calculate stats
      const totalRevenue = bakeryOrders.reduce((sum, order) => {
        const amount = order.amount || order.total_amount || 0;
        return sum + parseFloat(amount);
      }, 0);

      const activeProducts = bakeryRes.data.products?.filter(
        (p) => p.quantity_available > 0
      ).length || 0;

      const activeSurplusBags = bakeryRes.data.surplus_bags?.filter(
        (b) => b.quantity > 0
      ).length || 0;

      setStats({
        totalOrders: bakeryOrders.length,
        totalRevenue: totalRevenue.toFixed(2),
        activeProducts,
        activeSurplusBags,
      });

      setLoading(false);
    } catch (err) {
      console.error("Error loading analytics:", err);
      setLoading(false);
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
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h6">
              You need to set up your bakery profile first.
            </Typography>
          </Paper>
        </Box>
      </BakeryOwnerLayout>
    );
  }

  const statCards = [
    {
      title: "Total Orders",
      value: stats.totalOrders,
      icon: <ShoppingCartIcon sx={{ fontSize: 40, color: "#FFF" }} />,
      color: "#3498DB",
      trend: "+12% from last month",
    },
    {
      title: "Total Revenue",
      value: `${stats.totalRevenue} TND`,
      icon: <AttachMoneyIcon sx={{ fontSize: 40, color: "#FFF" }} />,
      color: "#27AE60",
      trend: "+8% from last month",
    },
    {
      title: "Active Products",
      value: stats.activeProducts,
      icon: <InventoryIcon sx={{ fontSize: 40, color: "#FFF" }} />,
      color: "#E67E22",
      trend: "In stock",
    },
    {
      title: "Active Surplus Bags",
      value: stats.activeSurplusBags,
      icon: <TrendingUpIcon sx={{ fontSize: 40, color: "#FFF" }} />,
      color: "#9B59B6",
      trend: "Available now",
    },
  ];

  return (
    <BakeryOwnerLayout>
      <Box sx={{ maxWidth: 1200, mx: "auto", py: 4 }}>
        <Paper elevation={2} sx={{ p: 3, mb: 4, bgcolor: "#FDF2E9" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <AssessmentIcon sx={{ fontSize: 40, color: "#D35400" }} />
            <Box>
              <Typography variant="h4">Analytics & Performance</Typography>
              <Typography variant="body1" color="text.secondary">
                {bakery.name}
              </Typography>
            </Box>
          </Box>
        </Paper>

        <Grid container spacing={3}>
          {statCards.map((stat, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card
                sx={{
                  bgcolor: stat.color,
                  color: "white",
                  height: "100%",
                }}
              >
                <CardContent>
                  <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
                    <Typography variant="h6">{stat.title}</Typography>
                    {stat.icon}
                  </Box>
                  <Typography variant="h3" sx={{ fontWeight: "bold", mb: 1 }}>
                    {stat.value}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    {stat.trend}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Recent Orders */}
        <Paper sx={{ mt: 4, p: 3 }}>
          <Typography variant="h5" sx={{ mb: 3 }}>
            Recent Orders
          </Typography>
          {orders.length === 0 ? (
            <Typography color="text.secondary">No orders yet.</Typography>
          ) : (
            <Box>
              {orders.slice(0, 5).map((order) => (
                <Box
                  key={order.id}
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    py: 2,
                    borderBottom: "1px solid #eee",
                  }}
                >
                  <Box>
                    <Typography variant="body1" fontWeight="bold">
                      Order #{order.id}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {order.surplus_bag?.title || order.product?.name || "Order"}
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: "right" }}>
                    <Typography variant="body1" fontWeight="bold" color="success.main">
                      {order.amount || order.total_amount} TND
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {order.status || "Pending"}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          )}
        </Paper>
      </Box>
    </BakeryOwnerLayout>
  );
}
