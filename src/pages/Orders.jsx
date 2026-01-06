import React, { useEffect, useState } from "react";
import { orderApi } from "../api/orderApi";
import Layout from "../components/Layout";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  CircularProgress,
  Chip,
  Divider,
  Alert,
  LinearProgress,
} from "@mui/material";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ScheduleIcon from "@mui/icons-material/Schedule";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    orderApi
      .list()
      .then((res) => {
        setOrders(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error loading orders:", err);
        setLoading(false);
      });
  }, []);

  // Update current time every second for countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const getTimeRemaining = (pickupTime) => {
    if (!pickupTime) return null;
    
    const pickup = new Date(pickupTime);
    const diff = pickup - currentTime;
    
    if (diff <= 0) {
      return { expired: true, text: "Pickup time passed" };
    }

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    return {
      expired: false,
      hours,
      minutes,
      seconds,
      text: `${hours}h ${minutes}m ${seconds}s`,
      percentage: Math.max(0, Math.min(100, ((7200000 - diff) / 7200000) * 100)) // Assuming 2hr window
    };
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
      case "picked_up":
        return "success";
      case "pending":
        return "warning";
      case "ready":
        return "info";
      case "cancelled":
        return "error";
      default:
        return "default";
    }
  };

  if (loading) {
    return (
      <Layout>
        <Box display="flex" justifyContent="center" mt={5}>
          <CircularProgress />
        </Box>
      </Layout>
    );
  }

  return (
    <Layout>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ mb: 1, fontWeight: "bold" }}>
          My Orders
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Track your orders and pickup times
        </Typography>
      </Box>

      {orders.length === 0 ? (
        <Alert severity="info" sx={{ maxWidth: 600 }}>
          <Typography variant="body1">
            No orders yet. Start shopping to place your first order!
          </Typography>
        </Alert>
      ) : (
        <Grid container spacing={3}>
          {orders.map((order) => {
            const timeRemaining = getTimeRemaining(order.pickup_time);
            const isExpired = timeRemaining?.expired;
            
            return (
              <Grid item xs={12} md={6} lg={4} key={order.id}>
                <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
                  <CardContent sx={{ flexGrow: 1 }}>
                    {/* Header */}
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "start", mb: 2 }}>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Order #{order.id}
                        </Typography>
                        <Typography variant="h6" fontWeight="bold">
                          {order.surplus_bag?.title || order.product?.name || "Order Item"}
                        </Typography>
                      </Box>
                      <Chip
                        label={order.status || "Pending"}
                        color={getStatusColor(order.status)}
                        size="small"
                        icon={order.status === "completed" || order.status === "picked_up" ? <CheckCircleIcon /> : <ScheduleIcon />}
                      />
                    </Box>

                    <Divider sx={{ my: 2 }} />

                    {/* Bakery Info */}
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary" sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 0.5 }}>
                        <LocationOnIcon fontSize="small" /> Pickup Location
                      </Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {order.bakery?.name || "Bakery"}
                      </Typography>
                      {order.bakery?.address && (
                        <Typography variant="caption" color="text.secondary">
                          {order.bakery.address}
                        </Typography>
                      )}
                    </Box>

                    {/* Pickup Time & Countdown */}
                    {order.pickup_time && (
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color="text.secondary" sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 0.5 }}>
                          <AccessTimeIcon fontSize="small" /> Pickup Time
                        </Typography>
                        <Typography variant="body1" fontWeight="medium">
                          {new Date(order.pickup_time).toLocaleString('en-US', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </Typography>
                        
                        {!isExpired && timeRemaining ? (
                          <Box sx={{ mt: 1.5 }}>
                            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0.5 }}>
                              <Typography variant="caption" color="text.secondary">
                                Time until pickup
                              </Typography>
                              <Typography variant="body2" fontWeight="bold" color="primary">
                                {timeRemaining.text}
                              </Typography>
                            </Box>
                            <LinearProgress 
                              variant="determinate" 
                              value={timeRemaining.percentage} 
                              sx={{ height: 6, borderRadius: 1 }}
                            />
                          </Box>
                        ) : isExpired && (
                          <Alert severity="warning" sx={{ mt: 1 }}>
                            <Typography variant="caption">
                              Pickup time has passed
                            </Typography>
                          </Alert>
                        )}
                      </Box>
                    )}

                    <Divider sx={{ my: 2 }} />

                    {/* Order Details */}
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                      <Typography variant="body2" color="text.secondary" sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                        <ShoppingBagIcon fontSize="small" /> Quantity
                      </Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {order.quantity || 1}
                      </Typography>
                    </Box>

                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <Typography variant="body2" color="text.secondary">
                        Total Price
                      </Typography>
                      <Typography variant="h6" fontWeight="bold" color="primary">
                        {order.total_price} TND
                      </Typography>
                    </Box>

                    {order.payment_intent_id && (
                      <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1 }}>
                        Payment ID: {order.payment_intent_id.substring(0, 20)}...
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}
    </Layout>
  );
}
