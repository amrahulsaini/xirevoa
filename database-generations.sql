-- Generations table to store user's AI image creations
CREATE TABLE IF NOT EXISTS generations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  template_id INT NOT NULL,
  template_title VARCHAR(255) NOT NULL,
  original_image_url VARCHAR(500) NOT NULL,
  generated_image_url VARCHAR(500) NOT NULL,
  xp_cost INT DEFAULT 3,
  is_outfit BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_user_id (user_id),
  INDEX idx_created_at (created_at),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (template_id) REFERENCES templates(id) ON DELETE CASCADE
);

-- Add any missing indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_user_created ON generations(user_id, created_at DESC);
