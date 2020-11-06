const parsers = require('./type-parsers');

function whereBuilder(additionalFilters, jqGridQuery, fieldTypes) {
  const { filters } = jqGridQuery;

  let rules;
  return (queryBuilder) => {
    additionalFilters.forEach((filter) => {
      const { field, operator, value } = filter;

      if (operator) queryBuilder.andWhere(field, operator, value);
      else queryBuilder.andWhere(field, value);
    });

    if (filters) {
      ({ rules } = JSON.parse(filters));

      rules.forEach((rule) => {
        const { field, data } = rule;

        if (fieldTypes && fieldTypes[field] === 'numeric') {
          const parsed = parsers.parseCurrency(data);
          queryBuilder.andWhere(field, parsed);
        } else if (fieldTypes && fieldTypes[field] === 'boolean') {
          const parsed = parsers.parseBool(data);
          queryBuilder.andWhere(field, parsed);
        } else {
          queryBuilder.andWhere(field, 'like', `${data}%`);
        }
      });
    }
  };
}

async function getCount(knex, table, builder) {
  const count = await knex(table).where(builder).count();
  return count[0].count;
}

function getData(knex, reqQuery, table, builder, pageSize, offset) {
  const { sidx, sord } = reqQuery;

  const query = knex(table).where(builder);
  if (sidx) query.orderBy(sidx, sord);
  return query.limit(pageSize).offset(offset);
}

module.exports = { whereBuilder, getCount, getData };
