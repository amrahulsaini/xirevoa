module.exports = {
  apps: [{
    name: 'xirevoa',
    script: 'npm',
    args: 'start',
    cwd: '/home/xirevoa.com/public_html/xirevoa',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3012
    },
    error_file: '/home/xirevoa.com/logs/xirevoa-pm2-error.log',
    out_file: '/home/xirevoa.com/logs/xirevoa-pm2-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    time: true
  }]
};
