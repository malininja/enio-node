exports.seed = async knex => {
  const tableName = "pdv";
  const exists = await knex.schema.hasTable(tableName);
  if (exists) return;

  return knex.schema.createTable(tableName, table => {
    table.integer("id").primary();
    table.string("naziv", 50).notNullable();
    table.decimal("stopa", 4, 2).notNullable();
    table.string("timestamp").notNullable();
  });
};
