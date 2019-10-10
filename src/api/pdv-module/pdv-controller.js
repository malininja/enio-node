var knex = require('knex')({
  client: 'pg',
  version: '10.10',
  connection: {
    host: '127.0.0.1',
    user: 'postgres',
    password: '1234',
    database: 'enio_node',
  }
});

knex.on('query', function (queryData) {
  console.log(queryData.sql);
});

function getBuilder(filters) {
  let rules;
  let builder;
  builder = queryBuilder => {
    if (filters) {
      ({ rules } = JSON.parse(filters));

      rules.forEach(rule => {
        queryBuilder = queryBuilder.andWhere(rule.field, "like", `${rule.data}%`);
      });
    }
  };

  return builder;
}

function getResponse(pageSize, pageNo, data, count) {
  return {
    page: pageNo,
    total: Math.ceil(count / pageSize),
    records: count,
    rows: data,
  };
}

async function getAll(req, res, next) {
  // rows = no of rows per page, page = page number, sidx = sort field, sord = asc/desc
  const { rows, page, sidx, sord, filters } = req.query;
  const pageSize = parseInt(rows);
  const pageNo = parseInt(page);
  const offset = pageSize * (pageNo - 1);

  const builder = getBuilder(filters);

  let countPromise = knex("Pdv");
  countPromise = countPromise.where(builder);
  countPromise = countPromise.count();

  let pdvsPromise = knex("Pdv");
  pdvsPromise = pdvsPromise.where(builder);
  if (sidx) pdvsPromise.orderBy(sidx, sord);
  pdvsPromise.limit(pageSize).offset(offset);

  const [count, pdvs] = await Promise.all([countPromise, pdvsPromise]);

  console.log("pdvs count=", pdvs.length, "count", count);
  res.send(getResponse(pageSize, pageNo, pdvs, count[0].count));
  return next();
}

async function get(req, res, next) {
  const { id } = req.params;

  const pdvs = await knex("Pdv").where("PdvId", id);
  let pdv = null;
  if (pdvs.length === 1) pdv = pdvs[0];

  res.send(pdv);
  return next();
}

async function save(req, res, next) {
  const { PdvId, Naziv, Stopa: stopaString, ConcurrencyGuid } = req.body;
  const Stopa = parseFloat(stopaString.replace(".", "").replace(",", "."));

  let pdv = 1;

  if (PdvId) {
    pdv = await knex("Pdv")
      .where({ PdvId, ConcurrencyGuid })
      .update(({ Naziv, Stopa, ConcurrencyGuid: (new Date()).getTime() }));
  } else {
    const id = (await knex.raw("select nextval('\"GenericSequence\"')")).rows[0].nextval;

    await knex("Pdv").insert({
      PdvId: id,
      Naziv,
      Stopa,
      FirmaId: -1,
      ConcurrencyGuid: (new Date()).getTime(),
    });
  }

  console.log("output =", pdv);

  res.send(pdv === 1);
  return next();
}
module.exports = { getAll, get, save };
