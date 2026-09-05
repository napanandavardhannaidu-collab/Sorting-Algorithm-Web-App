module.exports = {
  apps: [
    {
      name: 'sorting-app-server',
      script: './server.mjs',
      cwd: './',
      instances: 1,
      exec_mode: 'fork',
      watch: ['server.mjs', 'dist'],
      ignore_watch: ['node_modules', '.git', '.pm2'],
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      error_file: '.pm2/error.log',
      out_file: '.pm2/out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
      max_memory_restart: '500M',
    },
  ],
};
