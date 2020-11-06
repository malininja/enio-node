const knex = require('../../configs/knex');

async function get(id) {
  const partneri = await knex('partner').where('id', id);
  if (partneri.length === 1) return partneri[0];
  return null;
}

module.exports = { get };
