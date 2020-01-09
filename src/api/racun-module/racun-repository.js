const knex = require("../../configs/knex");
const knexUtils = require("../../utils/knex");

function get(id) {
  return knex("RacunGlava").where({ RacunGlavaId: id });
}

async function insert(trx, glava, stavke) {
  glava.RacunGlavaId = await knexUtils.getId();
  glava.ConcurrencyGuid = (new Date()).getTime();
  return trx("RacunGlava").insert(glava).returning("RacunGlavaId");
}

async function update(trx, glava, stavke) {

}

module.exports = { get, insert, update };
