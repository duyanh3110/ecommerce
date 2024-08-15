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

const removeUndefinedObject = (obj) => {
	Object.keys(obj).forEach((key) => {
		if (obj[key] === null) {
			delete obj[key];
		}
	});

	return obj;
};

const updateNestedObjectParser = (obj) => {
	const final = {};

	Object.keys(obj).forEach((key) => {
		if (typeof obj[key] === "object" && !Array.isArray(obj[key])) {
			const response = updateNestedObjectParser(obj[key]);
			Object.keys(response).forEach((k) => {
				final[`${key}.${k}`] = response[k];
			});
		} else {
			final[key] = obj[key];
		}
	});
	return final;
};

module.exports = {
	getInfoData,
	generateKeys,
	getSelectData,
	getUnselectData,
	removeUndefinedObject,
	updateNestedObjectParser,
};
