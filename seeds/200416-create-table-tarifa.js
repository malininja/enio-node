exports.seed = async knex => {
  const tableName = "tarifa";
  const exists = await knex.schema.hasTable(tableName);
  if (exists) return;

  return knex.schema.createTable(tableName, table => {
    table.integer("id").primary();
    table.string("naziv", 100).notNullable();
    table.decimal("stopa", 5, 2).notNullable();
    table.boolean("active").notNullable();
    table.string("timestamp").notNullable();
  });
};
