require("dotenv").config();
const morgan = require("morgan");
const { default: helmet } = require("helmet");
const express = require("express");
const compression = require("compression");
const app = express();

// init middleware
app.use(morgan("dev"));
app.use(helmet());
app.use(compression());
app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);

// init db
require("./dbs/init.mongodb");
const { checkOverload } = require("./helpers/check.connect");
checkOverload();

// list routes
app.use("/", require("./routes"));

// handle errors

module.exports = app;
