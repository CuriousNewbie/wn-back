module.exports = async function (fastify, opts) {
  fastify.get(
    "/",
    {
      schema: {
        description: "This is an endpoint for fetching all products",
        tags: ["products"],
        response: {
          200: {
            description: "Success Response",
            type: "array",
            items: {
              type: "object",
              properties: {
                id: { type: "number" },
                category: { type: "string" },
                title: { type: "string" },
                price: { type: "number" },
              },
            },
          },
        },
      },
    },
    async (request, reply) => {
      return [{ id: 1, category: "prod", title: "proTitle", price: 300 }];
    }
  );
};
