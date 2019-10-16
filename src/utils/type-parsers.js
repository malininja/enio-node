function parseCurrency(data) {
  return parseFloat(data.toString().replace(".", "").replace(",", "."));
}

function parseBool(data) {
  try {
    return JSON.parse(data.toString().toLowerCase());
  } catch (e) {
    return false;
  }
}

module.exports = { parseCurrency, parseBool };
