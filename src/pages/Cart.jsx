import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CartContext } from "../context/CartContext";
import { orderApi } from "../api/orderApi";
import Layout from "../components/Layout";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  IconButton,
  Grid,
  Divider,
  Alert,
  Snackbar,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import LocationOnIcon from "@mui/icons-material/LocationOn";

// Mock payment mode - set to false when you have Stripe configured
const USE_MOCK_PAYMENT = true;

export default function Cart() {
  const navigate = useNavigate();
  const { cartItems, removeFromCart, updateQuantity, clearCart, getCartTotal } =
    useContext(CartContext);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  const [pickupDetails, setPickupDetails] = useState(null);

  const removeInvalidItems = () => {
    cartItems.forEach(item => {
      if (!item.bakery_id || !item.bakery_name) {
        removeFromCart(item.id, item.type, item.bakery_id);
      }
    });
  };

  const handleCheckout = async () => {
    if (cartItems.length === 0) {
      setError("Your cart is empty");
      return;
    }

    // Validate cart items have required fields
    const invalidItems = cartItems.filter(item => !item.bakery_id || !item.bakery_name);
    if (invalidItems.length > 0) {
      setError("Some items in your cart are missing bakery information. Please remove them and add them again from the bakery page.");
      return;
    }

    setError("");

    if (USE_MOCK_PAYMENT) {
      // Mock payment flow - just open the dialog
      setPaymentDialogOpen(true);
    } else {
      // Real Stripe payment flow would go here
      setError("Stripe payment not configured. Set USE_MOCK_PAYMENT to true for testing.");
    }
  };

  const handlePaymentSuccess = async () => {
    setProcessingPayment(true);
    setPaymentDialogOpen(false);
    setLoading(true);

    try {
      // Generate a mock payment intent ID
      const mockPaymentId = `mock_pi_${Date.now()}`;

      // Generate pickup time (2 hours from now)
      const pickupTime = new Date();
      pickupTime.setHours(pickupTime.getHours() + 2);

      // Group items by bakery
      const ordersByBakery = {};

      cartItems.forEach((item) => {
        const bakeryId = item.bakery_id;
        if (!ordersByBakery[bakeryId]) {
          ordersByBakery[bakeryId] = {
            bakery_id: bakeryId,
            bakery_name: item.bakery_name,
            items: [],
          };
        }
        ordersByBakery[bakeryId].items.push(item);
      });

      // Create orders for each bakery (one order per bakery with all items)
      const orderPromises = Object.values(ordersByBakery).map(
        async (bakeryOrder) => {
          // Format items for the new API
          const formattedItems = bakeryOrder.items.map((item) => {
            const orderItem = {
              quantity: Number(item.quantity),
            };

            if (item.type === "surplus_bag") {
              orderItem.surplus_bag_id = Number(item.id);
            } else if (item.type === "product") {
              orderItem.product_id = Number(item.id);
            }
            

            return orderItem;
          });

          const orderData = {
            bakery_id: Number(bakeryOrder.bakery_id),
            items: formattedItems,
            pickup_time: pickupTime.toISOString(),
            payment_intent_id: String(mockPaymentId),
          };

          console.log("Creating order with data:", orderData);
          return orderApi.create(orderData);
        }
      );

      await Promise.all(orderPromises);

      // Set pickup details for success dialog
      const bakeries = [...new Set(cartItems.map(item => item.bakery_name))];
      setPickupDetails({
        pickupTime,
        bakeries: bakeries.join(", "),
        itemCount: cartItems.reduce((sum, item) => sum + item.quantity, 0),
      });

      // Clear cart after successful checkout
      clearCart();
      setSuccess(true);
      setLoading(false);
      setProcessingPayment(false);
      setSuccessDialogOpen(true);
    } catch (err) {
      console.error("Error during checkout:", err);
      console.error("Error details:", err.response?.data);
      let errorMsg = "Failed to create order. Please try again.";
      if (err.response?.data?.message) {
        errorMsg = err.response.data.message;
      } else if (err.response?.data?.msg) {
        errorMsg = err.response.data.msg;
      } else if (err.response?.data?.error) {
        errorMsg = err.response.data.error;
      } else if (err.message) {
        errorMsg = err.message;
      }
      setError(errorMsg);
      setLoading(false);
      setProcessingPayment(false);
      setPaymentDialogOpen(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <Layout>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "60vh",
          }}
        >
          <ShoppingCartIcon sx={{ fontSize: 100, color: "text.secondary", mb: 2 }} />
          <Typography variant="h5" color="text.secondary" gutterBottom>
            Your cart is empty
          </Typography>
          <Button
            variant="contained"
            sx={{ mt: 2 }}
            onClick={() => navigate("/bakeries")}
          >
            Browse Bakeries
          </Button>
        </Box>
      </Layout>
    );
  }

  return (
    <Layout>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: "bold" }}>
          Shopping Cart
        </Typography>
        <Button
          variant="outlined"
          color="error"
          onClick={clearCart}
          size="small"
        >
          Clear All Items
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
          {error.includes("missing bakery information") && (
            <Button
              size="small"
              onClick={clearCart}
              sx={{ ml: 2, color: "inherit" }}
              variant="outlined"
            >
              Clear Cart
            </Button>
          )}
        </Alert>
      )}

      {/* Warning for items missing bakery info */}
      {cartItems.some(item => !item.bakery_id || !item.bakery_name) && (
        <Alert severity="error" sx={{ mb: 2 }}>
          <Typography variant="body1" gutterBottom fontWeight="bold">
            ⚠️ Your cart contains invalid items from an older version
          </Typography>
          <Typography variant="body2" gutterBottom>
            These items are missing required information and must be removed before checkout.
          </Typography>
          <Box sx={{ mt: 1.5, display: 'flex', gap: 1 }}>
            <Button
              size="medium"
              onClick={removeInvalidItems}
              variant="contained"
              color="error"
            >
              Remove Invalid Items Only
            </Button>
            <Button
              size="medium"
              onClick={clearCart}
              variant="outlined"
              color="error"
            >
              Clear Cart & Start Fresh
            </Button>
          </Box>
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Cart Items */}
        <Grid item xs={12} md={8}>
          {cartItems.map((item, index) => {
            const isInvalid = !item.bakery_id || !item.bakery_name;
            return (
            <Card 
              key={`${item.type}-${item.id}-${item.bakery_id}-${index}`} 
              sx={{ 
                mb: 2,
                opacity: isInvalid ? 0.6 : 1,
                border: isInvalid ? '2px solid' : 'none',
                borderColor: isInvalid ? 'warning.main' : 'transparent'
              }}
            >
              <CardContent>
                {isInvalid && (
                  <Alert severity="warning" sx={{ mb: 2 }}>
                    <Typography variant="caption">
                      This item is missing bakery information. Please remove it.
                    </Typography>
                  </Alert>
                )}
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} sm={5}>
                    <Typography variant="h6" gutterBottom>
                      {item.type === "product" ? item.name : item.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {item.bakery_name || "Unknown Bakery"}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        px: 1,
                        py: 0.5,
                        bgcolor: item.type === "product" ? "primary.light" : "success.light",
                        color: "white",
                        borderRadius: 1,
                        display: "inline-block",
                        mt: 1,
                      }}
                    >
                      {item.type === "product" ? "Product" : "Surplus Bag"}
                    </Typography>
                  </Grid>

                  <Grid item xs={12} sm={3}>
                    <Typography variant="body1" fontWeight="bold">
                      {item.type === "product" ? item.price : item.sale_price} TND
                    </Typography>
                  </Grid>

                  <Grid item xs={12} sm={3}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <IconButton
                        size="small"
                        onClick={() =>
                          updateQuantity(
                            item.id,
                            item.type,
                            item.bakery_id,
                            item.quantity - 1
                          )
                        }
                      >
                        <RemoveIcon />
                      </IconButton>
                      <TextField
                        size="small"
                        value={item.quantity}
                        onChange={(e) => {
                          const val = parseInt(e.target.value) || 0;
                          updateQuantity(item.id, item.type, item.bakery_id, val);
                        }}
                        sx={{ width: 60 }}
                        inputProps={{ min: 1, style: { textAlign: "center" } }}
                      />
                      <IconButton
                        size="small"
                        onClick={() =>
                          updateQuantity(
                            item.id,
                            item.type,
                            item.bakery_id,
                            item.quantity + 1
                          )
                        }
                      >
                        <AddIcon />
                      </IconButton>
                    </Box>
                  </Grid>

                  <Grid item xs={12} sm={1}>
                    <IconButton
                      color="error"
                      onClick={() =>
                        removeFromCart(item.id, item.type, item.bakery_id)
                      }
                      title={isInvalid ? "Remove invalid item" : "Remove from cart"}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
            );
          })}
        </Grid>

        {/* Order Summary */}
        <Grid item xs={12} md={4}>
          <Card sx={{ position: "sticky", top: 20 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                Order Summary
              </Typography>
              <Divider sx={{ my: 2 }} />

              <Box sx={{ mb: 2 }}>
                {cartItems.map((item, index) => (
                  <Box
                    key={`${item.type}-${item.id}-${item.bakery_id}-${index}`}
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      mb: 1,
                    }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      {item.type === "product" ? item.name : item.title} x{item.quantity}
                    </Typography>
                    <Typography variant="body2">
                      {((item.type === "product" ? item.price : item.sale_price) *
                        item.quantity).toFixed(2)}{" "}
                      TND
                    </Typography>
                  </Box>
                ))}
              </Box>

              <Divider sx={{ my: 2 }} />

              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
                <Typography variant="h6" fontWeight="bold">
                  Total
                </Typography>
                <Typography variant="h6" fontWeight="bold" color="primary">
                  {getCartTotal().toFixed(2)} TND
                </Typography>
              </Box>


      {/* Mock Payment Dialog */}
      <Dialog
        open={paymentDialogOpen}
        onClose={() => !processingPayment && setPaymentDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <CreditCardIcon /> Complete Payment
        </DialogTitle>
        <DialogContent>
          <Box sx={{ py: 2 }}>
            <Alert severity="info" sx={{ mb: 3 }}>
              <Typography variant="body2" gutterBottom>
                <strong>Mock Payment Mode</strong>
              </Typography>
              <Typography variant="body2">
                This is a test payment. Click "Confirm Payment" to simulate a successful payment and create your order.
              </Typography>
            </Alert>

            <Card variant="outlined" sx={{ mb: 3, bgcolor: "grey.50" }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Order Summary
                </Typography>
                <Divider sx={{ my: 2 }} />
                {cartItems.map((item, index) => (
                  <Box
                    key={`payment-${item.type}-${item.id}-${index}`}
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      mb: 1,
                    }}
                  >
                    <Typography variant="body2">
                      {item.type === "product" ? item.name : item.title} x{item.quantity}
                    </Typography>
                    <Typography variant="body2" fontWeight="medium">
                      {((item.type === "product" ? item.price : item.sale_price) *
                        item.quantity).toFixed(2)}{" "}
                      TND
                    </Typography>
                  </Box>
                ))}
                <Divider sx={{ my: 2 }} />
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography variant="h6" fontWeight="bold">
                    Total Amount
                  </Typography>
                  <Typography variant="h6" fontWeight="bold" color="primary">
                    {getCartTotal().toFixed(2)} TND
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button 
            onClick={() => setPaymentDialogOpen(false)} 
            disabled={processingPayment}
            variant="outlined"
          >
            Cancel
          </Button>
          <Button
            onClick={handlePaymentSuccess}
            disabled={processingPayment}
            variant="contained"
            size="large"
            startIcon={processingPayment ? <CircularProgress size={20} /> : <CreditCardIcon />}
          >
            {processingPayment ? "Processing..." : "Confirm Payment"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success Dialog with Pickup Details */}
      <Dialog
        open={successDialogOpen}
        onClose={() => {
          setSuccessDialogOpen(false);
          navigate("/orders");
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogContent sx={{ textAlign: "center", py: 4 }}>
          <CheckCircleIcon sx={{ fontSize: 80, color: "success.main", mb: 2 }} />
          <Typography variant="h4" gutterBottom fontWeight="bold" color="success.main">
            Payment Successful!
          </Typography>
          <Typography variant="h6" gutterBottom color="text.secondary">
            Order Confirmed
          </Typography>

          {pickupDetails && (
            <Card variant="outlined" sx={{ mt: 3, bgcolor: "grey.50" }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 1 }}>
                  <AccessTimeIcon color="primary" /> Pickup Details
                </Typography>
                <Divider sx={{ my: 2 }} />
                
                <Box sx={{ textAlign: "left", mb: 2 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Pickup Time:
                  </Typography>
                  <Typography variant="h6" fontWeight="bold" color="primary">
                    {pickupDetails.pickupTime.toLocaleString('en-US', {
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </Typography>
                </Box>

                <Box sx={{ textAlign: "left", mb: 2 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <LocationOnIcon fontSize="small" /> Pickup Location:
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {pickupDetails.bakeries}
                  </Typography>
                </Box>

                <Box sx={{ textAlign: "left" }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Total Items:
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {pickupDetails.itemCount} item{pickupDetails.itemCount > 1 ? 's' : ''}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          )}

          <Alert severity="info" sx={{ mt: 3, textAlign: "left" }}>
            <Typography variant="body2">
              Please arrive at the bakery during your pickup time window. Your order details and countdown timer are available in the Orders page.
            </Typography>
          </Alert>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0, justifyContent: "center" }}>
          <Button
            variant="contained"
            size="large"
            onClick={() => {
              setSuccessDialogOpen(false);
              navigate("/orders");
            }}
            fullWidth
          >
            View My Orders
          </Button>
        </DialogActions>
      </Dialog>

              <Button
                fullWidth
                variant="contained"
                size="large"
                onClick={handleCheckout}
                disabled={loading}
                sx={{ mb: 1 }}
              >
                {loading ? "Processing..." : "Checkout"}
              </Button>

              <Button
                fullWidth
                variant="outlined"
                onClick={() => navigate("/bakeries")}
              >
                Continue Shopping
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Layout>
  );
}
