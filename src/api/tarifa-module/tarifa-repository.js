const knex = require("../../configs/knex");

async function get(id) {
  const tarife = await knex("tarifa").where({ id });
  if (tarife.length) return tarife[0];
  return null;
}

module.exports = { get };
