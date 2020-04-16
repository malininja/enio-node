exports.seed = async knex => {
  const tableName = "user";
  const exists = await knex.schema.hasTable(tableName);
  if (exists) return;

  return knex.schema.createTable(tableName, table => {
    table.integer("id").primary();
    table.integer("role_id");
    table.string("username", 20).notNullable();
    table.string("password").notNullable();
    table.integer("firma_id").notNullable();
    table.foreign("firma_id").references("firma.id");
    table.string("timestamp").notNullable();
  });
};
