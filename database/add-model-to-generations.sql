-- Add model_used column to generations table to track which AI model generated each image
ALTER TABLE generations ADD COLUMN model_used VARCHAR(100) DEFAULT 'gemini-2.5-flash-image' AFTER template_title;

-- Add index for filtering by model
CREATE INDEX idx_generations_model ON generations(model_used);
