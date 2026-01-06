import axiosClient from "./axiosClient";

export const paymentApi = {
  // Create payment intent
  createPaymentIntent: (data) => axiosClient.post("/payment/create-intent", data),
  
  // Confirm payment
  confirmPayment: (paymentIntentId) => axiosClient.post("/payment/confirm", { paymentIntentId }),
  
  // Get payment status
  getPaymentStatus: (paymentIntentId) => axiosClient.get(`/payment/status/${paymentIntentId}`),
};
