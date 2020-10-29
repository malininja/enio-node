exports.seed = async knex => {
  const tableName = "firma";
  const exists = await knex.schema.hasTable(tableName);
  if (exists) return;

  return knex.schema.createTable(tableName, table => {
    table.increments("id").primary();
    table.integer("aktivna_godina").notNullable();
    table.string("adresa", 100);
    table.string("mjesto", 100);
    table.string("naziv", 100).notNullable();
    table.string("oib", 11).notNullable();
    table.string("zr", 50);
    table.string("pdv_id", 50).notNullable();
    table.string("odgovorna_osoba", 50).notNullable();
    table.string("clan_uprave", 50).notNullable();
    table.string("timestamp").notNullable();
  });
};
