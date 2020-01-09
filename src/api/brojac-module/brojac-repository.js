const knexUtils = require("../../utils/knex");

async function sljedeciBroj(trx, firmaId, naziv, godina) {
  if (!godina) godina = 0;

  const brojaci = await trx("Brojac").where({
    FirmaId: firmaId,
    Naziv: naziv,
    Godina: godina,
  });

  if (brojaci.length) {
    const brojac = brojaci[0];
    slijedeciBroj = brojac.SlijedeciBroj + 1;

    await trx("Brojac")
      .where({
        FirmaId: firmaId,
        Naziv: naziv,
        Godina: godina,
        ConcurrencyGuid: brojac.ConcurrencyGuid,
      })
      .update({ SlijedeciBroj: slijedeciBroj, ConcurrencyGuid: (new Date()).getTime() });
    
    return slijedeciBroj;
  }

  const id = await knexUtils.getId();

  await trx("Brojac")
    .insert({
      BrojacId: id,
      FirmaId: firmaId,
      Naziv: naziv,
      Godina: godina,
      SlijedeciBroj: 1,
      ConcurrencyGuid: (new Date()).getTime(),
    });
  
  return 1;
}

module.exports = { sljedeciBroj };
