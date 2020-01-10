const knex = require("../../configs/knex");

async function get(id) {
  const tarife = await knex("Tarifa").where({ TarifaId: id });
  if (tarife.length) return tarife[0];
  return null;
}

module.exports = { get };
