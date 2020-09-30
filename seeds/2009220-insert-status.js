exports.seed = async knex => {
  let status = await knex("status").where({ id: 1 });
  if (status.length === 0) await knex("status").insert({ code: "Paid", name: "Plaćen", id: "1" });

  status = await knex("status").where({ id: 2 });
  if (status.length === 0) await knex("status").insert({ code: "Unpaid", name: "Neplaćen", id: "2" });

  status = await knex("status").where({ id: 3 });
  if (status.length === 0) await knex("status").insert({ code: "Cancelled", name: "Storniran", id: "3" });

  status = await knex("status").where({ id: 4 });
  if (status.length === 0) await knex("status").insert({ code: "WriteOff", name: "Otpis", id: "4" });

  status = await knex("status").where({ id: 5 });
  if (status.length === 0) await knex("status").insert({ code: "Blockade", name: "Blokada", id: "5" });
};
