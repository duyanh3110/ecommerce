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

// ['a', 'b'] => {a: 1, b: 1}
const getSelectData = (select = []) => {
	return Object.fromEntries(select.map((el) => [el, 1]));
};

const getUnselectData = (select = []) => {
	return Object.fromEntries(select.map((el) => [el, 0]));
};

module.exports = {
	getInfoData,
	generateKeys,
	getSelectData,
	getUnselectData,
};
