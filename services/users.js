const fp = require("fastify-plugin");

const users = (db) => {
  const getUser = async ({ id }) => {
    const queryUser = `select name,id,avatar from users where id=${id}`;
    const queryStat = `SELECT 
    (SELECT count(value) from likes where user_id=${id} and value='t') as likes, 
    (SELECT count(value) from likes where user_id=${id} and value='f') as dislikes, 
    (SELECT count(id) from posts where author_id=${id}) as posts`;
    try {
      const user = await db.one(queryUser);
      const stats = await db.one(queryStat);

      user.posts = stats.posts;
      user.likes = stats.likes;
      user.dislikes = stats.dislikes;

      return { user };
    } catch (error) {
      if (error.message === "No data returned from the query.")
        return { user: {}, posts: 0, likes: 0, dislikes: 0 };
      throw new Error(error.message);
    }
  };

  return {
    getUser,
  };
};

module.exports = fp((fastify, options, next) => {
  fastify.decorate("usersDA", users(fastify.db));
  next();
});
