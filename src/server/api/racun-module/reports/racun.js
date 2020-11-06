const Pdfkit = require('pdfkit');
const dateformat = require('dateformat');
const status = require('../../../enums/status');

function writeRow(doc, fontSize, font, y, tableDefinition, items) {
  const getXForRight = (text, x) => {
    const width = doc.fontSize(fontSize).font(font).widthOfString(text);
    return x - width;
  };

  items.forEach((item, i) => {
    const columnDefinition = tableDefinition.columns[i];
    let x = tableDefinition.x + columnDefinition.x;
    if (columnDefinition.align === 'right') {
      x = getXForRight(item, x);
    }

    doc.fontSize(fontSize)
      .font(font)
      .text(item, x, y);
  });
}

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
    },
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
    status_id: statusId,
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
    .text(status.find((s) => s.id === statusId).name, 50, 285)
    .text(`Adresa rada: ${adresaRada}`, 300, 285);

  const tableDefinition = {
    x: 50,
    rowHeight: 15,
    columns: [
      { x: 0, align: 'left' },
      { x: 280, align: 'left' },
      { x: 340, align: 'right' },
      { x: 350, align: 'left' },
      { x: 400, align: 'left' },
    ],
  };

  // STAVKE
  doc.fontSize(11)
    .font(font)
    .text('Artikl', 50, 315)
    .text('JM', 330, 315)
    .text('Količina', 360, 315)
    .text('Tarifa (%)', 400, 315)
    .text('Netto (kn)', 450, 315);

  writeRow(doc, 11, font, 340, tableDefinition, ['Artikl', 'JM', 'Količina', 'Tarifa (%)', 'Netto (kn)']);
  writeRow(doc, 11, font, 355, tableDefinition, ['Artikl', 'JM', 'Kol', 'Tarifa (%)', 'Netto (kn)']);
  writeRow(doc, 11, font, 370, tableDefinition, ['Artikl', 'JM', 'Količinaaaaaaa', 'Tarifa (%)', 'Netto (kn)']);
  return doc;
}

module.exports = getRacunReport;
