# New API Endpoint Template

## Task
Create a new `{EntityName}` API endpoint following the project conventions.

## Steps

### 1. Route — `backend/src/routes/{entity}Routes.js`
```js
const express = require('express');
const router = express.Router();
const { entityController } = require('../controllers/{entity}Controller');
const { authenticate, roleGuard } = require('../middleware/auth');

// GET /api/v1/{entities} — List all
router.get('/', authenticate, roleGuard('admin'), entityController.list);

// GET /api/v1/{entities}/:id — Get one
router.get('/:id', authenticate, roleGuard('admin'), entityController.getById);

// POST /api/v1/{entities} — Create
router.post('/', authenticate, roleGuard('admin'), entityController.create);

// PUT /api/v1/{entities}/:id — Update
router.put('/:id', authenticate, roleGuard('admin'), entityController.update);

// DELETE /api/v1/{entities}/:id — Delete
router.delete('/:id', authenticate, roleGuard('admin'), entityController.delete);

module.exports = router;
```

### 2. Controller — `backend/src/controllers/{entity}Controller.js`
```js
const { entityService } = require('../services/{entity}Service');
const { createResponse, createError } = require('../utils/response');

const entityController = {
  async list(req, res, next) {
    try {
      const data = await entityService.list(req.query);
      res.json(createResponse(data));
    } catch (err) { next(err); }
  },
  async getById(req, res, next) {
    try {
      const data = await entityService.getById(req.params.id);
      if (!data) return res.status(404).json(createError('NOT_FOUND', '{Entity} not found'));
      res.json(createResponse(data));
    } catch (err) { next(err); }
  },
  async create(req, res, next) {
    try {
      const data = await entityService.create(req.body);
      res.status(201).json(createResponse(data));
    } catch (err) { next(err); }
  },
  async update(req, res, next) {
    try {
      const data = await entityService.update(req.params.id, req.body);
      if (!data) return res.status(404).json(createError('NOT_FOUND', '{Entity} not found'));
      res.json(createResponse(data));
    } catch (err) { next(err); }
  },
  async delete(req, res, next) {
    try {
      await entityService.delete(req.params.id);
      res.json(createResponse({ message: '{Entity} deleted' }));
    } catch (err) { next(err); }
  },
};
module.exports = { entityController };
```

### 3. Service — `backend/src/services/{entity}Service.js`
```js
const pool = require('../config/db');
const { validate } = require('../utils/validation');
const Joi = require('joi');

const schema = Joi.object({
  // Define Joi schema here
});

const entityService = {
  async list(query) {
    const { rows } = await pool.query('SELECT * FROM {entities} ORDER BY created_at DESC');
    return rows;
  },
  async getById(id) {
    const { rows } = await pool.query('SELECT * FROM {entities} WHERE id = $1', [id]);
    return rows[0] || null;
  },
  async create(data) {
    await validate(data, schema);
    const { rows } = await pool.query(
      'INSERT INTO {entities} (...) VALUES (...::UUID) RETURNING *',
      [data.field1]
    );
    return rows[0];
  },
  async update(id, data) {
    await validate(data, schema);
    const { rows } = await pool.query(
      'UPDATE {entities} SET ... = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      [data.field1, id]
    );
    return rows[0] || null;
  },
  async delete(id) {
    await pool.query('DELETE FROM {entities} WHERE id = $1', [id]);
  },
};
module.exports = { entityService };
```

### 4. Register route in `backend/src/routes/index.js`
```js
const {entityRoutes} = require('./{entity}Routes');
router.use('/{entities}', entityRoutes);
```

### 5. Add unit test — `backend/tests/unit/{entity}.test.js`
```js
const { describe, it, before, after } = require('node:test');
const assert = require('node:assert');

describe('{Entity} API', () => {
  it('should list {entities}', async () => {
    // Test here
  });
});
```

### 6. Verify
```bash
cd backend && npm run test:unit && npm run test:smoke
```
