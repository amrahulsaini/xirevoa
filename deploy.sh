#!/bin/bash

# Deployment script for xirevoa.com Next.js app
# This script pulls the latest code and restarts the PM2 process

echo "=== Starting deployment for xirevoa.com ==="

# Configuration
APP_NAME="xirevoa"
APP_DIR="/home/xirevoa.com/public_html/xirevoa"
GIT_REPO="https://github.com/amrahulsaini/xirevoa.git"
PORT=3012

# Navigate to app directory or clone if it doesn't exist
if [ -d "$APP_DIR" ]; then
    echo "Directory exists, pulling latest changes..."
    cd "$APP_DIR"
    
    # Stash any local changes
    git stash
    
    # Pull latest changes
    git pull origin main
else
    echo "Directory doesn't exist, cloning repository..."
    mkdir -p "$(dirname "$APP_DIR")"
    git clone "$GIT_REPO" "$APP_DIR"
    cd "$APP_DIR"
fi

# Install dependencies
echo "Installing dependencies..."
npm install

# Build the Next.js app
echo "Building Next.js app..."
npm run build

# Check if PM2 is installed
if ! command -v pm2 &> /dev/null; then
    echo "PM2 is not installed. Installing PM2 globally..."
    npm install -g pm2
fi

# Stop existing PM2 process if running
echo "Stopping existing PM2 process (if any)..."
pm2 stop "$APP_NAME" 2>/dev/null || true
pm2 delete "$APP_NAME" 2>/dev/null || true

# Start the app with PM2
echo "Starting app with PM2..."
PORT=$PORT pm2 start npm --name "$APP_NAME" -- start

# Save PM2 process list
pm2 save

# Setup PM2 to start on system boot (run once)
pm2 startup

echo "=== Deployment complete ==="
echo "App is running on port $PORT"
echo ""
echo "Useful PM2 commands:"
echo "  pm2 status          - Check app status"
echo "  pm2 logs $APP_NAME  - View app logs"
echo "  pm2 restart $APP_NAME - Restart app"
echo "  pm2 stop $APP_NAME - Stop app"
