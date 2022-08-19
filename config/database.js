module.exports = ({ env }) => ({
  defaultConnection: 'default',
  connection: {
    client: 'postgres',
    connection: {
      host: env('DATABASE_HOST', 'localhost'),
      port: env.int('DATABASE_PORT', 5432),
      database: env('DATABASE_NAME', 'wow_health'),
      user: env('DATABASE_USERNAME', 'postgres'),
      password: env('DATABASE_PASSWORD', 'admin'),
      schema: env('DATABASE_SCHEMA', 'public'), // Not required
      ssl: false
    },
    debug: false
  },
});


// const parse = require('pg-connection-string').parse;
// const config = parse(process.env.DATABASE_URL);

// module.exports = ({ env }) => ({
//   defaultConnection: 'default',
//   connection: {
//     client: 'postgres',
//     connection: {
//       host: env('DATABASE_HOST', config.host),
//       port: env.int('DATABASE_PORT', config.port),
//       database: env('DATABASE_NAME', config.database),
//       user: env('DATABASE_USERNAME', config.user),
//       password: env('DATABASE_PASSWORD', 'b1698441c12fcfbf8c5af144dfb4a2af777604615eb9287b7c289334b55423d9'),
//       schema: env('DATABASE_SCHEMA', 'public'), // Not required
//       ssl: {
//         rejectUnauthorized: false
//       },
//     },
//     debug: false
//   },
// });