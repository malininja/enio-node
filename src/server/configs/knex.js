const knex = require('knex')({
  client: 'pg',
  version: '10.10',
  connection: {
    host: '127.0.0.1',
    user: 'postgres',
    password: '1234',
    database: 'enio_node_v2',
  },
});

knex.on('query', (queryData) => {
  console.log(queryData.sql); // eslint-disable-line no-console
});

module.exports = knex;
