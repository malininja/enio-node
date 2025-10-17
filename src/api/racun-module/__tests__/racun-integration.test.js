const request = require('supertest');
const express = require('express');
const bodyParser = require('body-parser');
const racunRouter = require('../index');
const knex = require('../../../configs/knex');
const {
  cleanupTestData,
  setupTestData,
  createTestRacunGlava,
  createTestRacunStavka,
} = require('./test-helpers');

// Create test app
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/api/racun', racunRouter);

// Test data
let testData;

beforeAll(async () => {
  // Setup test database with required data
  testData = await setupTestData();
});

afterAll(async () => {
  // Clean up and close database connection
  await cleanupTestData();
  await knex.destroy();
});

describe('GET /api/racun/:id', () => {
  let racunId;
  let stavkaId;

  beforeEach(async () => {
    // Create a test racun with stavka
    racunId = await createTestRacunGlava(
      testData.firmaId,
      testData.partnerId,
      testData.tarifaId,
      testData.statusId,
    );
    stavkaId = await createTestRacunStavka(racunId, testData.artiklId);
  });

  afterEach(async () => {
    // Clean up after each test
    await knex('racun_stavka').where({ id: stavkaId }).del();
    await knex('racun_glava').where({ id: racunId }).del();
  });

  test('should return racun with glava and stavke when valid id provided', async () => {
    const response = await request(app)
      .get(`/api/racun/${racunId}`)
      .expect(200);

    expect(response.body).toHaveProperty('racunGlava');
    expect(response.body).toHaveProperty('racunStavkaCollection');
    expect(response.body.racunGlava.id).toBe(racunId);
    expect(response.body.racunGlava.firma_id).toBe(testData.firmaId);
    expect(response.body.racunStavkaCollection).toBeInstanceOf(Array);
    expect(response.body.racunStavkaCollection.length).toBe(1);
    expect(response.body.racunStavkaCollection[0].id).toBe(stavkaId);
  });

  test('should return 404 when racun does not exist', async () => {
    const nonExistentId = 999999;
    const response = await request(app)
      .get(`/api/racun/${nonExistentId}`)
      .expect(404);

    expect(response.body).toEqual({});
  });

  test('should include all racun glava fields', async () => {
    const response = await request(app)
      .get(`/api/racun/${racunId}`)
      .expect(200);

    const { racunGlava } = response.body;
    expect(racunGlava).toHaveProperty('id');
    expect(racunGlava).toHaveProperty('datum');
    expect(racunGlava).toHaveProperty('godina');
    expect(racunGlava).toHaveProperty('partner_id');
    expect(racunGlava).toHaveProperty('tarifa_id');
    expect(racunGlava).toHaveProperty('tarifa_stopa');
    expect(racunGlava).toHaveProperty('broj_racuna');
    expect(racunGlava).toHaveProperty('firma_id');
  });

  test('should include all racun stavka fields', async () => {
    const response = await request(app)
      .get(`/api/racun/${racunId}`)
      .expect(200);

    const stavka = response.body.racunStavkaCollection[0];
    expect(stavka).toHaveProperty('id');
    expect(stavka).toHaveProperty('racun_glava_id');
    expect(stavka).toHaveProperty('artikl_id');
    expect(stavka).toHaveProperty('kolicina');
    expect(stavka).toHaveProperty('cijena');
    expect(stavka).toHaveProperty('pdv_posto');
    expect(stavka).toHaveProperty('pdv_iznos');
    expect(stavka).toHaveProperty('tarifa_iznos');
    expect(stavka).toHaveProperty('iznos');
  });
});

describe('GET /api/racun', () => {
  let racunId1;
  let racunId2;

  beforeEach(async () => {
    // Create two test racuni
    racunId1 = await createTestRacunGlava(
      testData.firmaId,
      testData.partnerId,
      testData.tarifaId,
      testData.statusId,
    );
    racunId2 = await createTestRacunGlava(
      testData.firmaId,
      testData.partnerId,
      testData.tarifaId,
      testData.statusId,
    );
  });

  afterEach(async () => {
    await knex('racun_glava').whereIn('id', [racunId1, racunId2]).del();
  });

  test('should return list of racuni with pagination', async () => {
    const response = await request(app)
      .get('/api/racun')
      .query({ page: 1, rows: 10 })
      .expect(200);

    expect(response.body).toHaveProperty('rows');
    expect(response.body).toHaveProperty('total');
    expect(response.body).toHaveProperty('records');
    expect(response.body.rows).toBeInstanceOf(Array);
    expect(response.body.rows.length).toBeGreaterThanOrEqual(2);
  });

  test('should include partner_naziv in response', async () => {
    const response = await request(app)
      .get('/api/racun')
      .query({ page: 1, rows: 10 })
      .expect(200);

    const firstRacun = response.body.rows[0];
    expect(firstRacun).toHaveProperty('partner_naziv');
  });

  test('should filter by firma_id', async () => {
    const response = await request(app)
      .get('/api/racun')
      .query({ page: 1, rows: 10 })
      .expect(200);

    // All returned racuni should belong to test firma
    response.body.rows.forEach((racun) => {
      expect(racun.firma_id).toBe(testData.firmaId);
    });
  });

  test('should support sorting', async () => {
    const response = await request(app)
      .get('/api/racun')
      .query({ page: 1, rows: 10, sidx: 'broj_racuna', sord: 'asc' })
      .expect(200);

    expect(response.body.rows).toBeInstanceOf(Array);
  });

  test('should support filtering by broj_racuna', async () => {
    const response = await request(app)
      .get('/api/racun')
      .query({
        page: 1,
        rows: 10,
        broj_racuna: '1',
        searchField: 'broj_racuna',
        searchString: '1',
        searchOper: 'eq',
      })
      .expect(200);

    expect(response.body.rows).toBeInstanceOf(Array);
  });
});

describe('POST /api/racun', () => {
  afterEach(async () => {
    // Clean up any created racuni
    await knex('racun_stavka').where({ artikl_id: testData.artiklId }).del();
    await knex('racun_glava').where({ firma_id: testData.firmaId }).del();
  });

  test('should create new racun with stavke', async () => {
    const newRacun = {
      glava: {
        datum: '17.10.2025',
        mjesto_rada_adresa: 'Nova Adresa',
        mjesto_rada_naziv: 'Novo Mjesto',
        partner_id: testData.partnerId,
        tarifa_id: testData.tarifaId,
        valuta: 30,
        status_id: testData.statusId,
        vrijeme: '14:30',
        je_pdv_racun: true,
        zaglavlje: 'Test novi račun',
        firma_id: testData.firmaId,
      },
      stavke: [
        {
          artikl_id: testData.artiklId,
          kolicina: '3,00',
          cijena: '150,00',
          pdv_posto: '25,00',
          pozicija: 1,
        },
      ],
    };

    const response = await request(app)
      .post('/api/racun')
      .send(newRacun)
      .expect(200);

    // Response should be the new racun ID
    expect(response.body).toBeDefined();
    expect(typeof response.body).toBe('number');

    // Verify racun was created in database
    const createdRacun = await knex('racun_glava')
      .where({ id: response.body })
      .first();
    expect(createdRacun).toBeDefined();
    expect(createdRacun.partner_id).toBe(testData.partnerId);

    // Verify stavke were created
    const stavke = await knex('racun_stavka')
      .where({ racun_glava_id: response.body });
    expect(stavke.length).toBe(1);
    expect(Number(stavke[0].kolicina)).toBe(3);
  });

  test('should update existing racun', async () => {
    // Create initial racun
    const racunId = await createTestRacunGlava(
      testData.firmaId,
      testData.partnerId,
      testData.tarifaId,
      testData.statusId,
    );
    const stavkaId = await createTestRacunStavka(racunId, testData.artiklId);

    const updatedRacun = {
      glava: {
        id: racunId,
        datum: '17.10.2025',
        mjesto_rada_adresa: 'Updated Adresa',
        mjesto_rada_naziv: 'Updated Mjesto',
        partner_id: testData.partnerId,
        tarifa_id: testData.tarifaId,
        valuta: 30,
        status_id: testData.statusId,
        vrijeme: '15:00',
        je_pdv_racun: true,
        zaglavlje: 'Updated zaglavlje',
        firma_id: testData.firmaId,
      },
      stavke: [
        {
          id: stavkaId,
          artikl_id: testData.artiklId,
          kolicina: '5,00',
          cijena: '200,00',
          pdv_posto: '25,00',
          pozicija: 1,
          racun_glava_id: racunId,
        },
      ],
    };

    const response = await request(app)
      .post('/api/racun')
      .send(updatedRacun)
      .expect(200);

    expect(response.body).toBe(racunId);

    // Verify racun was updated
    const updatedGlava = await knex('racun_glava')
      .where({ id: racunId })
      .first();
    expect(updatedGlava.mjesto_rada_adresa).toBe('Updated Adresa');

    // Verify stavka was updated
    const updatedStavka = await knex('racun_stavka')
      .where({ id: stavkaId })
      .first();
    expect(Number(updatedStavka.kolicina)).toBe(5);
  });

  test('should add new stavke when updating racun', async () => {
    // Create initial racun with one stavka
    const racunId = await createTestRacunGlava(
      testData.firmaId,
      testData.partnerId,
      testData.tarifaId,
      testData.statusId,
    );
    const stavkaId = await createTestRacunStavka(racunId, testData.artiklId);

    const updatedRacun = {
      glava: {
        id: racunId,
        datum: '17.10.2025',
        mjesto_rada_adresa: 'Test Adresa',
        mjesto_rada_naziv: 'Test Mjesto',
        partner_id: testData.partnerId,
        tarifa_id: testData.tarifaId,
        valuta: 30,
        status_id: testData.statusId,
        vrijeme: '15:00',
        je_pdv_racun: true,
        zaglavlje: 'Test',
        firma_id: testData.firmaId,
      },
      stavke: [
        {
          id: stavkaId,
          artikl_id: testData.artiklId,
          kolicina: '2.00',
          cijena: '100.00',
          pdv_posto: '25.00',
          pozicija: 1,
          racun_glava_id: racunId,
        },
        {
          // New stavka without id
          artikl_id: testData.artiklId,
          kolicina: '3,00',
          cijena: '150,00',
          pdv_posto: '25,00',
          pozicija: 2,
        },
      ],
    };

    await request(app)
      .post('/api/racun')
      .send(updatedRacun)
      .expect(200);

    // Verify two stavke exist
    const stavke = await knex('racun_stavka')
      .where({ racun_glava_id: racunId });
    expect(stavke.length).toBe(2);
  });

  test('should remove deleted stavke when updating racun', async () => {
    // Create racun with two stavke
    const racunId = await createTestRacunGlava(
      testData.firmaId,
      testData.partnerId,
      testData.tarifaId,
      testData.statusId,
    );
    const stavkaId1 = await createTestRacunStavka(racunId, testData.artiklId);
    const stavkaId2 = await knex('racun_stavka').insert({
      racun_glava_id: racunId,
      artikl_id: testData.artiklId,
      kolicina: 3.00,
      cijena: 150.00,
      pdv_posto: 25.00,
      pdv_iznos: 75.00,
      tarifa_iznos: 30.00,
      iznos: 405.00,
      pozicija: 2,
      timestamp: Date.now().toString(),
    }).returning('id').then((ids) => ids[0]);

    // Update with only first stavka
    const updatedRacun = {
      glava: {
        id: racunId,
        datum: '17.10.2025',
        mjesto_rada_adresa: 'Test Adresa',
        mjesto_rada_naziv: 'Test Mjesto',
        partner_id: testData.partnerId,
        tarifa_id: testData.tarifaId,
        valuta: 30,
        status_id: testData.statusId,
        vrijeme: '15:00',
        je_pdv_racun: true,
        zaglavlje: 'Test',
        firma_id: testData.firmaId,
      },
      stavke: [
        {
          id: stavkaId1,
          artikl_id: testData.artiklId,
          kolicina: '2.00',
          cijena: '100.00',
          pdv_posto: '25.00',
          pozicija: 1,
          racun_glava_id: racunId,
        },
      ],
    };

    await request(app)
      .post('/api/racun')
      .send(updatedRacun)
      .expect(200);

    // Verify only one stavka remains
    const stavke = await knex('racun_stavka')
      .where({ racun_glava_id: racunId });
    expect(stavke.length).toBe(1);
    expect(stavke[0].id).toBe(stavkaId1);

    // Verify second stavka was deleted
    const deletedStavka = await knex('racun_stavka')
      .where({ id: stavkaId2 })
      .first();
    expect(deletedStavka).toBeUndefined();
  });

  test('should reject racun with datum not in aktivna godina', async () => {
    const invalidRacun = {
      glava: {
        datum: '17.10.2020', // Wrong year
        mjesto_rada_adresa: 'Test',
        mjesto_rada_naziv: 'Test',
        partner_id: testData.partnerId,
        tarifa_id: testData.tarifaId,
        valuta: 30,
        status_id: testData.statusId,
        vrijeme: '14:30',
        je_pdv_racun: true,
        zaglavlje: 'Test',
        firma_id: testData.firmaId,
      },
      stavke: [
        {
          artikl_id: testData.artiklId,
          kolicina: '1,00',
          cijena: '100,00',
          pdv_posto: '25,00',
          pozicija: 1,
        },
      ],
    };

    const response = await request(app)
      .post('/api/racun')
      .send(invalidRacun)
      .expect(500);

    // Should have error in response
    expect(response.body).toBeDefined();
  });

  test('should calculate iznosi correctly', async () => {
    const newRacun = {
      glava: {
        datum: '17.10.2025',
        mjesto_rada_adresa: 'Test',
        mjesto_rada_naziv: 'Test',
        partner_id: testData.partnerId,
        tarifa_id: testData.tarifaId,
        valuta: 30,
        status_id: testData.statusId,
        vrijeme: '14:30',
        je_pdv_racun: true,
        zaglavlje: 'Test',
        firma_id: testData.firmaId,
      },
      stavke: [
        {
          artikl_id: testData.artiklId,
          kolicina: '2,00',
          cijena: '100,00',
          pdv_posto: '25,00',
          pozicija: 1,
        },
      ],
    };

    const response = await request(app)
      .post('/api/racun')
      .send(newRacun)
      .expect(200);

    const racunId = response.body;
    const stavka = await knex('racun_stavka')
      .where({ racun_glava_id: racunId })
      .first();

    // kolicina * cijena = 2 * 100 = 200
    // tarifa_iznos = 200 * 10 / 100 = 20
    // pdv_iznos = (200 + 20) * 25 / 100 = 55
    // iznos = 200 + 20 + 55 = 275

    expect(Number(stavka.tarifa_iznos)).toBeCloseTo(20, 2);
    expect(Number(stavka.pdv_iznos)).toBeCloseTo(55, 2);
    expect(Number(stavka.iznos)).toBeCloseTo(275, 2);
  });

  test('should assign broj_racuna automatically for new racun', async () => {
    const newRacun = {
      glava: {
        datum: '17.10.2025',
        mjesto_rada_adresa: 'Test',
        mjesto_rada_naziv: 'Test',
        partner_id: testData.partnerId,
        tarifa_id: testData.tarifaId,
        valuta: 30,
        status_id: testData.statusId,
        vrijeme: '14:30',
        je_pdv_racun: true,
        zaglavlje: 'Test',
        firma_id: testData.firmaId,
      },
      stavke: [
        {
          artikl_id: testData.artiklId,
          kolicina: '1,00',
          cijena: '100,00',
          pdv_posto: '25,00',
          pozicija: 1,
        },
      ],
    };

    const response = await request(app)
      .post('/api/racun')
      .send(newRacun)
      .expect(200);

    const racunId = response.body;
    const glava = await knex('racun_glava')
      .where({ id: racunId })
      .first();

    expect(glava.broj_racuna).toBeDefined();
    expect(glava.broj_racuna).toBeGreaterThan(0);
  });
});
