function getPagingData(query) {
  const { rows, page } = query;

  const pageSize = parseInt(rows, 10);
  const pageNo = parseInt(page, 10);
  const offset = pageSize * (pageNo - 1);

  return { pageSize, pageNo, offset };
}

function getResponse(data, count, query) {
  const { pageSize, pageNo } = getPagingData(query);

  return {
    page: pageNo,
    total: Math.ceil(count / pageSize),
    records: count,
    rows: data,
  };
}

module.exports = { getPagingData, getResponse };
