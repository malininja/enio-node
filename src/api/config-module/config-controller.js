const knex = require("../../configs/knex");
const bl = require("../../utils/bl");

async function get(req, res, next) {
  const configs = await knex("Config").where("FirmaId", bl.getFirmaId(req));
  let config = null;
  if (configs.length === 1) config = configs[0];

  res.send(config);
  return next();
}

async function save(req, res, next) {
  const { Naziv, Adresa, Mjesto, Oib, Zr, AktivnaGodina, ConcurrencyGuid } = req.body;

  let recordCount = await knex("Config")
  .where({ FirmaId: bl.getFirmaId(req), ConcurrencyGuid })
  .update(({ Naziv, Adresa, Mjesto, Oib, Zr, AktivnaGodina, ConcurrencyGuid: (new Date()).getTime() }));

  res.send(recordCount === 1);
  return next();
}
module.exports = { get, save };
