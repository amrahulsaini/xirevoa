# Database Setup Instructions

## Run these SQL queries in your MySQL database:

### 1. Create the tables
```sql
-- Run the queries from: database/user-settings.sql
```

This will create:
- `user_settings` table (stores user preferences)
- `ai_models` table (stores available AI models)
- Insert 4 AI models with pricing

### 2. Models and Pricing

| Model | XP Cost | Status | Features |
|-------|---------|--------|----------|
| **Gemini 2.5 Flash** | 3 XP | ✅ Active | Fast generation, 1K resolution |
| **Gemini 3 Pro Image** | 6 XP | ✅ Active | Professional quality, up to 4K, Thinking mode |
| **GPT Image 1.5** | 8 XP | 🚧 Coming Soon | OpenAI's latest image model |
| **Imagen 4** | 5 XP | 🚧 Coming Soon | Google's high-fidelity model |

### 3. Access Settings Page

Users can now access `/settings` to:
- Choose their preferred AI model
- Set default resolution (1K/2K/4K depending on model)
- Set default aspect ratio
- See their XP balance

### 4. Default Settings

When a user generates for the first time:
- Model: Gemini 2.5 Flash (3 XP)
- Resolution: 1K
- Aspect Ratio: 1:1

### 5. Quick Test Queries

Check if tables exist:
```sql
SHOW TABLES LIKE 'user_settings';
SHOW TABLES LIKE 'ai_models';
```

View all models:
```sql
SELECT model_name, xp_cost, is_active, max_resolution FROM ai_models ORDER BY display_order;
```

View a user's settings:
```sql
SELECT u.email, us.preferred_model, us.preferred_resolution, us.preferred_aspect_ratio
FROM users u
LEFT JOIN user_settings us ON u.id = us.user_id
WHERE u.email = 'your-email@example.com';
```

## Features Implemented:

✅ Model selection with dynamic XP pricing
✅ Settings page with modern UI
✅ Auto-create default settings for new users
✅ XP deduction based on selected model
✅ Display "Coming Soon" for inactive models
✅ Resolution/aspect ratio preferences
✅ Full integration with generation API
