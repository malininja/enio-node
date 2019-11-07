const knex = require("../../configs/knex");
const knexUtils = require("../../utils/knex");
const jqGrid = require("../../utils/jqGrid");
const bl = require("../../utils/bl");

async function getAll(req, res, next) {
  const { query } = req;
  const { pageSize, offset } = jqGrid.getPagingData(query);

  const builder = knexUtils.whereBuilder(query, { "Stopa": "numeric" });

  let countPromise = knexUtils.getCount(knex, "Pdv", builder);
  let pdvsPromise = knexUtils.getData(knex, query, "Pdv", builder, pageSize, offset);
  const [count, pdvs] = await Promise.all([countPromise, pdvsPromise]);

  res.send(jqGrid.getResponse(pdvs, count, query));
  return next();
}

function GetFirmaId(req) {
  return -1;
}

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
module.exports = { getAll, get, save };
