const knex = require("../../configs/knex");
const knexUtils = require("../../utils/knex");
const typeParser = require("../../utils/type-parsers");
const jqGrid = require("../../utils/jqGrid");
const bl = require("../../utils/bl");

async function getAll(req, res, next) {
  const { query } = req;
  const { pageSize, offset } = jqGrid.getPagingData(query);

  const firmaId = bl.getFirmaId(req);
  const filters = [{ field: "RacunGlava.FirmaId", value: firmaId }];
  
  const fieldTypes = { "BrojRacuna": "numeric", "StatusId": "numeric" };
  const builder = knexUtils.whereBuilder(filters, query, fieldTypes);

  let countPromise = knexUtils.getCount(knex, "RacunGlava", builder);
  let racunGlavePromise = knexUtils.getData(knex, query, "RacunGlava", builder, pageSize, offset);
  racunGlavePromise.innerJoin("Partner", "RacunGlava.PartnerId", "Partner.PartnerId");
  racunGlavePromise.innerJoin("Config", join => { 
    join.on("RacunGlava.FirmaId", "Config.FirmaId")
      .andOn("RacunGlava.Godina", "Config.AktivnaGodina");
  });

  racunGlavePromise.select("RacunGlava.*", "Partner.Naziv as PartnerNaziv");

  const [count, racunGlave] = await Promise.all([countPromise, racunGlavePromise]);

  res.send(jqGrid.getResponse(racunGlave, count, query));
  return next();
}

module.exports = { getAll };
