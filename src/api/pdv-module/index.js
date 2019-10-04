const express = require("express");
const controller = require("./pdv-controller");

const apiRouter = new express.Router();

apiRouter.get("", controller.getAll);

module.exports = apiRouter;