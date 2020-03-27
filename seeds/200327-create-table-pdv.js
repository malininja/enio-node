exports.seed = async knex => {
  const tableName = "pdv";
  const exists = await knex.schema.hasTable(tableName);
  if (exists) return;

  return knex.schema.createTable(tableName, table => {
    table.integer("id").primary();
    table.string("naziv", 50);
    table.decimal("stopa");
    table.string("timestamp");
  });
};
