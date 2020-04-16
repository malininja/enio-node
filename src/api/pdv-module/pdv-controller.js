const knex = require("../../configs/knex");
const knexUtils = require("../../utils/knex");
const typeParser = require("../../utils/type-parsers");
const jqGrid = require("../../utils/jqGrid");
const bl = require("../../utils/bl");

async function getAll(req, res, next) {
  const { query } = req;
  const { pageSize, offset } = jqGrid.getPagingData(query);

  const firmaId = bl.getFirmaId(req);
  const filters = [{ field: "pdv.firma_id", value: firmaId }];
  const builder = knexUtils.whereBuilder(filters, query, { "stopa": "numeric" });

  let countPromise = knexUtils.getCount(knex, "pdv", builder);
  let pdvsPromise = knexUtils.getData(knex, query, "pdv", builder, pageSize, offset);
  const [count, pdvs] = await Promise.all([countPromise, pdvsPromise]);

  res.send(jqGrid.getResponse(pdvs, count, query));
  return next();
}

async function get(req, res, next) {
  const { id } = req.params;

  const pdvs = await knex("pdv").where("id", id);
  let pdv = null;
  if (pdvs.length === 1) pdv = pdvs[0];

  res.send(pdv);
  return next();
}

async function save(req, res, next) {
  const { id, naziv, stopa: stopaString, timestamp } = req.body;
  const stopa = typeParser.parseCurrency(stopaString);

  let recordCount = 1;

  if (id) {
    recordCount = await knex("pdv")
      .where({ id, timestamp })
      .update(({ naziv, stopa, timestamp: (new Date()).getTime() }));
  } else {
    const newId = await knexUtils.getId();

    await knex("pdv").insert({
      id: newId,
      naziv,
      stopa,
      firma_id: bl.getFirmaId(req),
      timestamp: (new Date()).getTime(),
    });
  }

  res.send(recordCount === 1);
  return next();
}
module.exports = { getAll, get, save };
