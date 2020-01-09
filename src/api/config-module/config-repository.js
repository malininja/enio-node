const knex = require("../../configs/knex");

async function get(firmaId) {
  const configs = await knex("Config").where("FirmaId", firmaId);

  if (configs.length) return configs[0];
  return null;
}

function save(firmaId, config) {
  const { Naziv, Adresa, Mjesto, Oib, Zr, AktivnaGodina, ConcurrencyGuid } = config;

  return knex("Config")
    .where({ FirmaId: firmaId, ConcurrencyGuid })
    .update(({ Naziv, Adresa, Mjesto, Oib, Zr, AktivnaGodina, ConcurrencyGuid: (new Date()).getTime() }));
}

module.exports = { get, save };
