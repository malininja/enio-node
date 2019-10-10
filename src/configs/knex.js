let knex;

if (!knex) {
  knex = require('knex')({
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
}

module.exports = knex;
