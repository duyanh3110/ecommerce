"use strict";

const mongoose = require("mongoose");

// const {
//   db: { host, name, port },
// } = require("../configs/config.mongodb");
// const connectString = `mongodb://${host}:${port}/${name}`;

const {
  db: { host, port, name },
} = require("../configs/config.mongodb");
const connectString = `mongodb://${host}:${port}/${name}`;
const { countConnect } = require("../helpers/check.connect");

console.log(`connectString: ${connectString}`);
class Database {
  constructor() {
    this.connect();
  }

  connect(type = "mongodb") {
    // Set when env = dev
    mongoose.set("debug", true);
    mongoose.set("debug", { color: true });

    mongoose
      .connect(connectString)
      .then((_) => {
        console.log(`Connected Mongodb Success PRO`, countConnect());
      })
      .catch((err) => console.log("Error connecting"));
  }

  static getInstance() {
    if (!Database.instance) {
      Database.instance = new Database();
    }

    return Database.instance;
  }
}

const instanceMongodb = Database.getInstance();

module.exports = instanceMongodb;
