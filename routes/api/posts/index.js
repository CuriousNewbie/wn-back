"use strict";
const postsPlugin = require("../../../services/posts");
const authPlugin = require("../../../services/auth");

module.exports = async function (fastify, opts) {
  fastify.register(postsPlugin);
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
          userId: { type: "number" },
          feedType: {
            type: "string",
            default: "best",
            oneOf: [
              {
                enum: ["best", "new", "subs", "user"],
              },
            ],
          },
          limit: {
            type: "integer",
            maximum: 20,
            default: 2,
          },
          page: {
            type: "integer",
            default: 1,
          },
        },

        if: { properties: { feedType: { const: "user" } } },
        then: { required: ["userId"] },
      },
    },
    handler: async (request, reply) => {
      if (request.query.feedType === "subs" && !request.user)
        return { posts: [], num: 0 };

      try {
        const posts = await fastify.postsDA.getPosts({
          feedType: request.query.feedType,
          limit: request.query.limit,
          page: request.query.page,
          user: request.user,
          userId: request.query.userId || 0,
        });
        return posts;
      } catch (error) {
        reply.statusCode = 500;
        return {};
      }
    },
  });

  fastify.route({
    method: "GET",
    url: "/:id",
    schema: {
      params: {
        type: "object",
        properties: {
          id: { type: "number" },
        },
        required: ["id"],
      },
      querystring: {
        type: "object",
        properties: {
          comments: { type: "number", default: 10 },
          commentsPage: { type: "number", default: 1 },
        },
      },
    },
    handler: async (request, reply) => {
      const res = await fastify.postsDA.getPost(
        request.params.id,
        request.query.comments,
        request.query.commentsPage
      );
      return res;
    },
  });

  fastify.addHook("preSerialization", async (request, reply, payload) => {
    if (request.user) payload.isAuthenticated = true;
    else payload.isAuthenticated = false;

    return payload;
  });
};
