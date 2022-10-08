const fp = require("fastify-plugin");
const pgp = require("pg-promise")();

module.exports = fp(function (fastify, opts, done) {
  const db = pgp(process.env.pg_connection_string);
  fastify.decorate("db", db);
  done();
});
