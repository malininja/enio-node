const knex = require("../configs/knex");
const parsers = require("./type-parsers");

async function getId() {
  return (await knex.raw("select nextval('generic_sequence')")).rows[0].nextval;
}

function whereBuilder(additionalFilters, jqGridQuery, fieldTypes) {
  const { filters } = jqGridQuery;

  let rules;
  let builder;
  builder = queryBuilder => {
    additionalFilters.forEach(filter => {
      const { field, operator, value } = filter;

      if (operator) queryBuilder.andWhere(field, operator, value);
      else queryBuilder.andWhere(field, value);
    });

    if (filters) {
      ({ rules } = JSON.parse(filters));

      rules.forEach(rule => {
        const { field, data } = rule;

        if (fieldTypes && fieldTypes[field] === "numeric") {
          const parsed = parsers.parseCurrency(data);
          queryBuilder.andWhere(field, parsed);
        } else if (fieldTypes && fieldTypes[field] === "boolean") {
          const parsed = parsers.parseBool(data);
          queryBuilder.andWhere(field, parsed);
        } else {
          queryBuilder.andWhere(field, "like", `${data}%`);
        }
      });
    }
  };

  return builder;
}

async function getCount(knex, table, whereBuilder) {
  let count = await knex(table).where(whereBuilder).count();
  return count[0].count;
}

function getData(knex, reqQuery, table, whereBuilder, pageSize, offset) {
  const { sidx, sord } = reqQuery;

  let query = knex(table).where(whereBuilder);
  if (sidx) query.orderBy(sidx, sord);
  return query.limit(pageSize).offset(offset);
}

module.exports = { getId, whereBuilder, getCount, getData };
