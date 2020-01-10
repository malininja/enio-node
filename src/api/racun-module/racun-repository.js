const knex = require("../../configs/knex");
const knexUtils = require("../../utils/knex");

async function get(id) {
  const glava = await knex("RacunGlava").where({ RacunGlavaId: id });
  if (!glava) return null;
  return { RacunGlava: glava[0], RacunStavkaCollection: [] };
}

async function insert(trx, glava, stavke) {
  glava.RacunGlavaId = await knexUtils.getId();
  glava.ConcurrencyGuid = (new Date()).getTime();
  return trx("RacunGlava").insert(glava).returning("RacunGlavaId");
}

async function update(trx, glava, stavke) {

}

module.exports = { get, insert, update };
