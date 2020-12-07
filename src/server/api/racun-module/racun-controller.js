const knex = require('../../configs/knex');
const knexUtils = require('../../utils/knex');
const typeParser = require('../../utils/type-parsers');
const jqGrid = require('../../utils/jqGrid');
const bl = require('../../utils/bl');
const brojacRepository = require('../brojac-module/brojac-repository');
const racunRepository = require('./racun-repository');
const firmaRepository = require('../firma-module/firma-repository');
const tarifaRepository = require('../tarifa-module/tarifa-repository');
const partnerRepository = require('../partner-module/partner-repository');
const racunReport = require('./reports/racun');

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
  const filters = [{ field: 'racun_glava.firma_id', value: firmaId }];

  const fieldTypes = { broj_racuna: 'numeric', status_id: 'numeric' };
  const builder = knexUtils.whereBuilder(filters, query, fieldTypes);

  const countPromise = knexUtils.getCount(knex, 'racun_glava', builder);
  const racunGlavePromise = knexUtils.getData(knex, query, 'racun_glava', builder, pageSize, offset);
  racunGlavePromise.innerJoin('partner', 'racun_glava.partner_id', 'partner.id');
  racunGlavePromise.innerJoin('firma', (join) => {
    join.on('racun_glava.firma_id', 'firma.id')
      .andOn('racun_glava.godina', 'firma.aktivna_godina');
  });

  racunGlavePromise.select('racun_glava.*', 'partner.naziv as partner_naziv');

  const [count, racunGlave] = await Promise.all([countPromise, racunGlavePromise]);

  res.send(jqGrid.getResponse(racunGlave, count, query));
  return next();
}

function dajObrisane(stare, trenutne) {
  const obrisane = [];
  const noveIds = trenutne.map((s) => s.id);

  stare.forEach((s) => {
    if (!noveIds.includes(s.id)) obrisane.push(s);
  });

  return obrisane;
}

function dajNove(stare, trenutne) {
  const nove = [];
  const stareIds = stare.map((s) => s.id);

  trenutne.forEach((s) => {
    if (!stareIds.includes(s.id)) nove.push(s);
  });

  return nove;
}

function dajIzmjenjene(stare, trenutne) {
  const izmjenjene = [];
  const stareIds = stare.map((s) => s.id);

  trenutne.forEach((s) => {
    if (stareIds.includes(s.id)) izmjenjene.push(s);
  });

  return izmjenjene;
}

function pripremiStavkeZaUpis(glava, stavke) {
  stavke.forEach((stavka) => {
    delete stavka.$$hashKey;
    delete stavka.artikl;
    stavka.kolicina = typeParser.parseCurrency(stavka.kolicina);
    stavka.cijena = typeParser.parseCurrency(stavka.cijena);
    stavka.pdv_posto = parseFloat(stavka.pdv_posto);

    const { kolicina, cijena, pdv_posto: pdvPosto } = stavka;
    // zaokruži na dvije decimale
    stavka.tarifa_iznos = kolicina * cijena * glava.tarifa_stopa / 100;
    stavka.pdv_iznos = (kolicina * cijena + stavka.tarifa_iznos) * pdvPosto / 100;
    stavka.iznos = kolicina * cijena + stavka.tarifa_iznos + stavka.pdv_iznos;
  });
}

async function pripremiGlavuZaUpis(glava, aktivnaGodina) {
  const [dan, mjesec, godinaDatum] = glava.datum.split('.');
  glava.datum = new Date(`${godinaDatum}-${mjesec}-${dan}`);

  if (aktivnaGodina !== parseInt(godinaDatum, 10)) {
    throw new Error('Datum računa nije u aktivnoj godini.');
  }

  glava.godina = aktivnaGodina;

  const tarifa = await tarifaRepository.get(glava.tarifa_id);
  glava.tarifa_stopa = parseInt(tarifa.stopa, 10);
}

async function save(req, res, next) {
  const trx = await knex.transaction();

  try {
    const { glava, stavke } = req.body;
    const firmaId = bl.getFirmaId(req);

    let { id } = glava;
    const firma = await firmaRepository.get(firmaId);

    if (id) {
      const racun = await racunRepository.get(id);
      if (racun.racunGlava.firma_id !== firmaId
        || racun.racunGlava.firma_id !== parseInt(glava.firma_id, 10)) {
        throw new Error('Kriva firma.');
      }

      await pripremiGlavuZaUpis(glava, firma.aktivna_godina);
      pripremiStavkeZaUpis(glava, stavke);

      const nove = dajNove(racun.racunStavkaCollection, stavke);
      const izmjenjene = dajIzmjenjene(racun.racunStavkaCollection, stavke);
      const obrisane = dajObrisane(racun.racunStavkaCollection, stavke);

      await Promise.all([
        racunRepository.updateGlava(trx, glava),
        racunRepository.insertStavke(trx, glava.id, nove),
        racunRepository.updateStavke(trx, izmjenjene),
        racunRepository.removeStavke(trx, obrisane),
      ]);
    } else {
      glava.firma_id = firmaId;

      glava.broj_racuna = await brojacRepository.sljedeciBroj(trx, firmaId, 'racun', firma.aktivna_godina);

      await pripremiGlavuZaUpis(glava, firma.aktivna_godina);
      pripremiStavkeZaUpis(glava, stavke);
      id = await racunRepository.insertGlava(trx, glava);
      await racunRepository.insertStavke(trx, id, stavke);
    }

    await trx.commit();
    res.send(id.toString());
    return next();
  } catch (error) {
    await trx.rollback();
    return next(error);
  }
}

async function report(req, res, next) {
  try {
    const { id } = req.params;
    const firmaId = bl.getFirmaId(req);

    const [firma, racun] = await Promise.all([
      firmaRepository.get(firmaId),
      racunRepository.get(id),
    ]);

    const artiklIds = racun.racunStavkaCollection.map((s) => s.artikl_id);

    const { partner_id: partnerId, tarifa_id: tarifaId } = racun.racunGlava;
    const [partner, tarifa, artikli] = await Promise.all([
      partnerRepository.get(partnerId),
      tarifaRepository.get(tarifaId),
      knex.select('id', 'naziv', 'jm').from('artikl').whereIn('id', artiklIds),
    ]);

    const doc = racunReport(firma, racun, partner, tarifa, artikli);
    doc.pipe(res);
    doc.end();
    return next();
  } catch (err) {
    return next(err);
  }
}

module.exports = { get, getAll, save, report };
