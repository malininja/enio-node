exports.seed = async knex => {
  const tableName = "partner";
  const exists = await knex.schema.hasTable(tableName);
  if (exists) return;

  return knex.schema.createTable(tableName, table => {
    table.integer("id").primary();
    table.string("adresa", 100);
    table.string("mjesto", 100);
    table.string("naziv", 100).notNullable();
    table.string("oib", 11).notNullable();
    table.string("posta", 10);
    table.integer("valuta").notNullable();
    table.boolean("active").notNullable();
    table.string("timestamp").notNullable();
  });
};
