"use strict";

const { Schema, model } = require("mongoose");

const DOCUMENT_NAME = "Product";
const COLLECTION_NAME = "Products";

// Declare the Schema of the Mongo model
var productSchema = new Schema(
    {
        product_name: {
            type: String,
            required: true,
        },
        product_thumb: {
            type: String,
            required: true,
        },
        product_description: String,
        product_price: { type: Number, required: true },
        product_quantity: { type: Number, required: true },
        product_type: {
            type: String,
            required: true,
            enum: ["Electronics", "Clothing", "Furniture"],
        },
        product_shop: { type: Schema.Types.ObjectId, ref: "Shop" },
        product_attributes: { type: Schema.Types.Mixed, required: true },
    },
    {
        collection: COLLECTION_NAME,
        timestamps: true,
    },
);

// Define product type
const clothingSchema = new Schema(
    {
        brand: { type: String, required: true },
        size: String,
        material: String,
    },
    {
        collection: "Clothes",
        timestamps: true,
    },
);

const electronicSchema = new Schema(
    {
        manufacture: { type: String, required: true },
        model: String,
        color: String,
    },
    {
        collection: "Electronics",
        timestamps: true,
    },
);

// Export the model
module.exports = {
    product: model(DOCUMENT_NAME, productSchema),
    electronic: model("Electronics", electronicSchema),
    clothing: model("Clothing", clothingSchema),
};
