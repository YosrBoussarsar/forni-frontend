# Payment Integration Setup Guide

## Stripe Payment Integration

This project now includes Stripe payment integration for processing orders.

### 🔧 Setup Steps

#### 1. Get Your Stripe API Keys

1. Go to [https://stripe.com](https://stripe.com)
2. Create a free account (no credit card required for test mode)
3. Navigate to **Developers** → **API Keys**
4. Copy your **Publishable key** (starts with `pk_test_...`)
5. Copy your **Secret key** (starts with `sk_test_...`)

#### 2. Update Frontend Configuration

In `src/pages/Cart.jsx`, replace the placeholder with your **Publishable key**:

```javascript
const stripePromise = loadStripe("pk_test_YOUR_PUBLISHABLE_KEY_HERE");
```

#### 3. Backend Setup Required

You need to create these endpoints in your backend API:

##### POST `/payment/create-intent`
Creates a Stripe Payment Intent

**Request Body:**
```json
{
  "amount": 5000,  // Amount in cents (50.00 TND)
  "currency": "tnd"
}
```

**Response:**
```json
{
  "clientSecret": "pi_xxx_secret_xxx",
  "paymentIntentId": "pi_xxx"
}
```

**Backend Code Example (Node.js/Express):**
```javascript
const stripe = require('stripe')('sk_test_YOUR_SECRET_KEY');

router.post('/payment/create-intent', async (req, res) => {
  try {
    const { amount, currency } = req.body;
    
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      automatic_payment_methods: {
        enabled: true,
      },
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});
```

##### POST `/payment/confirm`
Optional: Confirms payment status

**Request Body:**
```json
{
  "paymentIntentId": "pi_xxx"
}
```

##### GET `/payment/status/:paymentIntentId`
Optional: Gets payment status

#### 4. Update Order API

Your backend's order creation endpoint should now accept `payment_intent_id`:

```javascript
router.post('/order', async (req, res) => {
  const { surplus_bag_id, product_id, bakery_id, quantity, payment_intent_id } = req.body;
  
  // Verify payment before creating order
  const paymentIntent = await stripe.paymentIntents.retrieve(payment_intent_id);
  
  if (paymentIntent.status !== 'succeeded') {
    return res.status(400).json({ message: 'Payment not completed' });
  }
  
  // Create order...
});
```

### 🧪 Testing

Use these test card numbers in Stripe test mode:

**Successful Payment:**
- Card: `4242 4242 4242 4242`
- Expiry: Any future date (e.g., `12/34`)
- CVC: Any 3 digits (e.g., `123`)

**Declined Payment:**
- Card: `4000 0000 0000 0002`

**Requires Authentication (3D Secure):**
- Card: `4000 0025 0000 3155`

### 📦 Files Modified/Created

1. **New Files:**
   - `src/api/paymentApi.js` - Payment API service
   - `src/components/PaymentForm.jsx` - Payment form component

2. **Modified Files:**
   - `src/pages/Cart.jsx` - Added payment flow
   - `package.json` - Added Stripe dependencies

### 🎨 Features

- ✅ Stripe payment integration
- ✅ Payment dialog with card input
- ✅ Test card information displayed
- ✅ Loading states and error handling
- ✅ Payment verification before order creation
- ✅ Secure payment processing

### 🔐 Security Notes

- Never expose your Secret Key (`sk_test_...`) in frontend code
- All Secret Key operations must happen on the backend
- Use HTTPS in production
- Validate payment status on backend before fulfilling orders

### 🌍 Alternative Free Payment APIs

If you prefer a different payment provider:

1. **PayPal Sandbox** - Free testing environment
2. **Square** - Free for testing
3. **Razorpay** - Free test mode (India-focused)
4. **Braintree** - Free sandbox (owned by PayPal)

### 📚 Resources

- [Stripe Documentation](https://stripe.com/docs)
- [Stripe React Integration](https://stripe.com/docs/stripe-js/react)
- [Stripe Test Cards](https://stripe.com/docs/testing)

---

**Need Help?** Check the [Stripe documentation](https://stripe.com/docs) or their excellent support resources.
