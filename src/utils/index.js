"use strict";

const _ = require("lodash");
const crypto = require("crypto");

const getInfoData = ({ fields = [], object = {} }) => {
	return _.pick(object, fields);
};

const generateKeys = () => {
	const privateKey = crypto.randomBytes(64).toString("hex");
	const publicKey = crypto.randomBytes(64).toString("hex");

	return { privateKey, publicKey };
};

module.exports = {
	getInfoData,
	generateKeys,
};
