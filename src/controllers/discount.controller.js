"user strict";

const { SuccessResponse } = require("../core/success.response");
const DiscountService = require("../services/discount.service");

class DiscountController {
	createDiscountCode = async (req, res, next) => {
		new SuccessResponse({
			message: "createDiscountCode successfully",
			metadata: await DiscountService.createDiscountCode({
				...req.body,
				shopId: req.user.userId,
			}),
		}).send(res);
	};

	getAllDiscountCodes = async (req, res, next) => {
		new SuccessResponse({
			message: "getAllDiscountCodes successfully",
			metadata: await DiscountService.getAllDiscountCodesByShop({
				...req.query,
				shopId: req.user.userId,
			}),
		}).send(res);
	};

	getDiscountAmount = async (req, res, next) => {
		new SuccessResponse({
			message: "getDiscountAmount successfully",
			metadata: await DiscountService.getDiscountAmount({
				...req.body,
			}),
		}).send(res);
	};

	getAllDiscountCodesWithProduct = async (req, res, next) => {
		console.log("QUERY ::: ", req.user);
		new SuccessResponse({
			message: "getAllDiscountCodesWithProduct successfully",
			metadata: await DiscountService.getAllDiscountCodesWithProduct({
				...req.query,
			}),
		}).send(res);
	};
}

module.exports = new DiscountController();
