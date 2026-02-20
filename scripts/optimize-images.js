/**
 * Image Optimization Script
 * 
 * This script helps you convert and optimize images for faster loading.
 * 
 * To use:
 * 1. Install sharp: npm install sharp
 * 2. Run: node scripts/optimize-images.js
 * 
 * This will:
 * - Convert images to WebP format
 * - Compress images
 * - Generate low-quality placeholders for blur effect
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Configuration
const INPUT_DIR = path.join(__dirname, '../public/cdn');
const OUTPUT_DIR = path.join(__dirname, '../public/cdn/optimized');
const QUALITY = 85;
const WEBP_QUALITY = 80;

// Create output directory if it doesn't exist
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

async function optimizeImage(inputPath, outputPath) {
  try {
    const filename = path.basename(inputPath, path.extname(inputPath));
    
    // Generate optimized WebP
    await sharp(inputPath)
      .webp({ quality: WEBP_QUALITY })
      .toFile(path.join(OUTPUT_DIR, `${filename}.webp`));
    
    // Generate low-quality placeholder (10% size, 10% quality)
    await sharp(inputPath)
      .resize({ width: 40 })
      .webp({ quality: 10 })
      .toFile(path.join(OUTPUT_DIR, `${filename}-placeholder.webp`));
    
    console.log(`✓ Optimized: ${filename}`);
  } catch (error) {
    console.error(`✗ Failed to optimize ${inputPath}:`, error.message);
  }
}

async function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      await processDirectory(filePath);
    } else if (/\.(jpg|jpeg|png)$/i.test(file)) {
      await optimizeImage(filePath, OUTPUT_DIR);
    }
  }
}

console.log('🚀 Starting image optimization...\n');
processDirectory(INPUT_DIR)
  .then(() => {
    console.log('\n✨ Image optimization complete!');
    console.log(`📁 Optimized images saved to: ${OUTPUT_DIR}`);
  })
  .catch(error => {
    console.error('❌ Optimization failed:', error);
  });
