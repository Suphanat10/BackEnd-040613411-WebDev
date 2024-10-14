module.exports = {
  apps: [
    {
      name: "PM2_backend_api",
      script: "server.js",
      instances: 2,
      exec_mode: "cluster",
      autorestart: true,
    },
  ],
};
