const knex = require("../../configs/knex");
const knexUtils = require("../../utils/knex");
const typeParser = require("../../utils/type-parsers");
const jqGrid = require("../../utils/jqGrid");
const bl = require("../../utils/bl");

async function getAll(req, res, next) {
  const { query } = req;
  const { pageSize, offset } = jqGrid.getPagingData(query);

  const firmaId = bl.getFirmaId(req);
  const filters = [{ field: "Artikl.FirmaId", value: firmaId }];
  const fieldTypes = { "Cijena": "numeric", "IsActive": "boolean" };
  const builder = knexUtils.whereBuilder(filters, query, fieldTypes);

  let countPromise = knexUtils.getCount(knex, "Artikl", builder);
  let artikliPromise = knexUtils.getData(knex, query, "Artikl", builder, pageSize, offset);
  artikliPromise.innerJoin("Pdv", "Artikl.PdvId", "Pdv.PdvId");
  artikliPromise.select("Artikl.*", "Pdv.Stopa as PdvStopa");

  const [count, artikli] = await Promise.all([countPromise, artikliPromise]);

  res.send(jqGrid.getResponse(artikli, count, query));
  return next();
}

async function get(req, res, next) {
  const { id } = req.params;

  const artikli = await knex("Artikl").where("ArtiklId", id);
  let artikl = null;
  if (artikli.length === 1) artikl = artikli[0];

  res.send(artikl);
  return next();
}

async function save(req, res, next) {
  const { ArtiklId, Jm, Naziv, PdvId, IsActive: isActiveString, Cijena: cijenaString, ConcurrencyGuid } = req.body;
  const Cijena = typeParser.parseCurrency(cijenaString);
  const IsActive = typeParser.parseBool(isActiveString);

  let recordCount = 1;

  if (ArtiklId) {
    recordCount = await knex("Artikl")
      .where({ ArtiklId, ConcurrencyGuid })
      .update(({ Jm, Naziv, PdvId, IsActive, Cijena, ConcurrencyGuid: (new Date()).getTime() }));
  } else {
    const id = await knexUtils.getId();

    await knex("Artikl").insert({
      ArtiklId: id,
      Jm,
      Naziv,
      PdvId,
      Cijena,
      IsActive: true,
      FirmaId: bl.getFirmaId(req),
      ConcurrencyGuid: (new Date()).getTime(),
    });
  }

  res.send(recordCount === 1);
  return next();
}

module.exports = { getAll, get, save };
