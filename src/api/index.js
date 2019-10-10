const express = require("express");
const pdvRouter = require("./pdv-module");

const apiRouter = new express.Router();

apiRouter.use("/pdv", pdvRouter);

module.exports = apiRouter;
