#!/bin/bash

# CyberPanel Profile Picture Setup Script
# Run this on your VPS server

echo "Setting up profile pictures directory..."

cd /home/xirevoa.com/public_html/xirevoa

# Create cdn/profiles directory
mkdir -p cdn/profiles
chmod 755 cdn
chmod 755 cdn/profiles

# Create a test file
echo "Test file for profile pictures" > cdn/profiles/test.txt

# Pull latest code
echo "Pulling latest code..."
git pull

# Set permissions
chown -R xirevoa:xirevoa cdn

# Restart PM2
echo "Restarting Next.js app..."
pm2 restart xirevoa-nextjs || pm2 restart all

# Reload LiteSpeed config
echo "Reloading LiteSpeed..."
sudo /usr/local/lsws/bin/lswsctrl restart

echo ""
echo "Setup complete!"
echo "Test if it works: https://xirevoa.com/cdn/profiles/test.txt"
echo "Upload a new profile picture now!"
