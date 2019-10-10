const knex = require("../../configs/knex");
const knexUtils = require("../../utils/knex");
const numbers = require("../../utils/numbers");
const jqGrid = require("../../utils/jqGrid");

function getResponse(pageSize, pageNo, data, count) {
  return {
    page: pageNo,
    total: Math.ceil(count / pageSize),
    records: count,
    rows: data,
  };
}

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

async function get(req, res, next) {
  const { id } = req.params;

  const pdvs = await knex("Pdv").where("PdvId", id);
  let pdv = null;
  if (pdvs.length === 1) pdv = pdvs[0];

  res.send(pdv);
  return next();
}

async function save(req, res, next) {
  const { PdvId, Naziv, Stopa: stopaString, ConcurrencyGuid } = req.body;
  const Stopa = numbers.parseCurrency(stopaString);

  let pdv = 1;

  if (PdvId) {
    pdv = await knex("Pdv")
      .where({ PdvId, ConcurrencyGuid })
      .update(({ Naziv, Stopa, ConcurrencyGuid: (new Date()).getTime() }));
  } else {
    const id = await knexUtils.getId(knex);

    await knex("Pdv").insert({
      PdvId: id,
      Naziv,
      Stopa,
      FirmaId: -1,
      ConcurrencyGuid: (new Date()).getTime(),
    });
  }

  console.log("output =", pdv);

  res.send(pdv === 1);
  return next();
}
module.exports = { getAll, get, save };
