-- User Settings Table
CREATE TABLE IF NOT EXISTS user_settings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL UNIQUE,
  preferred_model VARCHAR(100) DEFAULT 'gemini-2.5-flash-image',
  preferred_resolution VARCHAR(20) DEFAULT '1K',
  preferred_aspect_ratio VARCHAR(10) DEFAULT '1:1',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- AI Models Configuration Table
CREATE TABLE IF NOT EXISTS ai_models (
  id INT AUTO_INCREMENT PRIMARY KEY,
  model_id VARCHAR(100) UNIQUE NOT NULL,
  model_name VARCHAR(255) NOT NULL,
  model_type VARCHAR(50) NOT NULL, -- 'gemini' or 'openai'
  description TEXT,
  xp_cost INT NOT NULL,
  max_resolution VARCHAR(20) DEFAULT '1K',
  supports_thinking BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  display_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert available models
INSERT INTO ai_models (model_id, model_name, model_type, description, xp_cost, max_resolution, supports_thinking, is_active, display_order) VALUES
('gemini-2.5-flash-image', 'Nano Banana', 'gemini', 'Fast and efficient image generation optimized for speed. Perfect for quick iterations and high-volume tasks.', 3, '1K', FALSE, TRUE, 1),
('gemini-3-pro-image-preview', 'Nano Banana Pro', 'gemini', 'Professional-grade image generation with advanced thinking and reasoning. Supports up to 4K resolution, Google Search grounding, and complex multi-turn editing.', 6, '4K', TRUE, TRUE, 2),
('gpt-image-1.5', 'GPT Image 1.5', 'openai', 'Latest OpenAI image generation model with precise, high-fidelity results. Coming soon.', 8, '2K', FALSE, FALSE, 3),
('imagen-4.0-generate-001', 'Imagen 4', 'imagen', 'Google\'s high-fidelity image generation model for realistic and high-quality images. Coming soon.', 5, '2K', FALSE, FALSE, 4);

-- Add index for faster queries
CREATE INDEX idx_user_settings_user_id ON user_settings(user_id);
CREATE INDEX idx_ai_models_active ON ai_models(is_active, display_order);
