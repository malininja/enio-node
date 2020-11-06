const express = require('express');
const controller = require('./pdv-controller');

const router = new express.Router();

router.get('', controller.getAll);
router.get('/:id', controller.get);
router.post('', controller.save);

module.exports = router;
