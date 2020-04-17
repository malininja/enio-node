exports.seed = async knex => {
  const tableName = "role";
  const exists = await knex.schema.hasTable(tableName);
  if (exists) return;

  return knex.schema.createTable(tableName, table => {
    table.integer("id").primary();
    table.string("code", 50).notNullable();
    table.string("name", 50).notNullable();
  });
};
