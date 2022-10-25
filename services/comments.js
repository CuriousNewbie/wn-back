const fp = require("fastify-plugin");

const comments = (db) => {
  const getComments = async ({ parentType, refers, limit, page, user }) => {
    const selectQuery =
      `SELECT comments.id, date, content, name, avatar, users.id as user_id FROM comments JOIN users ON author_id=users.id 

      ` +
      (parentType === "post"
        ? ` WHERE post_id=${refers} AND comments.parent_comment_id IS NULL `
        : ` WHERE comments.parent_comment_id=${refers} `) +
      (user ? ` AND author_id NOT IN (${user.blocks.join(",")}) ` : ``) +
      ` ORDER BY date DESC LIMIT ${limit} OFFSET ${limit * (page - 1)}`;

    const numQuery =
      `SELECT COUNT(id) from comments  ` +
      (parentType === "post"
        ? ` WHERE post_id=${refers} AND parent_comment_id IS NULL `
        : ` WHERE parent_comment_id=${refers} `) +
      (user ? ` AND author_id NOT IN (${user.blocks.join(",")}) ` : ``);

    try {
      const comments = await db.any(selectQuery);
      const commentsCount = await db.one(numQuery);
      const ids = comments.map((el) => el.id);
      const idsHash = {};

      const countQuery =
        `SELECT count(id), parent_comment_id from comments where ` +
        `parent_comment_id IN (${ids.join(",")}) group by parent_comment_id`;
      const counts = await db.any(countQuery);
      counts.forEach((row) => {
        idsHash[row.parent_comment_id] = row.count;
      });
      comments.forEach((row) => (row.count = idsHash[row.id]));

      const res = await Promise.all([comments, commentsCount]);
      return { comments: res[0], num: res[1].count };
    } catch (error) {
      console.log(error.message);
      throw new Error(error.message);
    }
  };

  return {
    getComments,
  };
};

module.exports = fp((fastify, options, next) => {
  fastify.decorate("commentsDA", comments(fastify.db));
  next();
});
