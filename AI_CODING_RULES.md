# AI Code Generation Rules for enio-node Project

## Overview
This document outlines the rules and conventions that AI agents must follow when generating or modifying code for the enio-node project.

---

## 1. Technology Stack

### 1.1 Core Technologies
- **Runtime**: Node.js
- **Framework**: Express.js 4.x
- **Database**: PostgreSQL
- **Query Builder**: Knex.js
- **Template Engine**: EJS
- **Language**: JavaScript (ES6+, ECMAScript 8)

### 1.2 Frontend Technologies
- **Framework**: AngularJS 1.x
- **UI Libraries**: jQuery, jqGrid, Bootstrap
- **Components**: jQuery UI, jQuery Validation

### 1.3 Development Tools
- **Linter**: ESLint with Airbnb base configuration
- **Package Manager**: Yarn (primary), npm (secondary)
- **Process Manager**: nodemon (development)

---

## 2. Project Architecture

### 2.1 Folder Structure
```
src/
├── api/                    # API modules (business logic)
│   ├── [module-name]/     # Feature modules
│   │   ├── index.js       # Router exports
│   │   ├── [module]-controller.js
│   │   └── [module]-repository.js
│   └── index.js           # API router aggregator
├── configs/               # Configuration files
├── utils/                 # Shared utilities
├── views/                 # EJS templates
├── static/                # Static assets
│   ├── content/          # CSS files
│   └── scripts/          # JavaScript files
└── index.js              # Application entry point
```

### 2.2 Module Pattern
Each feature module MUST follow this structure:
1. **index.js**: Exports Express router
2. **[module]-controller.js**: HTTP request/response handling and business logic
3. **[module]-repository.js**: Database operations (CRUD)

### 2.3 Separation of Concerns
- **Controllers**: Handle HTTP layer, validation, business logic orchestration
- **Repositories**: Handle database queries and data access
- **Utils**: Provide reusable helper functions
- **Routers**: Define routes and connect controllers

---

## 3. Code Style and Conventions

### 3.1 ESLint Configuration
- **Base**: Airbnb style guide
- **Scope**: Only `./src/api` directory is linted (see `package.json` lint script)
- **Custom Rules**:
  - `no-param-reassign`: OFF (allow parameter reassignment)
  - `no-mixed-operators`: OFF
  - `object-curly-newline`: Consistent formatting
- **Note**: Files outside `src/api/` (like `src/index.js`) are not checked by ESLint

### 3.2 JavaScript Conventions
- **Module System**: CommonJS (`require`/`module.exports`)
- **Strings**: Single quotes (`'string'`) - per ESLint/Airbnb rules
  - ⚠️ **Important**: ESLint only checks `./src/api` directory (see package.json lint script)
  - Root files like `src/index.js` and `src/home-router.js` use double quotes but aren't linted
  - **All code in `src/api/` MUST use single quotes** to pass linting
  - Recommendation: Use single quotes everywhere for consistency
- **Functions**: Prefer arrow functions for callbacks
- **Async Operations**: Use `async/await` (not callbacks or raw promises)
- **Destructuring**: Use destructuring where appropriate
- **Const/Let**: Prefer `const`, use `let` when reassignment needed, NEVER use `var`

### 3.3 Naming Conventions
- **Files**: kebab-case (`racun-controller.js`)
- **Functions**: camelCase (`getFirmaId()`)
- **Variables**: camelCase (`racunGlava`)
- **Constants**: camelCase or UPPER_SNAKE_CASE for true constants
- **Classes**: PascalCase (if used)
- **Database Tables**: snake_case (`racun_glava`)

### 3.4 Language Considerations
- **Comments and Variable Names**: Croatian language is used throughout the codebase
- **Code Logic**: Follow existing Croatian naming patterns for domain-specific terms
- **English**: Use for technical terms (e.g., `repository`, `controller`, `router`)

---

## 4. Database Patterns

### 4.1 Knex.js Usage
```javascript
// Import knex instance
const knex = require('../../configs/knex');

// Basic query
const results = await knex('table_name').where({ id });

// With transaction
const trx = await knex.transaction();
try {
  await trx('table_name').insert(data);
  await trx.commit();
} catch (error) {
  await trx.rollback();
  throw error;
}
```

### 4.2 Repository Pattern
- **Get Single**: `get(id)` - Returns single record or null
- **Get All**: `getAll(filters)` - Returns array of records
- **Insert**: `insert(trx, data)` - Use transactions
- **Update**: `update(trx, id, data)` - Use transactions
- **Delete**: `remove(trx, id)` - Use transactions

### 4.3 Transaction Handling
- ALWAYS use transactions for multi-step database operations
- ALWAYS commit on success and rollback on error
- Pass transaction object to repository methods

---

## 5. Controller Patterns

### 5.1 Standard Controller Structure
```javascript
async function controllerFunction(req, res, next) {
  try {
    // Business logic here
    res.send(result);
    return next();
  } catch (error) {
    return next(error);
  }
}
```

### 5.2 Request Handling
- Extract data from `req.params`, `req.query`, or `req.body`
- Use destructuring: `const { id } = req.params;`
- Validate input before processing
- Handle errors with try-catch blocks

### 5.3 Response Handling
- **Success**: `res.send(data)` or `res.sendStatus(200)`
- **Not Found**: `res.sendStatus(404)`
- **Error**: Pass to `next(error)` middleware
- ALWAYS call `return next()` after sending response

---

## 6. Router Patterns

### 6.1 Module Router (index.js)
```javascript
const express = require('express');
const controller = require('./module-controller');

const router = new express.Router();

router.get('/', controller.getAll);
router.get('/:id', controller.get);
router.post('/', controller.save);
router.delete('/:id', controller.remove);

module.exports = router;
```

### 6.2 Route Organization
- Use RESTful conventions
- Group related routes in module routers
- Export router using `module.exports`
- Register in parent router (e.g., `src/api/index.js`)

---

## 7. Error Handling

### 7.1 Async Error Handling
```javascript
async function handler(req, res, next) {
  try {
    // Logic
  } catch (error) {
    return next(error);
  }
}
```

### 7.2 Validation Errors
- Throw descriptive Error objects: `throw new Error('Descriptive message')`
- Use Croatian for user-facing error messages
- Validate critical data (dates, IDs, required fields)

---

## 8. Utility Functions

### 8.1 Common Utilities
- **jqGrid**: Pagination and grid helpers
- **knexUtils**: Query builders and helpers
- **typeParser**: Data type parsing (currency, dates)
- **bl**: Business logic helpers

### 8.2 Creating New Utilities
- Place in `src/utils/` directory
- Export functions using `module.exports`
- Document parameters and return values
- Keep functions pure when possible

---

## 9. Frontend Integration

### 9.1 AngularJS Controllers
- Located in `src/static/scripts/Home/`
- Follow existing AngularJS 1.x patterns
- Use dependency injection
- Communicate with backend via `$http` service

### 9.2 Views (EJS Templates)
- Located in `src/views/`
- Use EJS syntax: `<%= variable %>`
- Separate reusable components (header, footer, scripts, styles)
- Include Bootstrap and jQuery UI classes

---

## 10. Testing

### 10.1 Test Location
- Place tests in `__tests__/` folder within module
- Name test files: `[module-name].test.js`

### 10.2 Test Patterns
- (To be defined as testing framework is implemented)

---

## 11. Dependencies

### 11.1 Adding Dependencies
- Use `yarn add [package]` for production dependencies
- Use `yarn add -D [package]` for dev dependencies
- Update package.json and yarn.lock

### 11.2 Version Pinning
- Follow existing versioning strategy (caret ranges)
- Test compatibility before updating major versions

---

## 12. Environment and Configuration

### 12.1 Configuration Files
- **knexfile.js**: Database configuration
- **src/configs/knex.js**: Knex instance setup
- Environment variables: Use `process.env.VARIABLE_NAME`

### 12.2 Port and Server
- Default port: 3000
- Allow override with `process.env.PORT`

---

## 13. Common Patterns

### 13.1 Pagination (jqGrid)
```javascript
const { pageSize, offset } = jqGrid.getPagingData(query);
const countPromise = knexUtils.getCount(knex, 'table', builder);
const dataPromise = knexUtils.getData(knex, query, 'table', builder, pageSize, offset);
const [count, data] = await Promise.all([countPromise, dataPromise]);
res.send(jqGrid.getResponse(data, count, query));
```

### 13.2 Where Clause Builder
```javascript
const fieldTypes = { field_name: 'numeric' };
const filters = [{ field: 'table.field', value: someValue }];
const builder = knexUtils.whereBuilder(filters, query, fieldTypes);
```

### 13.3 Timestamp Pattern
```javascript
data.timestamp = (new Date()).getTime();
```

---

## 14. Code Quality Checklist

Before committing code, ensure:
- [ ] ESLint passes without errors (`yarn lint`)
- [ ] Code follows existing patterns
- [ ] Transactions are properly handled (commit/rollback)
- [ ] Error handling is implemented
- [ ] Variable names follow Croatian convention for domain terms
- [ ] Functions are async/await (not callbacks)
- [ ] **Single quotes used for strings** (ESLint requirement)
- [ ] CommonJS modules (require/module.exports)
- [ ] Repository pattern followed
- [ ] Controllers call `return next()` after responses

---

## 15. Don'ts (Anti-Patterns)

### 15.1 Code Patterns to Avoid
- ❌ Using `var` keyword
- ❌ Using callbacks instead of async/await
- ❌ Direct database queries in controllers
- ❌ Not using transactions for multi-step operations
- ❌ Forgetting to rollback transactions on error
- ❌ Using double quotes for strings (violates ESLint/Airbnb rules)
- ❌ Not calling `next()` in Express middleware
- ❌ Importing ES6 modules (`import/export`)
- ❌ Creating files outside established structure
- ❌ Mixing English and Croatian for domain terms

### 15.2 Architecture Violations
- ❌ Business logic in repositories
- ❌ Database queries in routes
- ❌ Tight coupling between modules
- ❌ Not following module structure pattern

---

## 16. AI Agent Guidelines

### 16.1 When Adding New Features
1. Create new module folder in `src/api/[module-name]/`
2. Create `index.js`, `[module]-controller.js`, `[module]-repository.js`
3. **Use single quotes** (code in `src/api/` is linted)
4. Follow existing patterns from similar modules
5. Register router in `src/api/index.js`
6. Add necessary views in `src/views/`
7. Add frontend controller in `src/static/scripts/Home/` if needed

### 16.2 When Modifying Existing Code
1. Read existing code in the module first
2. Maintain consistency with existing patterns
3. Don't break transaction flows
4. Update related files (controller, repository, view)
5. Test changes with similar existing functionality

### 16.3 Code Generation Priorities
1. **Correctness**: Code must work and handle errors
2. **Consistency**: Match existing code style and patterns
3. **Maintainability**: Follow established architecture
4. **Performance**: Use Promise.all for parallel operations

---

## 17. Quick Reference

### 17.1 File Templates

**Controller Template:**
```javascript
const repository = require('./module-repository');

async function get(req, res, next) {
  try {
    const { id } = req.params;
    const result = await repository.get(id);
    if (!result) res.sendStatus(404);
    else res.send(result);
    return next();
  } catch (error) {
    return next(error);
  }
}

module.exports = { get };
```

**Repository Template:**
```javascript
const knex = require('../../configs/knex');

async function get(id) {
  const results = await knex('table_name').where({ id });
  return results[0] || null;
}

module.exports = { get };
```

**Router Template:**
```javascript
const express = require('express');
const controller = require('./module-controller');

const router = new express.Router();

router.get('/:id', controller.get);

module.exports = router;
```

---

## Appendix: Technology Documentation

- **Express.js**: https://expressjs.com/
- **Knex.js**: http://knexjs.org/
- **EJS**: https://ejs.co/
- **Airbnb JavaScript Style Guide**: https://github.com/airbnb/javascript
- **AngularJS**: https://docs.angularjs.org/
