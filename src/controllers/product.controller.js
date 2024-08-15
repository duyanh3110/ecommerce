"use strict";

const ProductService = require("../services/product.service");
const { SuccessResponse } = require("../core/success.response");

class ProductController {
	createProduct = async (req, res, next) => {
		new SuccessResponse({
			message: "createProduct successfully",
			metadata: await ProductService.createProduct(
				req.body.product_type,
				{
					...req.body,
					product_shop: req.user.userId,
				}
			),
		}).send(res);
	};

	updateProduct = async (req, res, next) => {
		new SuccessResponse({
			message: "updateProduct successfully",
			metadata: await ProductService.updateProduct(
				req.body.product_type,
				req.params.product_id,
				{
					...req.body,
					product_shop: req.user.userId,
				}
			),
		}).send(res);
	};

	publishProductByShop = async (req, res, next) => {
		new SuccessResponse({
			message: "publishProductByShop successfully",
			metadata: await ProductService.publishProductByShop({
				product_id: req.params.id,
				product_shop: req.user.userId,
			}),
		}).send(res);
	};

	unpublishProductByShop = async (req, res, next) => {
		new SuccessResponse({
			message: "unpublishProductByShop successfully",
			metadata: await ProductService.unpublishProductByShop({
				product_id: req.params.id,
				product_shop: req.user.userId,
			}),
		}).send(res);
	};

	/**
	 * @desc Get all Drafts for shop
	 * @param {Number} limit
	 * @param {Number} skip
	 * @return {JSON}
	 */
	getAllDraftsForShop = async (req, res, next) => {
		new SuccessResponse({
			message: "getAllDraftsForShop successfully",
			metadata: await ProductService.findAllDraftsForShop({
				product_shop: req.user.userId,
			}),
		}).send(res);
	};

	/**
	 * @desc Get all Published for shop
	 * @param {Number} limit
	 * @param {Number} skip
	 * @return {JSON}
	 */
	getAllPublishedForShop = async (req, res, next) => {
		new SuccessResponse({
			message: "getAllPublishedForShop successfully",
			metadata: await ProductService.findAllPublishedForShop({
				product_shop: req.user.userId,
			}),
		}).send(res);
	};

	getListSearchProduct = async (req, res, next) => {
		new SuccessResponse({
			message: "getListSearchProduct successfully",
			metadata: await ProductService.searchProducts(req.params),
		}).send(res);
	};

	findAllProducts = async (req, res, next) => {
		new SuccessResponse({
			message: "findAllProducts successfully",
			metadata: await ProductService.findAllProducts(req.query),
		}).send(res);
	};

	findProduct = async (req, res, next) => {
		new SuccessResponse({
			message: "findProduct successfully",
			metadata: await ProductService.findProduct({
				product_id: req.params.product_id,
			}),
		}).send(res);
	};
}

module.exports = new ProductController();
