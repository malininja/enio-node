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

const pdvs = [{
  PdvId: 1,
  Naziv: "prvi pdv",
  Stopa: 22,
}, {
  PdvId: 2,
  Naziv: "zadnji pdv",
  Stopa: 25,
}, {
  PdvId: 3,
  Naziv: "zadnji pdv",
  Stopa: 25,
}, {
  PdvId: 4,
  Naziv: "zadnji pdv",
  Stopa: 25,
}, {
  PdvId: 5,
  Naziv: "zadnji pdv",
  Stopa: 25,
}, {
  PdvId: 6,
  Naziv: "zadnji pdv",
  Stopa: 25,
}, {
  PdvId: 7,
  Naziv: "zadnji pdv",
  Stopa: 25,
}, {
  PdvId: 8,
  Naziv: "zadnji pdv",
  Stopa: 25,
}, {
  PdvId: 9,
  Naziv: "zadnji pdv",
  Stopa: 25,
}, {
  PdvId: 10,
  Naziv: "zadnji pdv",
  Stopa: 25,
}
];

const response = {
  page: 2,
  total: 4,
  records: 36,
  rows: pdvs,
};

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

async function getAll(req, res, next) {
  // rows = no of rows per page, page = page number, sidx = sort field, sord = asc/desc
  const { rows, page, sidx, sord, filters } = req.query;

  const builder = getFilter(filters);

  const count = (await knex("Pdv").count())[0].count;
  const pdvs = builder ? await knex("Pdv").modify(builder) : await knex("Pdv");

  res.send(response);
  return next();
}

module.exports = { getAll };
