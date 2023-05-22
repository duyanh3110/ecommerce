"use strict";

const mongoose = require("mongoose");

const connectString = `mongodb+srv://admin:FDkfSH1jJWyekSRx@ecommerce.tkwxauf.mongodb.net`;
mongoose
  .connect(connectString, {
    maxPoolSize: 50,
  })
  .then((_) => console.log("Connected Mongodb Success"))
  .catch((err) => console.log("Error connecting"));

// Set when env = dev
mongoose.set("debug", true);
mongoose.set("debug", { color: true });

module.exports = mongoose;
