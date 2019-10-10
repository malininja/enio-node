const numbers = require("./numbers");

async function getId(knex) {
  return (await knex.raw("select nextval('\"GenericSequence\"')")).rows[0].nextval;
}

function whereBuilder(query, fieldTypes) {
  const { filters } = query;

  let rules;
  let builder;
  builder = queryBuilder => {
    if (filters) {
      ({ rules } = JSON.parse(filters));

      rules.forEach(rule => {
        const { field, data } = rule;

        if (fieldTypes && fieldTypes[field] === "numeric") {
          const parsed = numbers.parseCurrency(data);
          queryBuilder = queryBuilder.andWhere(field, parsed);
        } else {
          queryBuilder = queryBuilder.andWhere(field, "like", `${data}%`);
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
