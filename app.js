"use strict";
require("dotenv").config();
const cors = require("@fastify/cors");

const path = require("path");
const AutoLoad = require("@fastify/autoload");

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
module.exports = async function (fastify, opts) {
  // Place here your custom code!
  await fastify.register(cors, {
    origin: "http://127.0.0.1:5173",
    credentials: true,
  });
  await fastify.addHook("onRequest", async () => {
    await delay(500);
  });
  fastify.register(require("@fastify/cookie"), {
    secret: process.env.cookie_secret,
    hook: "onRequest",
    parseOptions: {},
  });
  await fastify.register(require("@fastify/swagger"), {
    routePrefix: "/docs",
    swagger: {
      info: {
        title: "Test swagger",
        description: "Testing the Fastify swagger API",
        version: "0.1.0",
      },

      host: "127.0.0.1:3000",
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
