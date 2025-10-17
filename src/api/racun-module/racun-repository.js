const knex = require('../../configs/knex');

async function get(id) {
  const glava = await knex('racun_glava').where({ id });
  if (glava && glava.length === 0) return null;
  const stavke = await knex('racun_stavka').where({ racun_glava_id: id });
  return { racunGlava: glava[0], racunStavkaCollection: stavke };
}

async function insertGlava(trx, glava) {
  glava.timestamp = new Date().getTime();
  const [id] = await trx('racun_glava').insert(glava).returning('id');
  return id;
}

async function insertStavke(trx, glavaId, stavke) {
  const stavkePromises = [];
  stavke.forEach((stavka) => {
    const prom = async () => {
      stavka.racun_glava_id = parseInt(glavaId, 10);
      stavka.timestamp = new Date().getTime();
      await trx('racun_stavka').insert(stavka);
    };

    stavkePromises.push(prom());
  });

  await Promise.all(stavkePromises);
}

function updateGlava(trx, glava) {
  const { id } = glava;
  return trx('racun_glava').where({ id }).update(glava);
}

async function updateStavke(trx, stavke) {
  const promises = stavke.map((s) => {
    const { id } = s;
    return trx('racun_stavka').where({ id }).update(s);
  });

  return Promise.all(promises);
}

async function removeStavke(trx, stavke) {
  const ids = stavke.map((s) => s.id);
  return trx('racun_stavka').whereIn('id', ids).del();
}

module.exports = {
  get,
  insertGlava,
  insertStavke,
  updateGlava,
  updateStavke,
  removeStavke,
};
