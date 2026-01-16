# Xirevoa Deployment Guide

## Initial Setup

1. **Upload files to server:**
   - Upload `deploy.sh` and `ecosystem.config.js` to your server

2. **Make deployment script executable:**
   ```bash
   chmod +x deploy.sh
   ```

3. **Run initial deployment:**
   ```bash
   ./deploy.sh
   ```

4. **Setup PM2 startup (one-time):**
   ```bash
   pm2 startup
   # Follow the command it outputs
   pm2 save
   ```

## Using PM2 Ecosystem Config (Alternative Method)

Instead of the bash script, you can use PM2 ecosystem config:

```bash
# Start with ecosystem config
pm2 start ecosystem.config.js

# Save PM2 process list
pm2 save
```

## Subsequent Deployments

Simply run the deployment script:
```bash
./deploy.sh
```

## PM2 Management Commands

```bash
# View app status
pm2 status

# View logs
pm2 logs xirevoa

# View only error logs
pm2 logs xirevoa --err

# View only output logs
pm2 logs xirevoa --out

# Restart app
pm2 restart xirevoa

# Stop app
pm2 stop xirevoa

# Monitor resources
pm2 monit

# Delete app from PM2
pm2 delete xirevoa
```

## Troubleshooting

### Check if app is running:
```bash
pm2 status
curl http://localhost:3012
```

### Check logs:
```bash
pm2 logs xirevoa --lines 100
```

### Restart app:
```bash
pm2 restart xirevoa
```

### Verify port is listening:
```bash
netstat -tulpn | grep 3012
```

## Server Requirements

- Node.js (v18+ recommended)
- npm
- PM2 (`npm install -g pm2`)
- Git
- LiteSpeed Web Server with the vhost configuration

## Directory Structure

```
/home/xirevoa.com/
├── public_html/
│   └── xirevoa/          # Git repository and Next.js app
├── logs/                 # Log files
│   ├── xirevoa.com.access_log
│   ├── xirevoa.com.error_log
│   ├── xirevoa-pm2-error.log
│   └── xirevoa-pm2-out.log
```
