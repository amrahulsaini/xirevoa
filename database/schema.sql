-- Create database (if not exists)
CREATE DATABASE IF NOT EXISTS xirevoa CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE xirevoa;

-- Templates/Categories Table
CREATE TABLE IF NOT EXISTS templates (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    image_url VARCHAR(500) NOT NULL,
    coming_soon BOOLEAN DEFAULT FALSE,
    display_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_display_order (display_order),
    INDEX idx_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert current templates
INSERT INTO templates (id, title, description, image_url, coming_soon, display_order) VALUES
(1, 'Body Transformation', 'Transform your physique with AI. See yourself with your dream body - muscle gain, weight loss, or athletic build.', '/cdn/bt1.jpg', FALSE, 1),
(2, 'Increase Height', 'Visualize yourself taller. See how you''d look with increased height and improved proportions.', '/cdn/default-height.jpg', TRUE, 2),
(3, 'Hairstyles', 'Try endless hairstyles instantly. From classic cuts to trendy styles, find your perfect look.', '/cdn/default-hair.jpg', TRUE, 3),
(4, 'Perfect Smile', 'Transform your smile with AI. See yourself with perfect teeth, brighter smile, and confident expression.', '/cdn/default-smile.jpg', TRUE, 4),
(5, 'Change Outfit', 'Try on any outfit virtually. From casual to formal, see yourself in different styles instantly.', '/cdn/default-outfit.jpg', TRUE, 5),
(6, 'Dress Collection', 'Try on stunning dresses virtually. From elegant gowns to casual wear, find your perfect style.', '/cdn/default-dress.jpg', TRUE, 6),
(7, 'Perfect Match', 'Find your perfect match with AI. See yourself with compatible partners and visualize your future together.', '/cdn/default-match.jpg', TRUE, 7),
(8, 'Perfect Match', 'Discover your ideal partner through AI. Create beautiful couple photos and imagine your love story.', '/cdn/default-match2.jpg', TRUE, 8),
(9, 'Themed Photoshoot', 'Transform into any theme or style. From vintage to futuristic, create stunning themed photos instantly.', '/cdn/default-theme.jpg', TRUE, 9);
