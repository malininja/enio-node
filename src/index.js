const http = require("http");
const express = require("express");
const apiRouter = require("./api");
const homeRouter = require("./home-router");
const path = require("path");
const bodyParser = require("body-parser");

const app = express();
const port = process.env.PORT || 3000;
const server = http.Server(app);

app.set("view engine", "ejs");
app.set("views", __dirname + "/views");
app.use(express.static(path.join(__dirname, "static")));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use("/home", homeRouter);
app.use("/api", apiRouter);

server.listen(port, () => {
  console.log(`Server slusa na ${port}`);
  console.log("http://localhost:3000/home");
});
