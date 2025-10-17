const knex = require('../../../configs/knex');

/**
 * Helper functions for racun-module integration tests
 */

// Track test data IDs for cleanup
const testDataIds = {
  firmaId: null,
  firmaExistedBefore: false, // Track if firma existed before tests
  partnerIds: [],
  tarifaIds: [],
  pdvIds: [],
  artiklIds: [],
  brojacIds: [],
  racunGlavaIds: [],
  racunStavkaIds: [],
};

// Clean up only test data (not entire database!)
async function cleanupTestData() {
  // Delete in order respecting foreign key constraints
  if (testDataIds.racunStavkaIds.length > 0) {
    await knex('racun_stavka').whereIn('id', testDataIds.racunStavkaIds).del();
  }
  if (testDataIds.racunGlavaIds.length > 0) {
    await knex('racun_glava').whereIn('id', testDataIds.racunGlavaIds).del();
  }
  if (testDataIds.artiklIds.length > 0) {
    await knex('artikl').whereIn('id', testDataIds.artiklIds).del();
  }
  if (testDataIds.pdvIds.length > 0) {
    await knex('pdv').whereIn('id', testDataIds.pdvIds).del();
  }
  if (testDataIds.partnerIds.length > 0) {
    await knex('partner').whereIn('id', testDataIds.partnerIds).del();
  }
  if (testDataIds.tarifaIds.length > 0) {
    await knex('tarifa').whereIn('id', testDataIds.tarifaIds).del();
  }
  if (testDataIds.brojacIds.length > 0) {
    await knex('brojac').whereIn('id', testDataIds.brojacIds).del();
  }
  // Only delete firma if we created it (not if it existed before)
  if (testDataIds.firmaId && !testDataIds.firmaExistedBefore) {
    await knex('firma').where('id', testDataIds.firmaId).del();
  }

  // Reset tracking
  testDataIds.firmaId = null;
  testDataIds.firmaExistedBefore = false;
  testDataIds.partnerIds = [];
  testDataIds.tarifaIds = [];
  testDataIds.pdvIds = [];
  testDataIds.artiklIds = [];
  testDataIds.brojacIds = [];
  testDataIds.racunGlavaIds = [];
  testDataIds.racunStavkaIds = [];
}

// Create test firma
async function createTestFirma() {
  // Always use ID 1 since bl.getFirmaId() returns 1
  // Check if firma with id=1 already exists
  const existing = await knex('firma').where({ id: 1 }).first();
  if (existing) {
    testDataIds.firmaId = 1;
    testDataIds.firmaExistedBefore = true;
    return 1;
  }

  const [id] = await knex('firma').insert({
    id: 1,
    aktivna_godina: 2025,
    naziv: 'Test Firma d.o.o.',
    oib: '12345678901',
    adresa: 'Test Adresa 1',
    mjesto: 'Zagreb',
    timestamp: Date.now().toString(),
  }).returning('id');
  testDataIds.firmaId = id;
  testDataIds.firmaExistedBefore = false;
  return id;
}

// Create test partner
async function createTestPartner(firmaId) {
  const [id] = await knex('partner').insert({
    naziv: 'Test Partner',
    oib: '98765432109',
    adresa: 'Partner Adresa 1',
    mjesto: 'Split',
    posta: '21000',
    valuta: 30,
    active: true,
    firma_id: firmaId,
    timestamp: Date.now().toString(),
  }).returning('id');
  testDataIds.partnerIds.push(id);
  return id;
}

// Create test tarifa
async function createTestTarifa(firmaId) {
  const [id] = await knex('tarifa').insert({
    naziv: 'Test Tarifa',
    stopa: 10,
    active: true,
    firma_id: firmaId,
    timestamp: Date.now().toString(),
  }).returning('id');
  testDataIds.tarifaIds.push(id);
  return id;
}

// Create test PDV
async function createTestPdv(firmaId) {
  const [id] = await knex('pdv').insert({
    naziv: 'PDV 25%',
    stopa: 25.00,
    firma_id: firmaId,
    timestamp: Date.now().toString(),
  }).returning('id');
  testDataIds.pdvIds.push(id);
  return id;
}

// Create test artikl
async function createTestArtikl(firmaId, pdvId) {
  const [id] = await knex('artikl').insert({
    naziv: 'Test Artikl',
    jm: 'kom',
    cijena: 100.00,
    pdv_id: pdvId,
    active: true,
    firma_id: firmaId,
    timestamp: Date.now().toString(),
  }).returning('id');
  testDataIds.artiklIds.push(id);
  return id;
}

// Create test brojac
async function createTestBrojac(firmaId) {
  const [id] = await knex('brojac').insert({
    naziv: 'racun',
    godina: 2025,
    slijedeci_broj: 1,
    firma_id: firmaId,
    timestamp: Date.now().toString(),
  }).returning('id');
  testDataIds.brojacIds.push(id);
  return id;
}

// Create test status
async function createTestStatus() {
  const existing = await knex('status').where({ id: 1 }).first();
  if (existing) return 1;

  const [id] = await knex('status').insert({
    id: 1,
    naziv: 'Nacrt',
  }).returning('id');
  return id;
}

// Create test racun glava
async function createTestRacunGlava(firmaId, partnerId, tarifaId, statusId) {
  const [id] = await knex('racun_glava').insert({
    datum: new Date('2025-10-17'),
    godina: 2025,
    mjesto_rada_adresa: 'Test Adresa Rada',
    mjesto_rada_naziv: 'Test Mjesto Rada',
    partner_id: partnerId,
    tarifa_id: tarifaId,
    tarifa_stopa: 10.00,
    valuta: 30,
    status_id: statusId,
    broj_racuna: 1,
    vrijeme: '12:00',
    je_pdv_racun: true,
    zaglavlje: 'Test zaglavlje',
    firma_id: firmaId,
    timestamp: Date.now().toString(),
  }).returning('id');
  testDataIds.racunGlavaIds.push(id);
  return id;
}

// Create test racun stavka
async function createTestRacunStavka(racunGlavaId, artiklId) {
  // Get PDV from artikl
  const artikl = await knex('artikl').where({ id: artiklId }).first();
  const pdv = await knex('pdv').where({ id: artikl.pdv_id }).first();

  const [id] = await knex('racun_stavka').insert({
    racun_glava_id: racunGlavaId,
    artikl_id: artiklId,
    kolicina: 2.00,
    cijena: 100.00,
    pdv_posto: pdv.stopa,
    pdv_iznos: 50.00,
    tarifa_iznos: 20.00,
    iznos: 270.00,
    pozicija: 1,
    timestamp: Date.now().toString(),
  }).returning('id');
  testDataIds.racunStavkaIds.push(id);
  return id;
}

// Setup full test data (firma, partner, tarifa, artikl, status)
async function setupTestData() {
  // Don't cleanup at start - only clean up what we created

  const firmaId = await createTestFirma();
  const partnerId = await createTestPartner(firmaId);
  const tarifaId = await createTestTarifa(firmaId);
  const pdvId = await createTestPdv(firmaId);
  const artiklId = await createTestArtikl(firmaId, pdvId);
  const brojacId = await createTestBrojac(firmaId);
  const statusId = await createTestStatus();

  return { firmaId, partnerId, tarifaId, artiklId, pdvId, brojacId, statusId };
}

module.exports = {
  cleanupTestData,
  setupTestData,
  createTestFirma,
  createTestPartner,
  createTestTarifa,
  createTestPdv,
  createTestArtikl,
  createTestBrojac,
  createTestStatus,
  createTestRacunGlava,
  createTestRacunStavka,
};
