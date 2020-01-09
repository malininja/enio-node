const knex = require("../../configs/knex");
const knexUtils = require("../../utils/knex");
const typeParser = require("../../utils/type-parsers");
const jqGrid = require("../../utils/jqGrid");
const bl = require("../../utils/bl");

async function getAll(req, res, next) {
  const { query } = req;
  const { pageSize, offset } = jqGrid.getPagingData(query);

  const firmaId = bl.getFirmaId(req);
  const filters = [{ field: "Pdv.FirmaId", value: firmaId }];
  const builder = knexUtils.whereBuilder(filters, query, { "Stopa": "numeric" });

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
  const Stopa = typeParser.parseCurrency(stopaString);

  let recordCount = 1;

  if (PdvId) {
    recordCount = await knex("Pdv")
      .where({ PdvId, ConcurrencyGuid })
      .update(({ Naziv, Stopa, ConcurrencyGuid: (new Date()).getTime() }));
  } else {
    const id = await knexUtils.getId();

    await knex("Pdv").insert({
      PdvId: id,
      Naziv,
      Stopa,
      FirmaId: bl.getFirmaId(req),
      ConcurrencyGuid: (new Date()).getTime(),
    });
  }

  res.send(recordCount === 1);
  return next();
}
module.exports = { getAll, get, save };
