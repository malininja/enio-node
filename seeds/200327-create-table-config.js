exports.seed = async knex => {
  const tableName = "config";
  const exists = await knex.schema.hasTable(tableName);
  if (exists) return;

  return knex.schema.createTable(tableName, table => {
    table.integer("id").primary();
    table.integer("aktivna_godina");
    table.string("adresa", 100);
    table.string("mjesto", 100);
    table.string("naziv", 100);
    table.string("oib", 11);
    table.string("zr", 50);
    table.string("timestamp");
  });
};
