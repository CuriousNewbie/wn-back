"use strict";
require("dotenv").config();

const path = require("path");
const AutoLoad = require("@fastify/autoload");

module.exports = async function (fastify, opts) {
  // Place here your custom code!
  await fastify.register(require("@fastify/swagger"), {
    routePrefix: "/docs",
    swagger: {
      info: {
        title: "Test swagger",
        description: "Testing the Fastify swagger API",
        version: "0.1.0",
      },

      host: "localhost",
      schemes: ["http"],
      consumes: ["application/json"],
      produces: ["application/json"],
    },

    exposeRoute: true,
  });
  // Do not touch the following lines

  // This loads all plugins defined in plugins
  // those should be support plugins that are reused
  // through your application

  fastify.register(AutoLoad, {
    dir: path.join(__dirname, "plugins"),
    options: Object.assign({}, opts),
  });

  // // This loads all plugins defined in routes
  // // define your routes in one of these

  fastify.register(AutoLoad, {
    dir: path.join(__dirname, "routes"),
    options: Object.assign({}, opts),
  });
};
