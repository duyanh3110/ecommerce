"use strict";

// level 0
// const config = {
//   app: {
//     port: 3000,
//   },
//   db: {
//     host: "localhost",
//     port: 27017,
//     name: "db",
//   },
// };

// level 1
// const dev = {
//   app: {
//     port: 3000,
//   },
//   db: {
//     host: "localhost",
//     port: 27017,
//     name: "dbDev",
//   },
// };

// const prod = {
//   app: {
//     port: 3000,
//   },
//   db: {
//     host: "localhost",
//     port: 27017,
//     name: "dbProd",
//   },
// };

//level 2
const dev = {
    app: {
        port: process.env.DEV_APP_PORT || 3000,
    },
    db: {
        host: process.env.DEV_DB_HOST || "localhost",
        port: process.env.DEV_DB_PORT || 27017,
        name: process.env.DEV_DB_NAME || "shopDEV",
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        url: process.env.DB_URL,
    },
};

const prod = {
    app: {
        port: process.env.PROD_APP_PORT || 3000,
    },
    db: {
        host: process.env.PROD_DB_HOST || "localhost",
        port: process.env.PROD_DB_PORT || 27017,
        name: process.env.PROD_DB_NAME || "shopPRO",
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        url: process.env.DB_URL,
    },
};

const config = { dev, prod };
const env = process.env.NODE_ENV || "dev";
module.exports = config[env];
