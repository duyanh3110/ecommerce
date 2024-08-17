"use strict";

const { getUnselectData, getSelectData } = require("../../utils");

const findAllDiscountCodesUnselected = async ({
	limit = 50,
	page = 1,
	sort = "ctime",
	filter,
	unSelect,
	model,
}) => {
	const skip = (page - 1) * limit;
	const sortBy = sort === "ctime" ? { _id: -1 } : { _id: 1 };
	const documents = await model
		.find(filter)
		.sort(sortBy)
		.skip(skip)
		.limit(limit)
		.select(getUnselectData(unSelect))
		.lean();

	return documents;
};

const findAllDiscountCodesSelected = async ({
	limit = 50,
	page = 1,
	sort = "ctime",
	filter,
	select,
	model,
}) => {
	const skip = (page - 1) * limit;
	const sortBy = sort === "ctime" ? { _id: -1 } : { _id: 1 };
	const documents = await model
		.find(filter)
		.sort(sortBy)
		.skip(skip)
		.limit(limit)
		.select(getSelectData(select))
		.lean();

	return documents;
};

module.exports = {
	findAllDiscountCodesUnselected,
	findAllDiscountCodesSelected,
};
