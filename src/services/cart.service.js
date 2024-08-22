"use strict";

const { NotFoundError } = require("../core/error.response");
const cartModel = require("../models/cart.model");
const { getProductById } = require("../models/repositories/product.repo");

class CartService {
	static async createUserCart({ userId, product }) {
		const { productId } = product;
		const foundProduct = await getProductById(productId);

		if (!foundProduct) {
			throw new NotFoundError("Product not existed");
		}

		const { product_name, product_price, product_quantity } = foundProduct;

		if (product.quantity > product_quantity) {
			throw new NotFoundError("Product not enough stock to add to cart");
		}

		product = {
			...product,
			price: product_price,
			name: product_name,
		};

		const query = { cart_userId: userId, cart_state: "active" },
			updateOrInsert = {
				$addToSet: {
					cart_products: product,
				},
			},
			options = { upsert: true, new: true };

		return await cartModel.findOneAndUpdate(query, updateOrInsert, options);
	}

	static async updateUserCartQuantity({ userId, product }) {
		const { productId, quantity } = product;

		const query = {
				cart_userId: userId,
				"cart_products.productId": productId,
				cart_state: "active",
			},
			updateSet = { $inc: { "cart_products.$.quantity": quantity } },
			options = { upsert: true, new: true };

		return await cartModel.findOneAndUpdate(query, updateSet, options);
	}

	static async addToCart({ userId, product = {} }) {
		const userCart = await cartModel.findOne({ cart_userId: userId });
		if (!userCart) {
			return await CartService.createUserCart({ userId, product });
		}
		// if cart already contains product
		if (!userCart.cart_products.length) {
			userCart.cart_products = [product];
			return await userCart.save();
		}
		// if product already exists in cart
		return await CartService.updateUserCartQuantity({ userId, product });
	}

	static async addToCartV2({ userId, shop_order_ids = {} }) {
		const { productId, quantity, old_quantity } =
			shop_order_ids[0]?.item_products[0];

		const foundProduct = await getProductById(productId);
		if (!foundProduct) {
			throw new NotFoundError("Product not existed");
		}

		if (
			foundProduct.product_shop.toString() !== shop_order_ids[0]?.shopId
		) {
			throw new NotFoundError("Product do not belong to the shop");
		}

		if (quantity === 0) {
			console.log("Delete product from cart");
		}

		return await CartService.updateUserCartQuantity({
			userId,
			product: { productId, quantity: quantity - old_quantity },
		});
	}

	static async deleteUserCart({ userId, productId }) {
		const query = { cart_userId: userId, cart_state: "active" },
			updateSet = {
				$pull: {
					cart_products: {
						productId,
					},
				},
			};
		const deleteCart = await cartModel.updateOne(query, updateSet);
		return deleteCart;
	}

	static async getListUserCart({ userId }) {
		return await cartModel
			.findOne({
				cart_userId: +userId,
			})
			.lean();
	}
}

module.exports = CartService;
