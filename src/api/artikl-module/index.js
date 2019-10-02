const express = require("express");
const artiklController = require("./artikl-controller");

const apiRouter = new express.Router();

apiRouter.get("", artiklController.getAll);

module.exports = apiRouter;