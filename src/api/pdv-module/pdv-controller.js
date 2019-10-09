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

function getFilter(filters) {
  let rules;
  let builder;
  if (filters) {
    ({ rules } = JSON.parse(filters));
    builder = queryBuilder => {
      rules.forEach(rule => {
        queryBuilder = queryBuilder.andWhere(rule.field, "like", `${rule.data}%`);
      });
    };
  }

  // field = field name, data = filter data
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

  const builder = getFilter(filters);

  let countPromise = knex("Pdv");
  if (builder) countPromise = countPromise.where(builder);
  countPromise = countPromise.count();

  let pdvsPromise = knex("Pdv");
  if (builder) pdvsPromise = pdvsPromise.where(builder);
  pdvsPromise.limit(pageSize).offset(offset);

  const [count, pdvs] = await Promise.all([countPromise, pdvsPromise]);

  console.log("pdvs count=", pdvs.length, "count", count);
  res.send(getResponse(pageSize, pageNo, pdvs, count[0].count));
  return next();
}

module.exports = { getAll };
