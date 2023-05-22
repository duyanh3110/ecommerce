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

// init db
require("./dbs/init.mongodb");
const { checkOverload } = require("./helpers/check.connect");
checkOverload();

// list routes
app.get("/", (req, res, next) => {
  const strCompress = "This is a string to compress";
  return res.status(200).json({
    message: "Hello World",
    metadata: strCompress.repeat(10000),
  });
});

// handle errors

module.exports = app;
