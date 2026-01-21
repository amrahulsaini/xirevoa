-- Update AI model display names to fun names

UPDATE ai_models 
SET model_name = 'Nano Banana' 
WHERE model_id = 'gemini-2.5-flash-image';

UPDATE ai_models 
SET model_name = 'Nano Banana Pro' 
WHERE model_id = 'gemini-3-pro-image-preview';

-- Verify the changes
SELECT model_id, model_name, xp_cost, is_active FROM ai_models ORDER BY display_order;
