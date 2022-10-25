"use strict";
const usersPlugin = require("../../../services/users");
const authPlugin = require("../../../services/auth");

module.exports = async function (fastify, opts) {
  fastify.register(usersPlugin);
  fastify.register(authPlugin);
  fastify.addHook("preHandler", async (request) => {
    const userId = request.cookies.sessionid;
    if (!userId) return;

    try {
      request.user = await fastify.authDA.getUser(userId);
    } catch (error) {
      return;
    }
  });

  fastify.route({
    method: "GET",
    url: "/:id",
    schema: {
      params: {
        type: "object",
        properties: {
          id: {
            type: "integer",
          },
        },
        required: ["id"],
      },
    },
    handler: async (request, reply) => {
      try {
        const res = await fastify.usersDA.getUser({ id: request.params.id });
        return res;
      } catch (error) {
        console.log(error.message);
        reply.statusCode = 500;
        return {};
      }
    },
  });

  fastify.addHook("preSerialization", async (request, reply, payload) => {
    if (request.user) payload.isAuthenticated = true;
    else payload.isAuthenticated = false;

    return payload;
  });
};
