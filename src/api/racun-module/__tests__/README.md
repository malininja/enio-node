# Racun Module Integration Tests

## Overview
This directory contains integration tests for the racun-module API endpoints.

## Setup

### 1. Install Dependencies
```bash
yarn install
# or
npm install
```

### 2. Configure Test Database
The tests use the database configured in `knexfile.js`.

**IMPORTANT**: Tests now **only delete data they create**, not the entire database. This means:
- ✅ Existing data is preserved
- ✅ Tests can run against development database safely
- ✅ Test data is properly isolated and cleaned up

However, it's still recommended to use a separate test database for complete isolation:

```javascript
// knexfile.js - optional test configuration
module.exports = {
  client: 'pg',
  connection: process.env.NODE_ENV === 'test' 
    ? {
        host: '127.0.0.1',
        user: 'postgres',
        password: '1234',
        database: 'enio_node_test', // Separate test database
      }
    : {
        host: '127.0.0.1',
        user: 'postgres',
        password: '1234',
        database: 'enio_node_v2',
      }
};
```

### 3. Run Database Migrations/Seeds
```bash
yarn seed
```

## Running Tests

### Run All Tests
```bash
yarn test
```

### Run Tests in Watch Mode
```bash
yarn test:watch
```

### Run with Coverage
```bash
yarn test:coverage
```

### Run Specific Test File
```bash
yarn test racun-integration.test.js
```

## Test Files

### `racun-integration.test.js`
Main integration test file covering:
- **GET /api/racun/:id** - Retrieve single racun with stavke
- **GET /api/racun** - List all racuni with pagination and filtering
- **POST /api/racun** - Create new racun and update existing racun

### `test-helpers.js`
Helper functions for:
- Setting up test data (firma, partner, tarifa, artikl, status)
- Creating test racuni and stavke
- Cleaning up test data after tests

## Test Coverage

The integration tests cover:
- ✅ CRUD operations (Create, Read, Update)
- ✅ Pagination and filtering
- ✅ Transaction handling
- ✅ Business logic (calculations for tarifa_iznos, pdv_iznos, iznos)
- ✅ Validation (datum in aktivna_godina)
- ✅ Error cases (404, invalid data)
- ✅ Complex operations (adding/removing/updating stavke)
- ✅ Automatic broj_racuna assignment

## Writing New Tests

### 1. Follow the Existing Pattern
```javascript
describe('New Feature', () => {
  test('should do something', async () => {
    const response = await request(app)
      .get('/api/racun')
      .expect(200);
    
    expect(response.body).toBeDefined();
  });
});
```

### 2. Use Test Helpers
```javascript
const { setupTestData, cleanupTestData } = require('./test-helpers');

beforeAll(async () => {
  testData = await setupTestData();
});

afterAll(async () => {
  await cleanupTestData();
  await knex.destroy(); // Important!
});
```

### 3. Clean Up After Tests
The test framework automatically tracks and cleans up only the data it creates:
- Test helpers track all created IDs (partners, artikls, racuni, etc.)
- Cleanup only deletes records created during tests
- Existing data in the database is preserved
- If firma ID=1 existed before tests, it won't be deleted

## Troubleshooting

### Jest Doesn't Exit / Open Handles
The tests use `--forceExit` to ensure Jest exits after all tests complete. This is normal for database tests due to connection pooling.

To minimize open handles:
1. We configure the connection pool with `min: 0, max: 7` in `src/configs/knex.js`
2. We call `await knex.destroy()` in `afterAll()` to close connections
3. Jest's `--forceExit` flag handles any remaining async operations

If you see "Force exiting Jest" message, this is expected and not an error.

### Connection Issues
- Verify PostgreSQL is running
- Check database credentials in `knexfile.js`
- Ensure test database exists

### Foreign Key Violations
- Ensure test data is created in correct order (firma → partner → tarifa → artikl → status → racun)
- Use `test-helpers.js` functions which handle dependencies

## Best Practices

1. **Test Independence**: Each test should be independent
2. **Descriptive Names**: Use clear test descriptions
3. **Setup/Teardown**: Use beforeEach/afterEach for test isolation
4. **Verify in Database**: For mutations, verify changes in database
5. **Test Edge Cases**: Include error scenarios and boundary conditions

## Example Test Flow

```javascript
// 1. Setup test data
beforeAll(async () => {
  testData = await setupTestData();
});

// 2. Create test-specific data
beforeEach(async () => {
  racunId = await createTestRacunGlava(...);
});

// 3. Run test
test('should work correctly', async () => {
  const response = await request(app)
    .get(`/api/racun/${racunId}`)
    .expect(200);
  
  expect(response.body).toBeDefined();
});

// 4. Clean up test-specific data
afterEach(async () => {
  await knex('racun_glava').where({ id: racunId }).del();
});

// 5. Final cleanup
afterAll(async () => {
  await cleanupTestData();
  await knex.destroy();
});
```
