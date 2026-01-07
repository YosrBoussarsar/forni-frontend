import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import Layout from "../components/Layout";
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
  CircularProgress,
} from "@mui/material";
import PeopleIcon from "@mui/icons-material/People";
import StorefrontIcon from "@mui/icons-material/Storefront";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import BarChartIcon from "@mui/icons-material/BarChart";
import SettingsIcon from "@mui/icons-material/Settings";
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag";

export default function AdminDashboard() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalBakeries: 0,
    totalOrders: 0,
    totalSurplusBags: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real app, fetch these stats from an admin API endpoint
    // For now, we'll use placeholder data
    setTimeout(() => {
      setStats({
        totalUsers: 156,
        totalBakeries: 42,
        totalOrders: 1243,
        totalSurplusBags: 89,
      });
      setLoading(false);
    }, 500);
  }, []);

  const quickActions = [
    {
      title: "Manage Users",
      description: "View and manage all user accounts",
      icon: <PeopleIcon sx={{ fontSize: 40, color: "#D35400" }} />,
      path: "/admin/users",
    },
    {
      title: "Manage Bakeries",
      description: "Oversee all registered bakeries",
      icon: <StorefrontIcon sx={{ fontSize: 40, color: "#E67E22" }} />,
      path: "/bakeries",
    },
    {
      title: "All Orders",
      description: "View and manage all platform orders",
      icon: <ReceiptLongIcon sx={{ fontSize: 40, color: "#F39C12" }} />,
      path: "/orders",
    },
    {
      title: "Surplus Bags",
      description: "Monitor surplus bag activities",
      icon: <ShoppingBagIcon sx={{ fontSize: 40, color: "#E59866" }} />,
      path: "/surplus-bags",
    },
    {
      title: "Analytics",
      description: "Platform-wide analytics and insights",
      icon: <BarChartIcon sx={{ fontSize: 40, color: "#D35400" }} />,
      path: "/admin/analytics",
    },
    {
      title: "Settings",
      description: "Configure platform settings",
      icon: <SettingsIcon sx={{ fontSize: 40, color: "#E67E22" }} />,
      path: "/admin/settings",
    },
  ];

  const statCards = [
    {
      title: "Total Users",
      value: stats.totalUsers,
      color: "#3498DB",
    },
    {
      title: "Total Bakeries",
      value: stats.totalBakeries,
      color: "#E67E22",
    },
    {
      title: "Total Orders",
      value: stats.totalOrders,
      color: "#27AE60",
    },
    {
      title: "Active Surplus Bags",
      value: stats.totalSurplusBags,
      color: "#9B59B6",
    },
  ];

  return (
    <Layout>
      <Container maxWidth="lg">
        <Box sx={{ py: 4 }}>
          <Paper elevation={2} sx={{ p: 3, mb: 4, bgcolor: "#FDF2E9" }}>
            <Typography variant="h4" gutterBottom>
              Admin Dashboard 🛡️
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Welcome, {user?.name || "Admin"}. Manage the entire Forni platform from here.
            </Typography>
          </Paper>

          {/* Stats Cards */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {loading ? (
              <Grid item xs={12} sx={{ textAlign: "center", py: 4 }}>
                <CircularProgress />
              </Grid>
            ) : (
              statCards.map((stat, index) => (
                <Grid item xs={12} sm={6} md={3} key={index}>
                  <Card sx={{ bgcolor: stat.color, color: "white" }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        {stat.title}
                      </Typography>
                      <Typography variant="h3" sx={{ fontWeight: "bold" }}>
                        {stat.value}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))
            )}
          </Grid>

          {/* Quick Actions */}
          <Typography variant="h5" sx={{ mb: 3 }}>
            Quick Actions
          </Typography>
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
                  <CardContent sx={{ textAlign: "center", py: 3 }}>
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
    </Layout>
  );
}
