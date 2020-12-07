/* eslint-disable import/order */
const knexConfig = require('../../../knexfile');
const knex = require('knex')(knexConfig);

knex.on('query', (queryData) => {
  console.log(queryData.sql); // eslint-disable-line no-console
});

const { types } = require('pg');

types.setTypeParser(types.builtins.NUMERIC, (val) => parseFloat(val));

module.exports = knex;
