const fp = require("fastify-plugin");

const posts = (db) => {
  const getPosts = async ({ feedType, limit, page, user, userId }) => {
    const selectPosts =
      "SELECT posts.id,  title, date, content, comment_number, likes, dislikes, avatar,name FROM posts JOIN users ON author_id=users.id ";

    const postsQuery = {
      best:
        selectPosts +
        (user ? `WHERE author_id NOT IN (${user.blocks.join(",")}) ` : ``) +
        `ORDER BY (likes-dislikes) DESC LIMIT ${limit} OFFSET ${
          limit * (page - 1)
        }`,
      new:
        selectPosts +
        (user ? `WHERE author_id not in (${user.blocks.join(",")}) ` : ``) +
        `ORDER by date desc limit ${limit} offset ${limit * (page - 1)}`,
      user:
        selectPosts +
        `WHERE author_id=${userId} ` +
        `ORDER by date desc limit ${limit} offset ${limit * (page - 1)}`,
      subs:
        selectPosts +
        (user ? `WHERE author_id in (${user.subs.join(",")}) ` : "") +
        `ORDER by date desc limit ${limit} offset ${limit * (page - 1)}`,
    };

    const selectCount = `select count(id) from posts `;
    const postsNumberQuery = {
      best:
        selectCount +
        (user ? `WHERE author_id NOT IN (${user.blocks.join(",")}) ` : ``),
      new:
        selectCount +
        (user ? `WHERE author_id not in (${user.blocks.join(",")}) ` : ``),
      user: selectCount + `WHERE author_id=${userId} `,
      subs:
        selectCount +
        (user ? `WHERE author_id in (${user.subs.join(",")}) ` : ""),
    };

    try {
      const posts = db.any(postsQuery[feedType]);
      const postsCount = db.one(postsNumberQuery[feedType]);
      const res = await Promise.all([posts, postsCount]);
      return { posts: res[0], num: res[1].count };
    } catch (error) {
      throw new Error(error.message);
    }
  };

  const getPost = async (id, commentNumber, commentsPage) => {
    const post = db.one(
      `Select posts.id,  title, date,content, comment_number, likes, dislikes, avatar,name from posts
        join users on author_id=users.id
        WHERE posts.id=${id};`
    );
    const comments = db.many(
      `Select comments.id, date, content, avatar,name from comments
        join users on author_id=users.id AND post_id=${id}
       ORDER by date desc limit ${commentNumber} offset ${
        (commentsPage - 1) * commentNumber
      };`
    );
    const num = db.one(`select count(id) from comments WHERE post_id=${id}`);
    const data = await Promise.all([post, comments, num]);
    return { post: data[0], comments: data[1], number: data[2].count };
  };

  return {
    getPosts,
    getPost,
  };
};

module.exports = fp((fastify, options, next) => {
  fastify.decorate("postsDA", posts(fastify.db));
  next();
});
