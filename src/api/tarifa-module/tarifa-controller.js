const knex = require("../../configs/knex");
const knexUtils = require("../../utils/knex");
const typeParser = require("../../utils/type-parsers");
const jqGrid = require("../../utils/jqGrid");
const bl = require("../../utils/bl");
const repository = require("./tarifa-repository");

async function getAll(req, res, next) {
  const { query } = req;
  const { pageSize, offset } = jqGrid.getPagingData(query);

  try {
    const firmaId = bl.getFirmaId(req);
    const filters = [{ field: "tarifa.firma_id", value: firmaId }];
    const fieldTypes = { "stopa": "numeric", "active": "boolean" };
    const builder = knexUtils.whereBuilder(filters, query, fieldTypes);
  
    let countPromise = knexUtils.getCount(knex, "tarifa", builder);
    let tarifsPromise = knexUtils.getData(knex, query, "tarifa", builder, pageSize, offset);
    const [count, tarifs] = await Promise.all([countPromise, tarifsPromise]);
  
    res.send(jqGrid.getResponse(tarifs, count, query));
    return next(); 
  } catch (err) {
    return next(err);
  }
}

async function get(req, res, next) {
  const { id } = req.params;

  try {
    const tarifa = await repository.get(id);
    res.send(tarifa);
    return next(); 
  } catch (err) {
    return next(err);
  }
}

async function save(req, res, next) {
  const { id, naziv, stopa: stopaString, active: activeString, timestamp } = req.body;

  try {
    const stopa = typeParser.parseCurrency(stopaString);
    const active = typeParser.parseBool(activeString);
  
    let recordCount = 1;
  
    if (id) {
      recordCount = await knex("tarifa")
        .where({ id, timestamp })
        .update(({ naziv, stopa, active, timestamp: (new Date()).getTime() }));
    } else {
      await knex("tarifa").insert({
        naziv,
        stopa,
        active: true,
        firma_id: bl.getFirmaId(req),
        timestamp: (new Date()).getTime(),
      });
    }
  
    res.send(recordCount === 1);
    return next(); 
  } catch (err) {
    return next(err);
  }
}

module.exports = { getAll, get, save };
