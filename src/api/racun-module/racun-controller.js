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

function dajObrisane(stare, nove) {
  const obrisane = [];
  const noveIds = nove.map(s => s.RacunStavkaId ? parseInt(s.RacunStavkaId) : null);

  stare.forEach(stavka => {
    if (!noveIds.includes(s.RacunStavkaId)) obrisane.push(stavka);
  });

  return obrisane;
}

function pripremiStavkeZaUpis(stavke) {
  stavke.forEach(stavka => {
    delete stavka.$$hashKey;
    delete stavka.Artikl;
    stavka.Kolicina = typeParser.parseCurrency(stavka.Kolicina);
    stavka.Cijena = typeParser.parseCurrency(stavka.Cijena);
    stavka.PdvPosto = parseFloat(stavka.PdvPosto);

    const { Kolicina, Cijena, PdvPosto } = stavka;
    // zaokruži na dvije decimale
    stavka.TarifaIznos = Kolicina * Cijena * glava.TarifaStopa / 100;
    stavka.PdvIznos = (Kolicina * Cijena + stavka.TarifaIznos) * PdvPosto / 100;
    stavka.Iznos = Kolicina * Cijena + stavka.TarifaIznos + stavka.PdvIznos;
  });
}

async function pripremiGlavuZaUpis(firmaId, glava) {
  const config = await configRepository.get(firmaId);
  const godina = config.AktivnaGodina;
  const [dan, mjesec, godinaDatum] = glava.Datum.split(".");
  glava.Datum = new Date(`${godinaDatum}-${mjesec}-${dan}`);

  if (godina !== parseInt(godinaDatum)) {
    throw new Error("Datum računa nije u aktivnoj godini.");
  }

  glava.Godina = godina;

  const tarifa = await tarifaRepository.get(glava.TarifaId);
  glava.TarifaStopa = tarifa.Stopa;
}

async function save(req, res, next) {
  const trx = await knex.transaction();

  try {
    const { glava, stavke } = req.body;
    const firmaId = bl.getFirmaId(req);

    let id = glava.RacunGlavaId ? parseInt(glava.RacunGlavaId): null;

    if (id) {
      const racun = await repository.get(id);
      if (racun.RacunGlava.FirmaId !== firmaId ||
        racun.RacunGlava.FirmaId !== parseInt(glava.FirmaId)) {
        throw new Error("Kriva firma.");
      }

      pripremiGlavuZaUpis(firmaId, glava);
      pripremiStavkeZaUpis(stavke);
      const obrisane = dajObrisane(racun.RacunStavkaCollection, stavke);
      
      savedData = await racunRepository.update(trx, glava, stavke);
    } else {
      glava.FirmaId = firmaId;

      const brojRacuna = await brojacRepository.sljedeciBroj(trx, firmaId, "racun", godina);
      glava.BrojRacuna = brojRacuna;

      pripremiGlavuZaUpis(firmaId, glava);
      pripremiStavkeZaUpis(stavke);
      id = await racunRepository.insert(trx, glava, stavke);
    }

    await trx.commit();
    res.send(id);
    return next();
  } catch (error) {
    await trx.rollback();
    return next(error);
  }
}

module.exports = { get, getAll, save };
