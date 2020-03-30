exports.seed = async knex => {
  const tableName = "racun_stavka";
  const exists = await knex.schema.hasTable(tableName);
  if (exists) return;

  return knex.schema.createTable(tableName, table => {
    table.integer("id").primary();
    table.integer("artikl_id").notNullable();
    table.decimal("cijena", 10, 2).notNullable();
    table.decimal("iznos", 10, 2).notNullable();
    table.decimal("kolicina", 8, 2).notNullable();
    table.decimal("pdv_iznos", 10, 2).notNullable();
    table.decimal("pdv_posto", 4, 2).notNullable();
    table.integer("pozicija").notNullable();
    table.integer("racun_glava_id").notNullable();
    table.decimal("tarifa_iznos", 10, 2).notNullable();
    table.string("timestamp");
  });
};
