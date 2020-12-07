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
      .text(item, x, y, { width: 300 });
  });
}

function getRacunReport(firma, racun, partner, tarifa, artikli) {
  const { racunGlava: glava, racunStavkaCollection: stavke } = racun;

  const {
    naziv,
    adresa,
    mjesto,
    oib,
    pdv_id: pdvId,
    zr,
    odgovorna_osoba: odgovornaOsoba,
    mbs,
    clan_uprave: clanUprave,
  } = firma;

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
    vrijeme,
    status_id: statusId,
    zaglavlje,
    broj_racuna: brojRacuna,
    mjesto_rada_naziv: mjestoRada,
    mjesto_rada_adresa: adresaRada,
    tarifa_stopa: tarifaStopa,
    godina,
  } = glava;

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
      { x: 310, align: 'right' },
      { x: 370, align: 'right' },
      { x: 430, align: 'right' },
      { x: 500, align: 'right' },
    ],
  };

  // STAVKE
  writeRow(doc, 11, font, 315, tableDefinition, ['Artikl', 'JM', 'Količina', 'Tarifa (%)', 'Netto (kn)']);
  doc.moveTo(50, 330).lineTo(550, 330).stroke();
  let nettoTotal = 0;
  const tarifaTotal = stavke.reduce((acc, cur) => acc + cur.tarifa_iznos, 0);
  const ukupno = stavke.reduce((acc, cur) => acc + cur.iznos, 0);

  stavke.forEach((stavka, i) => {
    const {
      artikl_id: artiklId,
      kolicina,
      cijena,
    } = stavka;

    const artikl = artikli.find((a) => a.id === artiklId);

    const netto = kolicina * cijena;
    nettoTotal += netto;

    const rowItems = [artikl.naziv, artikl.jm, kolicina, tarifaStopa, netto.toFixed(2)];
    writeRow(doc, 11, font, 330 + i * 30, tableDefinition, rowItems);
  });

  doc.moveTo(50, 330 + stavke.length * 30).lineTo(550, 330 + stavke.length * 30).stroke();

  const pdvs = stavke.reduce((acc, cur) => {
    const { pdv_posto: pdvPosto, pdv_iznos: pdvIznos } = cur;
    const pdv = pdvPosto.toFixed(2);
    if (!acc[pdv]) acc[pdv] = 0;
    acc[pdv] += pdvIznos;
    return acc;
  }, {});

  const footerY = 330 + stavke.length * 30;
  writeRow(doc, 11, font, footerY, tableDefinition, ['', '', '', 'Netto vrijednost:', nettoTotal.toFixed(2)]);
  writeRow(doc, 11, font, footerY + 15, tableDefinition, ['', '', '', `Tarifa ${tarifa.naziv} (${tarifaStopa}%):`, tarifaTotal.toFixed(2)]);

  Object.keys(pdvs).forEach((k) => {
    writeRow(doc, 11, font, footerY + 30, tableDefinition, ['', '', '', `PDV ${k}%:`, pdvs[k].toFixed(2)]);
  });

  writeRow(doc, 11, fontBold, footerY + 45, tableDefinition, ['', '', '', 'Ukupno za platiti:', ukupno.toFixed(2)]);

  let legalY = footerY + 75;
  if (stavke.length > 4) {
    doc.addPage();
    legalY = pageConfig.margins.top;
  }

  doc.fontSize(11)
    .font(fontBold)
    .text('OBRAČUN PREMA NAPLAĆENIM NAKNADAMA', 50, legalY);

  doc.fontSize(11)
    .font(font)
    .text(`Kod plaćanja računa upišite poziv na broj: (99) ${godina}-${brojRacuna}`, 50, legalY + 25)
    .text('Način plaćanja: transakcijski račun')
    .text(`Odgovorna osoba za izdavanje računa: ${odgovornaOsoba}`)
    .text(`Datum: ${dateformat(datum, 'dd.mm.yyyy.')}  Vrijeme: ${vrijeme}`)
    .text('Račun je izrađen na računalu i pravovaljan je bez pečata i potpisa.')
    .text('   ')
    .text('Registriran u Trgovačkom sudu u Zagrebu.')
    .text(`MBS: ${mbs}`)
    .text('Temeljni kapital 20 000 kn je plaćen u cjelosti.')
    .text(`Član uprave: ${clanUprave}`);

  return doc;
}

module.exports = getRacunReport;
