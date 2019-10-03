const express = require("express");
const artiklRouter = require("./artikl-module");

const apiRouter = new express.Router();

apiRouter.use("/pdvs", artiklRouter);

module.exports = apiRouter;
