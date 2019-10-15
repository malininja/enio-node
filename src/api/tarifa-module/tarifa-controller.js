const knex = require("../../configs/knex");
const knexUtils = require("../../utils/knex");
const numbers = require("../../utils/numbers");
const jqGrid = require("../../utils/jqGrid");
const bl = require("../../utils/bl");

async function getAll(req, res, next) {
  const { query } = req;
  const { pageSize, offset } = jqGrid.getPagingData(query);

  const firmaId = bl.getFirmaId(req);
  const fieldTypes = { "Stopa": "numeric", "IsActive": "boolean" };
  const builder = knexUtils.whereBuilder("Tarifa", firmaId, query, fieldTypes);

  let countPromise = knexUtils.getCount(knex, "Tarifa", builder);
  let tarifsPromise = knexUtils.getData(knex, query, "Tarifa", builder, pageSize, offset);
  const [count, tarifs] = await Promise.all([countPromise, tarifsPromise]);

  res.send(jqGrid.getResponse(tarifs, count, query));
  return next();
}

async function get(req, res, next) {
  const { id } = req.params;

  const tarife = await knex("Tarifa").where("TarifaId", id);
  let tarifa = null;
  if (tarife.length === 1) tarifa = tarife[0];

  res.send(tarifa);
  return next();
}

async function save(req, res, next) {
  const { TarifaId, Naziv, Stopa: stopaString, IsActive: isActiveString, ConcurrencyGuid } = req.body;
  const Stopa = numbers.parseCurrency(stopaString);
  const IsActive = numbers.parseBool(isActiveString);

  let recordCount = 1;

  if (TarifaId) {
    recordCount = await knex("Tarifa")
      .where({ TarifaId, ConcurrencyGuid })
      .update(({ Naziv, Stopa, IsActive, ConcurrencyGuid: (new Date()).getTime() }));
  } else {
    const id = await knexUtils.getId(knex);

    await knex("Tarifa").insert({
      TarifaId: id,
      Naziv,
      Stopa,
      IsActive: true,
      FirmaId: bl.getFirmaId(req),
      ConcurrencyGuid: (new Date()).getTime(),
    });
  }

  res.send(recordCount === 1);
  return next();
}

module.exports = { getAll, get, save };
