const Pdfkit = require('pdfkit');

function getRacunReport(firma, racun, partner) {
  const { naziv, adresa, mjesto, oib, pdv_id: pdvId, zr } = firma;

  const font = './fonts/LiberationSans-Regular.ttf';
  const fontBold = './fonts/LiberationSans-Bold.ttf';
  const doc = new Pdfkit();
  doc.fontSize(12)
    .font(font)
    .text(naziv)
    .text(adresa)
    .text(mjesto)
    .text(`OIB: ${oib}`)
    .text(`PDV ID: ${pdvId}`)
    .text(`IBAN: ${zr}`)
    .moveDown();

  const partnerStyle = { indent: 300 };
  doc.fontSize(12)
    .font(fontBold)
    .text(partner.naziv, partnerStyle)
    .text(partner.adresa, partnerStyle)
    .text(`${partner.posta} ${partner.mjesto}`, partnerStyle);

  doc.fontSize(12)
    .font(font)
    .text(racun.racunGlava.zaglavlje, partnerStyle);

  return doc;
}

module.exports = getRacunReport;
