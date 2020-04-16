exports.seed = async knex => {
  const tableName = "artikl";
  const exists = await knex.schema.hasTable(tableName);
  if (exists) return;

  return knex.schema.createTable(tableName, table => {
    table.integer("id").primary();
    table.string("naziv", 150).notNullable();
    table.string("jm", 10).notNullable();
    table.decimal("cijena", 10, 2).notNullable();
    table.boolean("active").notNullable();
    table.integer("pdv_id").notNullable();
    table.integer("firma_id").notNullable();
    table.foreign("firma_id").references("firma.id");
    table.string("timestamp").notNullable();
  });
};
