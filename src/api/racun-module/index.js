const express = require("express");
const controller = require("./racun-controller");

const router = new express.Router();

router.get("", controller.getAll);

module.exports = router;