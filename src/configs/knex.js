let knex;

if (!knex) {
  const config = {
    client: 'pg',
    connection: {
      host: '127.0.0.1',
      user: 'postgres',
      password: '1234',
      database: 'enio_node_v2',
    },
    pool: {
      min: 0,
      max: 7,
    },
  };

  knex = require('knex')(config);
  
  knex.on('query', function (queryData) {
    console.log(queryData.sql);
  });
}

module.exports = knex;
