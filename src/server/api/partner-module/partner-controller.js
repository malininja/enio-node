const knex = require('../../configs/knex');
const knexUtils = require('../../utils/knex');
const typeParser = require('../../utils/type-parsers');
const jqGrid = require('../../utils/jqGrid');
const bl = require('../../utils/bl');
const repository = require('./partner-repository');

async function getAll(req, res, next) {
  const { query } = req;

  try {
    const { pageSize, offset } = jqGrid.getPagingData(query);

    const firmaId = bl.getFirmaId(req);
    const filters = [{ field: 'partner.firma_id', value: firmaId }];
    const fieldTypes = { Valuta: 'numeric', active: 'boolean' };
    const builder = knexUtils.whereBuilder(filters, query, fieldTypes);

    const countPromise = knexUtils.getCount(knex, 'partner', builder);
    const tarifsPromise = knexUtils.getData(knex, query, 'partner', builder, pageSize, offset);
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
    const partner = await repository.get(id);
    res.send(partner);
    return next();
  } catch (err) {
    return next(err);
  }
}

async function save(req, res, next) {
  const {
    id,
    adresa,
    timestamp,
    mjesto,
    naziv,
    oib,
    posta,
    valuta: valutaString,
    active: activeString,
  } = req.body;

  try {
    const valuta = typeParser.parseCurrency(valutaString);
    const active = typeParser.parseBool(activeString);

    let recordCount = 1;

    if (id) {
      recordCount = await knex('partner')
        .where({ id, timestamp })
        .update(({
          adresa,
          mjesto,
          naziv,
          oib,
          posta,
          valuta,
          active,
          timestamp: (new Date()).getTime(),
        }));
    } else {
      await knex('partner').insert({
        adresa,
        mjesto,
        naziv,
        oib,
        posta,
        valuta,
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
