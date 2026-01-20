# Razorpay Payment Integration Setup Guide

## 🎯 Overview
Complete Razorpay payment integration for XP Points purchase on Xirevoa platform.

## 📋 Prerequisites
- Razorpay account (Sign up at https://dashboard.razorpay.com)
- Node.js and npm installed
- MySQL database running

---

## 🔧 Setup Instructions

### Step 1: Get Razorpay Credentials

1. **Login to Razorpay Dashboard**
   - Go to https://dashboard.razorpay.com
   - Login or create a new account

2. **Get API Keys**
   - Navigate to **Settings** → **API Keys**
   - Click on **Generate Test Keys** (for testing) or **Generate Live Keys** (for production)
   - You'll get:
     - **Key ID** (starts with `rzp_test_` or `rzp_live_`)
     - **Key Secret** (keep this confidential!)

3. **Add to .env.local**
   ```env
   RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxxx
   RAZORPAY_KEY_SECRET=your_secret_key_here
   ```

### Step 2: Configure Razorpay Dashboard

1. **Set Website URL**
   - Go to **Settings** → **Website Details**
   - Add your website URL: `https://xirevoa.com`

2. **Setup Webhooks (Optional but Recommended)**
   - Go to **Settings** → **Webhooks**
   - Add webhook URL: `https://xirevoa.com/api/razorpay/webhook`
   - Select events: `payment.authorized`, `payment.captured`, `payment.failed`

3. **Configure Branding**
   - Go to **Settings** → **Branding**
   - Upload your logo (will appear in checkout)
   - Set brand color: `#F59E0B` (Orange)

### Step 3: Database Setup (Optional - Transaction Tracking)

Run the SQL file to create transactions table:

```bash
mysql -u your_user -p your_database < database/transactions.sql
```

Or manually execute:
```sql
CREATE TABLE IF NOT EXISTS transactions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_email VARCHAR(255) NOT NULL,
  razorpay_order_id VARCHAR(255) NOT NULL UNIQUE,
  razorpay_payment_id VARCHAR(255) NOT NULL,
  razorpay_signature VARCHAR(500) NOT NULL,
  plan_name VARCHAR(100) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  xp_purchased INT NOT NULL,
  status ENUM('pending', 'success', 'failed') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_user_email (user_email),
  FOREIGN KEY (user_email) REFERENCES users(email) ON DELETE CASCADE
);
```

### Step 4: Test the Integration

1. **Start Development Server**
   ```bash
   npm run dev
   ```

2. **Test Payment Flow**
   - Navigate to `/pricing` page
   - Login if not already logged in
   - Click "Buy Now" on any plan
   - Use Razorpay test cards:

   **Test Card Details:**
   ```
   Card Number: 4111 1111 1111 1111
   CVV: Any 3 digits
   Expiry: Any future date
   ```

   For testing different scenarios:
   - Success: `4111 1111 1111 1111`
   - Failure: `4000 0000 0000 0002`

3. **Verify Success**
   - Payment should complete
   - XP should be added to user account
   - Success message should appear
   - Header XP balance should update

---

## 🚀 Going Live

### 1. Switch to Live Mode
- Get live API keys from Razorpay dashboard
- Update `.env.local` with live credentials:
  ```env
  RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxxxxxx
  RAZORPAY_KEY_SECRET=your_live_secret_here
  ```

### 2. Activate Account
- Complete KYC verification in Razorpay dashboard
- Activate your account to receive live payments

### 3. Set Payment Methods
- Go to **Settings** → **Payment Methods**
- Enable: Credit Cards, Debit Cards, UPI, Netbanking, Wallets

### 4. Settlement Setup
- Go to **Settings** → **Settlements**
- Add bank account details for receiving payouts
- Verify bank account

---

## 📁 Files Created/Modified

### New Files:
- `app/api/razorpay/create-order/route.ts` - Creates Razorpay order
- `app/api/razorpay/verify-payment/route.ts` - Verifies payment signature & adds XP
- `database/transactions.sql` - Transaction tracking table (optional)

### Modified Files:
- `app/pricing/page.tsx` - Added Razorpay checkout integration
- `app/layout.tsx` - Added Razorpay script
- `.env.local` - Added Razorpay credentials placeholders
- `package.json` - Added `razorpay` package

---

## 🔒 Security Features

✅ **Payment Signature Verification** - Ensures payment authenticity
✅ **Server-side Validation** - All verification happens on backend
✅ **User Authentication** - Only logged-in users can purchase
✅ **Database Transactions** - Atomic XP updates
✅ **Secure Environment Variables** - Credentials stored safely

---

## 💡 Features Implemented

✅ **Three Pricing Tiers** - Starter, Professional, Creator Pro
✅ **Razorpay Checkout** - Branded payment gateway
✅ **Automatic XP Credit** - XP added immediately after payment
✅ **Real-time Balance Update** - Header XP updates after purchase
✅ **Loading States** - User feedback during payment
✅ **Error Handling** - Graceful error messages
✅ **Mobile Responsive** - Works on all devices
✅ **Test Mode Support** - Easy testing before going live

---

## 🎨 Customization

### Change Brand Color
In `app/pricing/page.tsx`, update theme color:
```javascript
theme: {
  color: "#F59E0B", // Change this to your brand color
}
```

### Modify Plans
Edit the `plans` array in `app/pricing/page.tsx`:
```javascript
{
  name: "Your Plan",
  xp: 100,
  price: 99,
  popular: false,
  features: [...],
  gradient: "from-blue-500 to-cyan-500",
  icon: Zap
}
```

---

## 🐛 Troubleshooting

### Payment Not Opening
- Ensure Razorpay script is loaded (check browser console)
- Verify API keys are correct in `.env.local`
- Check if user is logged in

### XP Not Added
- Check database connection
- Verify user email matches session
- Check server logs for errors

### Test Cards Not Working
- Ensure using test API keys (`rzp_test_`)
- Check Razorpay dashboard for test mode status

---

## 📞 Support

**Razorpay Support:**
- Dashboard: https://dashboard.razorpay.com
- Docs: https://razorpay.com/docs/
- Email: support@razorpay.com

**Integration Help:**
- API Docs: https://razorpay.com/docs/api/
- Test Cards: https://razorpay.com/docs/payments/payments/test-card-details/

---

## ✅ Checklist Before Going Live

- [ ] KYC completed on Razorpay
- [ ] Live API keys configured
- [ ] Bank account added & verified
- [ ] Website URL configured
- [ ] Tested payment flow end-to-end
- [ ] Payment methods enabled
- [ ] Webhooks configured (optional)
- [ ] Transaction table created (optional)
- [ ] Error handling tested
- [ ] Mobile responsiveness checked

---

🎉 **Your Razorpay integration is complete!**
