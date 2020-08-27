const express = require("express");
const router = new express.Router();

router.get("/", (req, res) => res.render("home/index", { title: "home" }));
router.get("/pdv", (req, res) => res.render("home/pdv", { title: "Pdv" }));
router.get("/tarifa", (req, res) => res.render("home/tarifa", { title: "Tarife" }));
router.get("/partner", (req, res) => res.render("home/partner", { title: "Partneri" }));
router.get("/artikl", (req, res) => res.render("home/artikl", { title: "Artikli" }));
router.get("/firma", (req, res) => res.render("home/firma", { title: "Postavke" }));
router.get("/racun-list", (req, res) => res.render("home/racun-list", { title: "Lista računa" }));
router.get("/racun-edit", (req, res) => res.render("home/racun", { title: "Računnnnn" }));

module.exports = router;
