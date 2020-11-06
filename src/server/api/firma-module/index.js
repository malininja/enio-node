const express = require('express');
const controller = require('./firma-controller');

const router = new express.Router();

router.get('', controller.get);
router.post('', controller.save);

module.exports = router;
