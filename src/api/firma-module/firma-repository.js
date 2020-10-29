const knex = require('../../configs/knex');

async function get(firmaId) {
  const firme = await knex('firma').where('id', firmaId);

  if (firme.length) return firme[0];
  return null;
}

function save(firmaId, firma) {
  const { timestamp } = firma;

  return knex('firma')
    .where({ id: firmaId, timestamp })
    .update({
      ...firma,
      timestamp: (new Date()).getTime(),
    });
}

module.exports = { get, save };
