exports.seed = async knex => {
  const tableName = "artikl";
  const exists = await knex.schema.hasTable(tableName);
  if (exists) return;

  return knex.schema.createTable(tableName, table => {
    table.integer("id").primary();
    table.string("naziv", 50);
    table.string("jm", 10);
    table.decimal("cijena");
    table.boolean("active");
    table.integer("pdv_id");
    table.string("timestamp");
  });
};
