"use strict";

module.exports = async function (fastify, opts) {
  fastify.get("/:feedType", async function (request, reply) {
    return await fastify.db.any("Select * from users limit 5;");
  });
};
