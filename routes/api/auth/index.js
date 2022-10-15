"use strict";
const authPlugin = require("../../../services/auth");

module.exports = async function (fastify, opts) {
  fastify.register(authPlugin);
  // register route
  fastify.route({
    method: "POST",
    url: "/register",
    schema: {
      body: {
        name: {
          type: "string",
          minLength: 6,
          maxLength: 20,
        },
        password: {
          type: "string",
          minLength: 6,
          maxLength: 128,
          pattern: "^[0-9a-zA-Z]+$",
        },
        email: { type: "string" },
      },
    },

    handler: async (request, reply) => {
      try {
        const res = await fastify.authDA.register({
          name: request.body.name,
          email: request.body.email,
          password: request.body.password,
        });
        reply.code(201);
        return {};
      } catch (error) {
        reply.statusCode = 409;
        return { message: error.message };
      }
    },
  });
  //login route
  fastify.route({
    method: "POST",
    url: "/login",
    schema: {
      body: {
        name: {
          type: "string",
          minLength: 6,
          maxLength: 20,
        },
        password: {
          type: "string",
          minLength: 6,
          maxLength: 128,
          pattern: "^[0-9a-zA-Z]+$",
        },
      },
    },

    handler: async (request, reply) => {
      try {
        const res = await fastify.authDA.login({
          name: request.body.name,
          password: request.body.password,
        });
        reply.setCookie("sessionid", res.id, {
          httpOnly: true,
          path: "/api",
          maxAge: 180,
        });
        console.log("Cookie:", request.cookies);

        return res;
      } catch (error) {
        reply.statusCode = 401;
        return { message: error.message };
      }
    },
  });
  //logout route
  fastify.route({
    method: "GET",
    url: "/logout",

    handler: async (request, reply) => {
      try {
        reply.clearCookie("sessionid", { path: "/api", httpOnly: true });
        reply.statusCode = 200;
        return {};
      } catch (error) {
        reply.statusCode = 401;
        return { message: error.message };
      }
    },
  });

  fastify.route({
    method: "GET",
    url: "/check",

    handler: async (request, reply) => {
      return request.cookies.sessionid
        ? { id: request.cookies.sessionid }
        : null;
    },
  });
};
