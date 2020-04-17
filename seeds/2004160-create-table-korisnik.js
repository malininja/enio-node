exports.seed = async knex => {
  const tableName = "korisnik";
  const exists = await knex.schema.hasTable(tableName);
  if (exists) return;

  return knex.schema.createTable(tableName, table => {
    table.integer("id").primary();
    table.integer("role_id").notNullable();
    table.foreign("role_id").references("role.id");
    table.string("ime", 20).notNullable();
    table.string("zaporka").notNullable();
    table.integer("firma_id").notNullable();
    table.foreign("firma_id").references("firma.id");
    table.string("timestamp").notNullable();
  });
};
