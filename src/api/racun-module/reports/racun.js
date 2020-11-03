const Pdfkit = require('pdfkit');
const dateformat = require('dateformat');

function getRacunReport(firma, racun, partner) {
  const { naziv, adresa, mjesto, oib, pdv_id: pdvId, zr } = firma;

  const font = './fonts/LiberationSans-Regular.ttf';
  const fontBold = './fonts/LiberationSans-Bold.ttf';

  const pageConfig = {
    margins: {
      left: 50,
      right: 50,
      top: 50,
      bottom: 80,
    }
  };
  const doc = new Pdfkit(pageConfig);
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

  const {
    datum,
    status_id: status,
    zaglavlje,
    broj_racuna: brojRacuna,
    mjesto_rada_naziv: mjestoRada,
    mjesto_rada_adresa: adresaRada,
  } = racun.racunGlava;

  doc.fontSize(11)
    .font(font)
    .text(zaglavlje, partnerStyle);

  doc.fontSize(11)
    .font(fontBold)
    .text(`Račun: ${brojRacuna}-P1-1`);

  doc.fontSize(11)
    .font(font)
    .text(`OIB: ${partner.oib}`, 300, 255)
    .text(`Datum: ${dateformat(datum, 'dd.mm.yyyy.')}`, 50, 270)
    .text(`Mjesto rada: ${mjestoRada}`, 300, 270)
    .text(status, 50, 285)
    .text(`Adresa rada: ${adresaRada}`, 300, 285) ;

  return doc;
}

module.exports = getRacunReport;
