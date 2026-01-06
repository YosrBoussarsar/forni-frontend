import React, { useState } from "react";
import {
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import {
  Box,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Paper,
} from "@mui/material";
import PaymentIcon from "@mui/icons-material/Payment";

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      color: "#32325d",
      fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
      fontSmoothing: "antialiased",
      fontSize: "16px",
      "::placeholder": {
        color: "#aab7c4",
      },
    },
    invalid: {
      color: "#fa755a",
      iconColor: "#fa755a",
    },
  },
  hidePostalCode: true,
};

export default function PaymentForm({ amount, clientSecret, onSuccess, onError }) {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: {
            card: elements.getElement(CardElement),
          },
        }
      );

      if (stripeError) {
        setError(stripeError.message);
        setProcessing(false);
        if (onError) onError(stripeError);
      } else if (paymentIntent.status === "succeeded") {
        setProcessing(false);
        if (onSuccess) onSuccess(paymentIntent);
      }
    } catch (err) {
      console.error("Payment error:", err);
      setError("An unexpected error occurred.");
      setProcessing(false);
      if (onError) onError(err);
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 3 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <PaymentIcon /> Payment Details
        </Typography>
        <Typography variant="h5" color="primary" fontWeight="bold">
          Total: {amount} TND
        </Typography>
      </Box>

      <form onSubmit={handleSubmit}>
        <Box sx={{ mb: 3, p: 2, border: "1px solid #e0e0e0", borderRadius: 1 }}>
          <CardElement options={CARD_ELEMENT_OPTIONS} />
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Alert severity="info" sx={{ mb: 2 }}>
          <Typography variant="body2">
            <strong>Test Card:</strong> 4242 4242 4242 4242
            <br />
            <strong>Expiry:</strong> Any future date | <strong>CVC:</strong> Any 3 digits
          </Typography>
        </Alert>

        <Button
          type="submit"
          variant="contained"
          fullWidth
          size="large"
          disabled={!stripe || processing}
          sx={{ py: 1.5 }}
        >
          {processing ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            `Pay ${amount} TND`
          )}
        </Button>
      </form>
    </Paper>
  );
}
