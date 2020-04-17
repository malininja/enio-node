exports.seed = async knex => {
  const tableName = "brojac";
  const exists = await knex.schema.hasTable(tableName);
  if (exists) return;

  return knex.schema.createTable(tableName, table => {
    table.increments("id").primary();
    table.integer("godina").notNullable();
    table.string("naziv", 50).notNullable();
    table.integer("slijedeci_broj").notNullable();
    table.integer("firma_id").notNullable();
    table.foreign("firma_id").references("firma.id");
    table.string("timestamp").notNullable();
  });
};
