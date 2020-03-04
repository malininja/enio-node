const knex = require("../../configs/knex");
const knexUtils = require("../../utils/knex");

async function get(id) {
  const glava = await knex("RacunGlava").where({ RacunGlavaId: id });
  if (!glava) return null;
  const stavke = await knex("RacunStavka").where({ RacunGlavaId: id });
  return { RacunGlava: glava[0], RacunStavkaCollection: stavke };
}

async function insertGlava(trx, glava) {
  glava.RacunGlavaId = await knexUtils.getId();
  glava.ConcurrencyGuid = (new Date()).getTime();
  return trx("RacunGlava").insert(glava).returning("RacunGlavaId");
}

async function insertStavke(trx, glavaId, stavke) {
  const stavkePromises = [];
  stavke.forEach(stavka => {
    const prom = async () => {
      stavka.RacunStavkaId = await knexUtils.getId();
      stavka.RacunGlavaId = parseInt(glavaId);
      stavka.ConcurrencyGuid = (new Date()).getTime();
      await trx("RacunStavka").insert(stavka);
    };

    stavkePromises.push(prom());
  });

  await Promise.all(stavkePromises);
}

function updateGlava(trx, glava) {
  const { RacunGlavaId } = glava;
  return trx("RacunGlava").where({ RacunGlavaId }).update(glava);
}

async function updateStavke(trx, stavke) {
  const promises = stavke.map(s => {
    const { RacunStavkaId } = s;
    return trx("RacunStavka").where({ RacunStavkaId }).update(s);
  });

  return Promise.all(promises);
}

async function removeStavke(trx, stavke) {
  const ids = stavke.map(s => s.RacunStavkaId);
  return trx("RacunStavka").whereIn("RacunStavkaId", ids).del();
}

module.exports = {
  get,
  insertGlava,
  insertStavke,
  updateGlava,
  updateStavke,
  removeStavke,
};
