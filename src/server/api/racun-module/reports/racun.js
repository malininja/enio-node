const Pdfkit = require('pdfkit');
const dateformat = require('dateformat');
const status = require('../../../enums/status');

function writeRow(doc, fontSize, font, y, tableDefinition, items) {
  const getXForRight = (text, x) => {
    const width = doc.fontSize(fontSize).font(font).widthOfString(text.toString());
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
    tarifa_stopa: tarifaStopa,
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
      { x: 280, align: 'right' },
      { x: 340, align: 'right' },
      { x: 400, align: 'right' },
      { x: 500, align: 'right' },
    ],
  };

  // STAVKE
  writeRow(doc, 11, font, 315, tableDefinition, ['Artikl', 'JM', 'Količina', 'Tarifa (%)', 'Netto (kn)']);

  racun.racunStavkaCollection.forEach((stavka, i) => {
    const { artikl_id: artikl, kolicina, cijena } = stavka;
    writeRow(doc, 11, font, 330 + i * 15, tableDefinition, [artikl, 'lol', kolicina, tarifaStopa, kolicina * cijena]);
  });

  const footerY = 330 + racun.racunStavkaCollection.length * 15;
  writeRow(doc, 11, font, footerY, tableDefinition, ['', '', '', 'Netto vrijednost:', 666]);
  writeRow(doc, 11, font, footerY + 15, tableDefinition, ['', '', '', 'Tarifa -ime tarife- (X.XX%):', 666]);
  writeRow(doc, 11, font, footerY + 30, tableDefinition, ['', '', '', 'PDV XX.XX%::', 666]);
  writeRow(doc, 11, fontBold, footerY + 45, tableDefinition, ['', '', '', 'Ukupno za platiti:', 666]);

  doc.fontSize(11)
    .font(fontBold)
    .text('OBRAČUN PREMA NAPLAĆENIM NAKNADAMA', 50, footerY + 75);

  doc.fontSize(11)
    .font(font)
    .text('Kod plaćanja računa upišite poziv na broj: (99) XXXX-XXXX', 50, footerY + 105)
    .text('Način plaćanja: transakcijski račun')
    .text('Odgovorna osoba za izdavanje računa: XXXXXX XXXXXX')
    .text('Datum: XX.XX.XXXX.  Vrijeme: XX:XX')
    .text('Račun je izrađen na računalu i pravovaljan je bez pečata i potpisa.')
    .text('   ')
    .text('Registriran u Trgovačkom sudu u Zagrebu.')
    .text('MBS: XXXXXXXXXXX')
    .text('Temeljni kapital 20 000 kn je plaćen u cjelosti.')
    .text('Član uprave: XXXXX XXXXX');

  return doc;
}

module.exports = getRacunReport;
/**
 *
artikl_id:1
cijena:'66.66'
id:1
iznos:'166.65'
kolicina:'2.00'
pdv_iznos:'33.33'
pdv_posto:'25.00'
pozicija:0
racun_glava_id:1
tarifa_iznos:'0.00'
timestamp:'1604328389772'
 */
