"use strict";

const mongoose = require("mongoose");
const os = require("os");
const process = require("process");
const _SECONDS = 5000;

// count Connections
const countConnect = () => {
	const numConnection = mongoose.connections.length;
	console.log(`Number of connections::${numConnection}`);
};

// check overloaded
const checkOverload = () => {
	setInterval(() => {
		const numConnection = mongoose.connections.length;
		const numCores = os.cpus().length;
		const memoryUsage = process.memoryUsage().rss;

		// Example maximum number of connections based on number of cores
		const MAX_CONNECTIONS = numCores * 5;

		// console.log(`Active connections::${numConnection}`);
		// console.log(`Memory usage::${memoryUsage / 1024 / 1024} MB`);

		if (numConnection > MAX_CONNECTIONS) {
			console.log(`Connections overload detected!`);
			//notify.send(...);
		}
	}, _SECONDS);
};

module.exports = { countConnect, checkOverload };
