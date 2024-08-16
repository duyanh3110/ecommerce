"use strict";

const {
	product,
	clothing,
	electronic,
	furniture,
} = require("../models/product.model");
const { BadRequestError } = require("../core/error.response");
const {
	findAllDraftsForShop,
	publishProductByShop,
	unpublishProductByShop,
	findAllPublishedForShop,
	searchProductsByUser,
	findAllProducts,
	findProduct,
	updateProductById,
} = require("../models/repositories/product.repo");
const { removeUndefinedObject, updateNestedObjectParser } = require("../utils");
const { insertInventory } = require("../models/repositories/inventory.repo");

// Define Factory class to create product
class ProductFactory {
	/*
        type: "Clothing", "Electronics", "Furniture"
        payload
    */
	static productRegistry = {};
	static registerProductType(type, classRef) {
		ProductFactory.productRegistry[type] = classRef;
	}

	static async createProduct(type, payload) {
		const productClass = ProductFactory.productRegistry[type];
		if (!productClass)
			throw new BadRequestError("Invalid Product Types ", type);
		return new productClass(payload).createProduct();
	}

	static async updateProduct(type, productId, payload) {
		const productClass = ProductFactory.productRegistry[type];
		if (!productClass)
			throw new BadRequestError("Invalid Product Types ", type);
		return new productClass(payload).updateProduct(productId);
	}

	static async publishProductByShop({ product_shop, product_id }) {
		return await publishProductByShop({ product_shop, product_id });
	}

	static async unpublishProductByShop({ product_shop, product_id }) {
		return await unpublishProductByShop({ product_shop, product_id });
	}

	static async findAllDraftsForShop({ product_shop, limit = 50, skip = 0 }) {
		const query = { product_shop, isDraft: true };
		return await findAllDraftsForShop({ query, limit, skip });
	}

	static async findAllPublishedForShop({
		product_shop,
		limit = 50,
		skip = 0,
	}) {
		const query = { product_shop, isPublished: true };
		return await findAllPublishedForShop({ query, limit, skip });
	}

	static async searchProducts({ keySearch }) {
		return await searchProductsByUser({ keySearch });
	}

	static async findAllProducts({
		limit = 50,
		sort = "ctime",
		page = 1,
		filter = { isPublished: true },
	}) {
		return await findAllProducts({
			limit,
			sort,
			page,
			filter,
			select: ["product_name", "product_price", "product_thumb"],
		});
	}

	static async findProduct({ product_id }) {
		return await findProduct({
			product_id,
			unSelect: ["__v", "product_variations"],
		});
	}
}

// Define base product class
class Product {
	constructor({
		product_name,
		product_thumb,
		product_description,
		product_price,
		product_type,
		product_shop,
		product_attributes,
		product_quantity,
	}) {
		this.product_name = product_name;
		this.product_thumb = product_thumb;
		this.product_description = product_description;
		this.product_price = product_price;
		this.product_type = product_type;
		this.product_shop = product_shop;
		this.product_attributes = product_attributes;
		this.product_quantity = product_quantity;
	}

	// Create new product
	async createProduct(id) {
		const newProduct = await product.create({
			...this,
			_id: id,
		});

		if (newProduct) {
			insertInventory({
				productId: newProduct._id,
				shopId: this.product_shop,
				stock: this.product_quantity,
			});
		}

		return newProduct;
	}

	async updateProduct(productId, payload) {
		return await updateProductById({ productId, payload, model: product });
	}
}

// Define subclass for different product types
class Clothing extends Product {
	async createProduct() {
		const newClothing = await clothing.create({
			...this.product_attributes,
			product_shop: this.product_shop,
		});
		if (!newClothing) {
			throw new BadRequestError("Create new Clothing failed");
		}

		const newProduct = await super.createProduct(newClothing._id);
		if (!newProduct) {
			throw new BadRequestError("Create new Product failed");
		}

		return newProduct;
	}

	async updateProduct(productId) {
		const objectParams = removeUndefinedObject(this);
		if (objectParams.product_attributes) {
			await updateProductById({
				productId,
				payload: updateNestedObjectParser(
					objectParams.product_attributes
				),
				model: clothing,
			});
		}

		const updateProduct = await super.updateProduct(
			productId,
			updateNestedObjectParser(objectParams)
		);

		return updateProduct;
	}
}

class Electronics extends Product {
	async createProduct() {
		const newElectronic = await electronic.create({
			...this.product_attributes,
			product_shop: this.product_shop,
		});
		if (!newElectronic) {
			throw new BadRequestError("Create new Electronic failed");
		}

		const newProduct = await super.createProduct(newElectronic._id);
		if (!newProduct) {
			throw new BadRequestError("Create new Product failed");
		}

		return newProduct;
	}
}

class Furniture extends Product {
	async createProduct() {
		const newFurniture = await furniture.create({
			...this.product_attributes,
			product_shop: this.product_shop,
		});
		if (!newFurniture) {
			throw new BadRequestError("Create new Furniture failed");
		}

		const newProduct = await super.createProduct(newFurniture._id);
		if (!newProduct) {
			throw new BadRequestError("Create new Product failed");
		}

		return newProduct;
	}
}

// Register product types
ProductFactory.registerProductType("Electronic", Electronics);
ProductFactory.registerProductType("Clothing", Clothing);
ProductFactory.registerProductType("Furniture", Furniture);

module.exports = ProductFactory;
