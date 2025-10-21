const PDFDocument = require('pdfkit');
const path = require('path');

/**
 * Generates a PDF invoice based on the provided invoice data
 * @param {Object} racunData - Complete invoice data including glava, stavke, firma, and partner
 * @returns {PDFDocument} - PDF document stream
 */
function generateInvoicePDF(racunData) {
  const { racunGlava, racunStavkaCollection, firma, partner } = racunData;

  // Create a new PDF document
  const doc = new PDFDocument({
    size: 'A4',
    margin: 50,
    info: {
      Title: `Račun ${racunGlava.broj_racuna}/${racunGlava.godina}`,
      Author: firma.naziv,
    },
  });

  // Helper function to format currency
  const formatCurrency = (amount) => {
    return parseFloat(amount).toFixed(2).replace('.', ',') + ' kn';
  };

  // Helper function to format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
  };

  // Register fonts with Croatian character support
  const arialPath = path.join(__dirname, '../../node_modules/@canvas-fonts/arial/Arial.ttf');
  
  doc.registerFont('Arial', arialPath);

  // Set default font to Arial
  doc.font('Arial');

  // Header - Company Information
  doc.fontSize(20).text('RAČUN', { align: 'center' });
  doc.moveDown(0.5);
  doc.fontSize(10).text(`Broj: ${racunGlava.broj_racuna}/${racunGlava.godina}`, { align: 'center' });
  doc.moveDown(1);

  // Company details (left side)
  const leftColumn = 50;
  const rightColumn = 320;
  let currentY = doc.y;

  doc.fontSize(12).text('Izdavatelj:', leftColumn, currentY);
  doc.fontSize(10);
  doc.text(firma.naziv, leftColumn, doc.y + 5);
  if (firma.adresa) doc.text(firma.adresa, leftColumn, doc.y);
  if (firma.mjesto) doc.text(firma.mjesto, leftColumn, doc.y);
  doc.text(`OIB: ${firma.oib}`, leftColumn, doc.y);
  if (firma.zr) doc.text(`Žiro račun: ${firma.zr}`, leftColumn, doc.y);

  // Partner details (right side)
  doc.fontSize(12).text('Kupac:', rightColumn, currentY);
  doc.fontSize(10);
  doc.text(partner.naziv, rightColumn, currentY + 20);
  if (partner.adresa) doc.text(partner.adresa, rightColumn, doc.y);
  if (partner.mjesto && partner.posta) {
    doc.text(`${partner.posta} ${partner.mjesto}`, rightColumn, doc.y);
  } else if (partner.mjesto) {
    doc.text(partner.mjesto, rightColumn, doc.y);
  }
  if (partner.oib) doc.text(`OIB: ${partner.oib}`, rightColumn, doc.y);

  doc.moveDown(2);

  // Invoice information
  const infoY = doc.y;
  doc.fontSize(10);
  doc.text(`Datum izdavanja: ${formatDate(racunGlava.datum)}`, leftColumn, infoY);
  doc.text(`Valuta: ${racunGlava.valuta} dana`, leftColumn, doc.y + 5);
  
  if (racunGlava.mjesto_rada_naziv || racunGlava.mjesto_rada_adresa) {
    doc.text(`Mjesto rada: ${racunGlava.mjesto_rada_naziv || ''}`, leftColumn, doc.y + 5);
    if (racunGlava.mjesto_rada_adresa) {
      doc.text(`Adresa rada: ${racunGlava.mjesto_rada_adresa}`, leftColumn, doc.y);
    }
  }

  if (racunGlava.zaglavlje) {
    doc.moveDown(0.5);
    doc.fontSize(9).text(racunGlava.zaglavlje, leftColumn, doc.y, { width: 500 });
  }

  doc.moveDown(1.5);

  // Table header
  const tableTop = doc.y;
  const tableHeaders = {
    pozicija: { x: 50, width: 40, label: 'Poz.' },
    naziv: { x: 95, width: 180, label: 'Naziv artikla' },
    kolicina: { x: 280, width: 50, label: 'Količina' },
    cijena: { x: 335, width: 60, label: 'Cijena' },
    pdv: { x: 400, width: 50, label: 'PDV %' },
    iznos: { x: 455, width: 90, label: 'Iznos' },
  };

  // Draw table header
  doc.fontSize(10); // Slightly larger for headers
  Object.keys(tableHeaders).forEach((key) => {
    const header = tableHeaders[key];
    doc.text(header.label, header.x, tableTop, {
      width: header.width,
      align: key === 'naziv' ? 'left' : 'right',
    });
  });

  // Draw line under header
  doc.moveTo(50, tableTop + 15)
     .lineTo(545, tableTop + 15)
     .stroke();

  // Table rows
  let yPosition = tableTop + 20;
  doc.fontSize(9);

  let subtotal = 0;
  let totalTarifa = 0;
  let totalPDV = 0;

  racunStavkaCollection.forEach((stavka, index) => {
    // Check if we need a new page
    if (yPosition > 700) {
      doc.addPage();
      yPosition = 50;
    }

    const iznos = parseFloat(stavka.iznos);
    const tarifaIznos = parseFloat(stavka.tarifa_iznos);
    const pdvIznos = parseFloat(stavka.pdv_iznos);
    const baseAmount = iznos - tarifaIznos - pdvIznos;

    subtotal += baseAmount;
    totalTarifa += tarifaIznos;
    totalPDV += pdvIznos;

    // Position number
    doc.text(stavka.pozicija || index + 1, tableHeaders.pozicija.x, yPosition, {
      width: tableHeaders.pozicija.width,
      align: 'right',
    });

    // Get article name
    let artiklNaziv = 'N/A';
    if (stavka.artikl && stavka.artikl.naziv) {
      artiklNaziv = stavka.artikl.naziv;
    }

    // Article name
    doc.text(artiklNaziv, tableHeaders.naziv.x, yPosition, {
      width: tableHeaders.naziv.width,
      align: 'left',
    });

    // Quantity
    doc.text(parseFloat(stavka.kolicina).toFixed(2).replace('.', ','), tableHeaders.kolicina.x, yPosition, {
      width: tableHeaders.kolicina.width,
      align: 'right',
    });

    // Price
    doc.text(formatCurrency(stavka.cijena), tableHeaders.cijena.x, yPosition, {
      width: tableHeaders.cijena.width,
      align: 'right',
    });

    // PDV percentage
    doc.text(parseFloat(stavka.pdv_posto).toFixed(0) + '%', tableHeaders.pdv.x, yPosition, {
      width: tableHeaders.pdv.width,
      align: 'right',
    });

    // Total amount
    doc.text(formatCurrency(iznos), tableHeaders.iznos.x, yPosition, {
      width: tableHeaders.iznos.width,
      align: 'right',
    });

    yPosition += 20;
  });

  // Draw line before totals
  yPosition += 5;
  doc.moveTo(50, yPosition)
     .lineTo(545, yPosition)
     .stroke();

  yPosition += 10;

  // Totals section
  const totalsX = 400;
  doc.fontSize(10);

  doc.text('Osnovica:', totalsX, yPosition);
  doc.text(formatCurrency(subtotal), 480, yPosition, { width: 65, align: 'right' });
  yPosition += 18;

  if (totalTarifa > 0) {
    doc.text(`Tarifa (${racunGlava.tarifa_stopa}%):`, totalsX, yPosition);
    doc.text(formatCurrency(totalTarifa), 480, yPosition, { width: 65, align: 'right' });
    yPosition += 18;
  }

  doc.text('PDV:', totalsX, yPosition);
  doc.text(formatCurrency(totalPDV), 480, yPosition, { width: 65, align: 'right' });
  yPosition += 18;

  // Grand total
  const grandTotal = subtotal + totalTarifa + totalPDV;
  doc.fontSize(13); // Larger size for emphasis
  doc.text('UKUPNO:', totalsX, yPosition);
  doc.text(formatCurrency(grandTotal), 480, yPosition, { width: 65, align: 'right' });

  // Footer
  doc.fontSize(8);
  const footerY = 750;
  
  if (racunGlava.je_pdv_racun) {
    doc.text('Račun je izdan u sustavu PDV-a', 50, footerY, { align: 'center' });
  }

  doc.text(`Status: ${getStatusName(racunGlava.status_id)}`, 50, footerY + 15, { align: 'center' });

  // End the document
  doc.end();

  return doc;
}

/**
 * Gets the status name from status ID
 * @param {number} statusId - Status ID
 * @returns {string} - Status name
 */
function getStatusName(statusId) {
  const statusMap = {
    1: 'Plaćen',
    2: 'Neplaćen',
    3: 'Storniran',
    4: 'Otpis',
    5: 'Blokada',
  };
  return statusMap[statusId] || 'Nepoznato';
}

module.exports = { generateInvoicePDF };
