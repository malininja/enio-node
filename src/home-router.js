const express = require("express");
const router = new express.Router();

router.get("/", (req, res) => res.render("home/index", { title: "home" }));
router.get("/pdv", (req, res) => res.render("home/pdv", { title: "Pdv" }));
router.get("/tarifa", (req, res) => res.render("home/tarifa", { title: "Tarife" }));
router.get("/partner", (req, res) => res.render("home/partner", { title: "Partneri" }));
router.get("/artikl", (req, res) => res.render("home/artikl", { title: "Artikli" }));
router.get("/config", (req, res) => res.render("home/config", { title: "Postavke" }));
router.get("/racun-list", (req, res) => res.render("home/racun-list", { title: "Lista računa" }));

module.exports = router;
