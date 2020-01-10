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
  const id = await trx("RacunGlava").insert(glava).returning("RacunGlavaId");

  const stavkePromises = [];
  stavke.forEach(stavka => {
    const prom = async () => {
      stavka.RacunStavkaId = await knexUtils.getId();
      stavka.RacunGlavaId = parseInt(id);
      stavka.ConcurrencyGuid = (new Date()).getTime();
      await trx("RacunStavka").insert(stavka);
      return 5;
    };

    stavkePromises.push(prom());
  });

  await Promise.all(stavkePromises);
  return id;
}

async function update(trx, glava, stavke) {

}

module.exports = { get, insert, update };