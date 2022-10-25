"use strict";
const commentsPlugin = require("../../../services/comments");
const authPlugin = require("../../../services/auth");

module.exports = async function (fastify, opts) {
  fastify.register(commentsPlugin);
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
    url: "/",
    schema: {
      querystring: {
        type: "object",
        properties: {
          parentType: {
            type: "string",
            default: "post",
            oneOf: [
              {
                enum: ["post", "comment"],
              },
            ],
          },
          refers: {
            type: "integer",
          },
          limit: {
            type: "integer",
            minimum: 1,
            maximum: 30,
            default: 10,
          },
          page: {
            type: "integer",
            default: 1,
          },
        },
        required: ["refers"],
      },
    },
    handler: async (request, reply) => {
      const data = await fastify.commentsDA.getComments({
        parentType: request.query.parentType,
        refers: request.query.refers,
        limit: request.query.limit,
        page: request.query.page,
        user: request.user,
      });
      return data;
    },
  });

  fastify.addHook("preSerialization", async (request, reply, payload) => {
    if (request.user) payload.isAuthenticated = true;
    else payload.isAuthenticated = false;

    return payload;
  });
};
