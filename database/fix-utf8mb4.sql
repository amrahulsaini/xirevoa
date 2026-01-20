-- Fix character encoding to support emojis and all Unicode characters
ALTER TABLE generations 
MODIFY COLUMN prompt_used TEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Also update the entire table to utf8mb4 for consistency
ALTER TABLE generations CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
