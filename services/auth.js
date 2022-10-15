const fp = require("fastify-plugin");
const { createHash } = require("crypto");

const auth = (db) => {
  const register = async ({ name, email, password }) => {
    const hashedPass = createHash("sha256").update(password).digest("hex");
    try {
      const res = await db.none(
        `Insert into users (name, email, password) values ('${name}', '${email}', '${hashedPass}')`
      );
      return { status: 201 };
    } catch (error) {
      if (error.constraint === "users_name_key")
        throw new Error("This Username is already taken");
      if (error.constraint === "users_email_key")
        throw new Error("This email is already registered");
    }
  };

  const login = async ({ name, password }) => {
    const hashedPass = createHash("sha256").update(password).digest("hex");
    try {
      const res = await db.one(
        "SELECT id,name,avatar FROM users WHERE name = $1 AND password=$2",
        [name, hashedPass]
      );
      return res;
    } catch (error) {
      throw new Error("Invalid login or password");
    }
  };

  const getUser = async (userId) => {
    try {
      const user = await db.one(
        "Select name, email,subs,blocks from users where id=$1",
        [userId]
      );
      return user;
    } catch (error) {
      throw new Error("No such user");
    }
  };

  return {
    register,
    login,
    getUser,
  };
};

module.exports = fp((fastify, options, next) => {
  fastify.decorate("authDA", auth(fastify.db));
  next();
});
