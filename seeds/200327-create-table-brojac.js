exports.seed = async knex => {
  const tableName = "brojac";
  const exists = await knex.schema.hasTable(tableName);
  if (exists) return;

  return knex.schema.createTable(tableName, table => {
    table.increments("id").primary();
    table.integer("godina");
    table.string("naziv", 50);
    table.integer("slijedeci_broj");
    table.string("timestamp");
  });
};
