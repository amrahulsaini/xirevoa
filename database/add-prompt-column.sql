-- Add prompt column to generations table for storing the AI prompt used
ALTER TABLE generations ADD COLUMN IF NOT EXISTS prompt_used TEXT AFTER generated_image_url;

-- Add model used column if not exists
ALTER TABLE generations ADD COLUMN IF NOT EXISTS model_used VARCHAR(100) AFTER prompt_used;
