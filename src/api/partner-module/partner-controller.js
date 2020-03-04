const knex = require("../../configs/knex");
const knexUtils = require("../../utils/knex");
const typeParser = require("../../utils/type-parsers");
const jqGrid = require("../../utils/jqGrid");
const bl = require("../../utils/bl");

async function getAll(req, res, next) {
  const { query } = req;
  const { pageSize, offset } = jqGrid.getPagingData(query);

  const firmaId = bl.getFirmaId(req);
  const filters = [{ field: "Partner.FirmaId", value: firmaId }];
  const fieldTypes = { "Valuta": "numeric", "IsActive": "boolean" };
  const builder = knexUtils.whereBuilder(filters, query, fieldTypes);

  let countPromise = knexUtils.getCount(knex, "Partner", builder);
  let tarifsPromise = knexUtils.getData(knex, query, "Partner", builder, pageSize, offset);
  const [count, tarifs] = await Promise.all([countPromise, tarifsPromise]);

  res.send(jqGrid.getResponse(tarifs, count, query));
  return next();
}

async function get(req, res, next) {
  const { id } = req.params;

  const partneri = await knex("Partner").where("PartnerId", id);
  let partner = null;
  if (partneri.length === 1) partner = partneri[0];

  res.send(partner);
  return next();
}

async function save(req, res, next) {
  const { PartnerId, Adresa, ConcurrencyGuid, Mjesto, Naziv, Oib, Posta, Valuta: valutaString, IsActive: isActiveString } = req.body;

  const Valuta = typeParser.parseCurrency(valutaString);
  const IsActive = typeParser.parseBool(isActiveString);

  let recordCount = 1;

  if (PartnerId) {
    recordCount = await knex("Partner")
      .where({ PartnerId, ConcurrencyGuid })
      .update(({ Adresa,  Mjesto, Naziv, Oib, Posta, Valuta, IsActive, ConcurrencyGuid: (new Date()).getTime() }));
  } else {
    const id = await knexUtils.getId();

    await knex("Partner").insert({
      PartnerId: id,
      Adresa,
      Mjesto,
      Naziv,
      Oib,
      Posta,
      Valuta,
      IsActive: true,
      FirmaId: bl.getFirmaId(req),
      ConcurrencyGuid: (new Date()).getTime(),
    });
  }

  res.send(recordCount === 1);
  return next();
}

module.exports = { getAll, get, save };
