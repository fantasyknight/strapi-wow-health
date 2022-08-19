module.exports = ({ env }) => ({
  host: env('HOST', '0.0.0.0'),
  port: env.int('PORT', 1337),
  app: {
    keys: env.array('APP_KEYS'),
    env: {
      NODE_ENV: 'development'
    }
  },
  admin: {
    auth: {
      secret: env('ADMIN_JWT_SECRET')
    }
  }
});
