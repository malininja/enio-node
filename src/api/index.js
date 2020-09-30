const express = require("express");
const pdvRouter = require("./pdv-module");
const firmaRouter = require("./firma-module");
const tarifaRouter = require("./tarifa-module");
const partnerRouter = require("./partner-module");
const artiklRouter = require("./artikl-module");
const racunRouter = require("./racun-module");

const apiRouter = new express.Router();

apiRouter.use("/pdv", pdvRouter);
apiRouter.use("/firma", firmaRouter);
apiRouter.use("/tarifa", tarifaRouter);
apiRouter.use("/partner", partnerRouter);
apiRouter.use("/artikl", artiklRouter);
apiRouter.use("/racun", racunRouter);

module.exports = apiRouter;
