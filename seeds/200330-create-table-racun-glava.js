exports.seed = async knex => {
  const tableName = "racun_glava";
  const exists = await knex.schema.hasTable(tableName);
  if (exists) return;

  return knex.schema.createTable(tableName, table => {
    table.increments("id").primary();
    table.date("datum").notNullable();
    table.integer("godina").notNullable();
    table.string("mjesto_rada_adresa", 100);
    table.string("mjesto_rada_naziv", 100);
    table.integer("partner_id").notNullable();
    table.integer("tarifa_id").notNullable();
    table.decimal("tarifa_stopa", 5, 2).notNullable();
    table.integer("valuta").notNullable();
    table.integer("status_id").notNullable();
    table.integer("broj_racuna").notNullable();
    table.string("vrijeme", 10);
    table.boolean("je_pdv_racun").notNullable();
    table.string("zaglavlje", 1024);
    table.integer("firma_id").notNullable();
    table.foreign("firma_id").references("firma.id");
    table.string("timestamp");
  });
};
