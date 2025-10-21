const express = require('express');
const controller = require('./racun-controller');

const router = new express.Router();

router.get('/:id/pdf', controller.getPdf);
router.get('/:id', controller.get);
router.get('', controller.getAll);
router.post('', controller.save);

module.exports = router;
