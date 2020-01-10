const knex = require("../../configs/knex");
const knexUtils = require("../../utils/knex");
const typeParser = require("../../utils/type-parsers");
const jqGrid = require("../../utils/jqGrid");
const bl = require("../../utils/bl");
const brojacRepository = require("../brojac-module/brojac-repository");
const racunRepository = require("./racun-repository");
const configRepository = require("../config-module/config-repository");
const tarifaRepository = require("../tarifa-module/tarifa-repository");

async function get(req, res, next) {
  try {
    const { id } = req.params;
    const racun = await racunRepository.get(id);

    if (!racun) res.sendStatus(404);
    else res.send(racun);
    
    return next();
  } catch (error) {
    return next(error);
  }
}

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

async function save(req, res, next) {
  const trx = await knex.transaction();

  try {
    const { glava, stavke } = req.body;
    const firmaId = bl.getFirmaId(req);

    let id = glava.RacunGlavaId;

    if (id) {
      savedData = await racunRepository.update(trx, glava, stavke);
    } else {
      const config = await configRepository.get(firmaId);
      const godina = config.AktivnaGodina;
      glava.Godina = godina;
      const tarifa = await tarifaRepository.get(glava.TarifaId);
      glava.TarifaStopa = tarifa.Stopa;
      glava.BrojRacuna = await brojacRepository.sljedeciBroj(trx, firmaId, "racun", godina);
      glava.FirmaId = firmaId;
      id = await racunRepository.insert(trx, glava, stavke);
    }

    await trx.commit();
    const racun = await racunRepository.get(id);
    res.send(racun);
    return next();
  } catch (error) {
    await trx.rollback();
    return next(error);
  }
}

module.exports = { get, getAll, save };
