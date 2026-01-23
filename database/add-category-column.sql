-- Add category column to templates table if it doesn't exist
ALTER TABLE templates ADD COLUMN IF NOT EXISTS category VARCHAR(100) DEFAULT NULL AFTER tags;

-- Update existing templates with categories
UPDATE templates SET category = 'jewellery' WHERE id IN (62, 63, 64, 65, 66, 67, 68, 69, 70);
UPDATE templates SET category = 'hairstyle' WHERE id IN (23, 24, 25, 26, 27, 39, 40, 41, 42);
UPDATE templates SET category = 'outfit' WHERE id IN (43, 44, 45, 46, 47, 48, 49, 50, 52, 53, 54, 55, 56, 57, 58, 59, 60, 71);
UPDATE templates SET category = '80s' WHERE id IN (28, 29, 30, 31, 32, 33, 34);
UPDATE templates SET category = 'cinematic' WHERE id IN (16, 35, 36, 10);
UPDATE templates SET category = 'transformation' WHERE id IN (1, 2, 3, 4, 5, 6, 7, 8, 9);
