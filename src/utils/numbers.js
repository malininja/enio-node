function parseCurrency(data) {
  return parseFloat(data.replace(".", "").replace(",", "."));
}

module.exports = { parseCurrency };
