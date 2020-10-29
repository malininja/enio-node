const Pdfkit = require('pdfkit');

function getRacunReport(firma, racun) {
  const { naziv, adresa, mjesto, oib } = firma;

  const font = './fonts/LiberationSans-Regular.ttf';
  const doc = new Pdfkit();
  doc.fontSize(12)
    .font(font)
    .text(naziv)
    .text(adresa)
    .text(mjesto)
    .text(`OIB: ${oib}`);


  return doc;
}
  
module.exports = getRacunReport;