const knex = require("../../configs/knex");
const knexUtils = require("../../utils/knex");
const typeParser = require("../../utils/type-parsers");
const jqGrid = require("../../utils/jqGrid");
const bl = require("../../utils/bl");

async function getAll(req, res, next) {
  try {
    const { query } = req;
    const { pageSize, offset } = jqGrid.getPagingData(query);

    const firmaId = bl.getFirmaId(req);
    const filters = [{ field: "artikl.firma_id", value: firmaId }];
    const fieldTypes = { "cijena": "numeric", "active": "boolean" };
    const builder = knexUtils.whereBuilder(filters, query, fieldTypes);

    let countPromise = knexUtils.getCount(knex, "artikl", builder);
    let artikliPromise = knexUtils.getData(knex, query, "artikl", builder, pageSize, offset);
    artikliPromise.innerJoin("pdv", "artikl.pdv_id", "pdv.id");
    artikliPromise.select("artikl.*", "pdv.stopa as pdv_stopa");

    const [count, artikli] = await Promise.all([countPromise, artikliPromise]);

    res.send(jqGrid.getResponse(artikli, count, query));
    return next();
  } catch (err) {
    return next(err);
  }
}

async function get(req, res, next) {
  try {
    const { id } = req.params;

    const artikli = await knex("artikl").where("id", id);
    let artikl = null;
    if (artikli.length === 1) artikl = artikli[0];

    res.send(artikl);
    return next();
  } catch (err) {
    return next(err);
  }
}

async function save(req, res, next) {
  try {
    const { id, jm, naziv, pdv_id, active: isActiveString, cijena: cijenaString, timestamp } = req.body;
    const cijena = typeParser.parseCurrency(cijenaString);
    const active = typeParser.parseBool(isActiveString);

    let recordCount = 1;

    if (id) {
      recordCount = await knex("artikl")
        .where({ id, timestamp })
        .update(({ jm, naziv, pdv_id, active, cijena, timestamp: (new Date()).getTime() }));
    } else {
      await knex("artikl").insert({
        jm,
        naziv,
        pdv_id,
        cijena,
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
