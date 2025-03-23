module.exports = {
  apps: [{
    name: "real-estate-platform",
    script: "./dist/index.js",
    watch: false,
    instances: 1,
    autorestart: true,
    restart_delay: 4000,
    max_restarts: 10,
    env: {
      NODE_ENV: "production",
      PORT: 4000,
      MONGODB_URI: "mongodb://localhost:27017/real-estate-platform"
    }
  }]
}; 