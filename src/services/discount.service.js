"use strict";

const { BadRequestError, NotFoundError } = require("../core/error.response");
const discountModel = require("../models/discount.model");
const {
	findAllDiscountCodesUnselected,
	checkDiscountExists,
} = require("../models/repositories/discount.repo");
const { findAllProducts } = require("../models/repositories/product.repo");
const { convertToObjectId } = require("../utils");

/*
    Discount Services
    1. Generate Discount code [Shop | Admin]
    2. Get discount amount [User]
    3. Get all discount codes [User | Shop]
    4. Verify discount code [User]
    5. Delete discount code [Admin | Shop]
    6. Cancel discount code [User]
*/
class DiscountService {
	static async createDiscountCode(payload) {
		const {
			code,
			start_date,
			end_date,
			is_active,
			shopId,
			min_order_value,
			product_ids,
			applies_to,
			name,
			description,
			type,
			value,
			max_value,
			max_uses,
			uses_count,
			users_used,
			max_uses_per_user,
		} = payload;

		if (
			new Date() < new Date(start_date) ||
			new Date() > new Date(end_date)
		) {
			throw new BadRequestError("Discount code is expired!");
		}

		if (new Date(start_date) >= new Date(end_date)) {
			throw new BadRequestError("Start date must be before end date!");
		}

		const foundDiscount = await checkDiscountExists({
			model: discountModel,
			filter: {
				discount_code: code,
				discount_shopId: convertToObjectId(shopId),
			},
		});

		if (foundDiscount && foundDiscount.discount_is_active) {
			throw new BadRequestError("Discount code already exists!");
		}

		const newDiscount = await discountModel.create({
			discount_name: name,
			discount_description: description,
			discount_type: type,
			discount_code: code,
			discount_value: value,
			discount_min_order_value: min_order_value || 0,
			discount_max_value: max_value,
			discount_start_date: new Date(start_date),
			discount_end_date: new Date(end_date),
			discount_max_uses: max_uses,
			discount_uses_count: uses_count,
			discount_users_used: users_used,
			discount_shopId: shopId,
			discount_max_uses_per_user: max_uses_per_user,
			discount_is_active: is_active,
			discount_applies_to: applies_to,
			discount_product_ids: applies_to === "all" ? [] : product_ids,
		});

		return newDiscount;
	}

	static async updateDiscountCode() {}

	static async getAllDiscountCodesWithProduct({
		code,
		shopId,
		userId,
		limit,
		page,
	}) {
		const foundDiscount = await discountModel
			.findOne({
				discount_code: code,
				discount_shopId: convertToObjectId(shopId),
			})
			.lean();

		if (!foundDiscount || !foundDiscount.discount_is_active) {
			throw new NotFoundError("Discount code is not existed!");
		}

		const { discount_applies_to, discount_product_ids } = foundDiscount;
		let products;

		if (discount_applies_to === "all") {
			products = await findAllProducts({
				filter: {
					product_shop: convertToObjectId(shopId),
					isPublished: true,
				},
				limit: +limit,
				page: +page,
				sort: "ctime",
				select: ["product_name"],
			});
		}

		if (discount_applies_to === "specific") {
			products = await findAllProducts({
				filter: {
					_id: { $in: discount_product_ids },
					isPublished: true,
				},
				limit: +limit,
				page: +page,
				sort: "ctime",
				select: ["product_name"],
			});
		}

		return products;
	}

	static async getAllDiscountCodesByShop({ limit, page, shopId }) {
		const discounts = await findAllDiscountCodesUnselected({
			limit: +limit,
			page: +page,
			filter: {
				discount_shopId: convertToObjectId(shopId),
				discount_is_active: true,
			},
			unSelect: ["__v", "discount_shopId"],
			model: discountModel,
		});

		return discounts;
	}

	static async getDiscountAmount({ codeId, userId, shopId, products }) {
		const foundDiscount = await checkDiscountExists({
			model: discountModel,
			filter: {
				discount_code: codeId,
				discount_shopId: convertToObjectId(shopId),
			},
		});

		if (!foundDiscount) {
			throw new NotFoundError(`Discount does not exist`);
		}

		const {
			discount_is_active,
			discount_max_uses,
			discount_start_date,
			discount_end_date,
			discount_min_order_value,
			discount_max_uses_per_user,
			discount_users_used,
			discount_value,
			discount_type,
		} = foundDiscount;

		if (!discount_is_active) {
			throw new NotFoundError(`Discount expired`);
		}

		if (!discount_max_uses) {
			throw new NotFoundError(`Discount are out`);
		}

		if (
			new Date() < new Date(discount_start_date) ||
			new Date() > new Date(discount_end_date)
		) {
			throw new NotFoundError(`Discount expired`);
		}

		let totalOrder = 0;
		if (discount_min_order_value > 0) {
			totalOrder = products.reduce((acc, product) => {
				return acc + product.quantity * product.price;
			}, 0);

			if (totalOrder < discount_min_order_value) {
				throw new NotFoundError(
					`Discount requires a minium order value of ${discount_min_order_value}`
				);
			}

			if (discount_max_uses_per_user > 0) {
				const userUserDiscount = discount_users_used.find(
					(user) => user.id === userId
				);

				if (userUserDiscount) {
					throw new NotFoundError(
						`Discount should be used only one time`
					);
				}
			}

			const amount =
				discount_type === "fixed_amount"
					? discount_value
					: totalOrder * (discount_value / 100);

			return {
				totalOrder,
				discount: amount,
				totalPrice: totalOrder - amount,
			};
		}
	}

	static async deleteDiscountCode({ shopId, codeId }) {
		const deleted = await discountModel.findOneAndDelete({
			discount_code: codeId,
			discount_shopId: convertToObjectId(shopId),
		});

		return deleted;
	}

	static async cancelDiscountCode({ codeId, shopId, userId }) {
		const foundDiscount = checkDiscountExists({
			model: discountModel,
			filter: {
				discount_code: codeId,
				discount_shopId: convertToObjectId(shopId),
			},
		});

		if (!foundDiscount) {
			throw new NotFoundError(`Discount does not exist`);
		}

		const result = await discountModel.findByIdAndUpdate(
			foundDiscount._id,
			{
				$pull: {
					discount_users_used: userId,
				},
				$inc: {
					discount_max_uses: 1,
					discount_uses_count: -1,
				},
			}
		);

		return result;
	}
}

module.exports = DiscountService;
