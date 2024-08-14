"use strict";

const { product, clothing, electronic } = require("../models/product.model");
const { BadRequestError } = require("../core/error.response");

// Define Factory class to create product
class ProductFactory {
    /*
        type: "Clothing",
        payload
    */
    static async createProduct(type, payload) {
        switch (type) {
            case "Electronics":
                return new Electronics(payload);
            case "Clothing":
                return new Clothing(payload).createProduct();
            default:
                throw new BadRequestError("Invalid Product Types ", type);
        }
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
    async createProduct() {
        return await product.create(this);
    }
}

// Define subclass for different product types
class Clothing extends Product {
    async createProduct() {
        const newClothing = await clothing.create(this.product_attributes);
        if (!newClothing) {
            throw new BadRequestError("Create new Clothing failed");
        }

        const newProduct = await super.createProduct();
        if (!newProduct) {
            throw new BadRequestError("Create new Product failed");
        }

        return newProduct;
    }
}

class Electronics extends Product {
    async createProduct() {
        const newElectronic = await electronic.create(this.product_attributes);
        if (!newElectronic) {
            throw new BadRequestError("Create new Clothing failed");
        }

        const newProduct = await super.createProduct();
        if (!newProduct) {
            throw new BadRequestError("Create new Product failed");
        }

        return newProduct;
    }
}

module.exports = ProductFactory;
