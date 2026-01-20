-- Razorpay Transactions Table (Optional - for payment tracking)
-- Run this SQL to create a transactions table for tracking payments

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
  INDEX idx_order_id (razorpay_order_id),
  INDEX idx_payment_id (razorpay_payment_id),
  FOREIGN KEY (user_email) REFERENCES users(email) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
