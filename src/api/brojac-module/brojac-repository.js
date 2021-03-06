async function sljedeciBroj(trx, firmaId, naziv, godina) {
  if (!godina) godina = 0;

  const brojaci = await trx('brojac').where({
    firma_id: firmaId,
    naziv,
    godina,
  });

  if (brojaci.length) {
    const brojac = brojaci[0];
    const slijedeciBroj = brojac.slijedeci_broj + 1;

    await trx('brojac')
      .where({
        firma_id: firmaId,
        naziv,
        godina,
        timestamp: brojac.timestamp,
      })
      .update({ slijedeci_broj: slijedeciBroj, timestamp: (new Date()).getTime() });

    return slijedeciBroj;
  }

  await trx('brojac')
    .insert({
      firma_id: firmaId,
      naziv,
      godina,
      slijedeci_broj: 1,
      timestamp: (new Date()).getTime(),
    });

  return 1;
}

module.exports = { sljedeciBroj };
