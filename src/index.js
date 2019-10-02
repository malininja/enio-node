const http = require("http");
const express = require("express");
const artiklRouter = require("./api/artikl-module");
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;
const server = http.Server(app);

app.set("view engine", "ejs");
app.set("views", __dirname + "/views");

app.use(express.static(path.join(__dirname, 'static')));

app.get('/home', function (req, res) {
  res.render('home/index', { prop: "glupi prop" });
});

app.use("/api/pdvs", artiklRouter);

app.get("/home", (req, res) => res.render(""))
server.listen(port, () => {
  console.log(`Server slusa na ${port}`);
});