"use strict";

const { SuccessResponse } = require("../core/success.response");
const CartService = require("../services/cart.service");

class CartController {
	addToCart = async (req, res, next) => {
		new SuccessResponse({
			message: "addToCart successfully",
			metadata: await CartService.addToCart(req.body),
		}).send(res);
	};

	updateToCart = async (req, res, next) => {
		new SuccessResponse({
			message: "updateToCart successfully",
			metadata: await CartService.addToCartV2(req.body),
		}).send(res);
	};

	deleteToCart = async (req, res, next) => {
		new SuccessResponse({
			message: "deleteToCart successfully",
			metadata: await CartService.deleteUserCart(req.body),
		}).send(res);
	};

	listToCart = async (req, res, next) => {
		new SuccessResponse({
			message: "listToCart successfully",
			metadata: await CartService.getListUserCart(req.query),
		}).send(res);
	};
}

module.exports = new CartController();
