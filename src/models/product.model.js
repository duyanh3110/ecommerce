"use strict";

const { Schema, model } = require("mongoose");
const slugify = require("slugify");

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
		product_slug: String,
		product_price: { type: Number, required: true },
		product_quantity: { type: Number, required: true },
		product_type: {
			type: String,
			required: true,
			enum: ["Electronics", "Clothing", "Furniture"],
		},
		product_shop: { type: Schema.Types.ObjectId, ref: "Shop" },
		product_attributes: { type: Schema.Types.Mixed, required: true },
		product_ratingAverage: {
			type: Number,
			default: 4.5,
			min: [1, "Rating muse be above 1.0"],
			max: [5, "Rating muse be above 5.0"],
			set: (val) => Math.round(val * 10) / 10,
		},
		product_variations: { type: Array, default: [] },
		isDraft: { type: Boolean, default: true, index: true, select: false },
		isPublished: {
			type: Boolean,
			default: false,
			index: true,
			select: false,
		},
	},
	{
		collection: COLLECTION_NAME,
		timestamps: true,
	}
);

// Create index for search
productSchema.index({ product_name: "text", product_description: "text" });

// Document middleware: runs before .save() and .create()
productSchema.pre("save", function (next) {
	this.product_slug = slugify(this.product_name, { lower: true });
	next();
});

// Define product type
const clothingSchema = new Schema(
	{
		brand: { type: String, required: true },
		size: String,
		material: String,
		product_shop: { type: Schema.Types.ObjectId, ref: "Shop" },
	},
	{
		collection: "Clothes",
		timestamps: true,
	}
);

const electronicSchema = new Schema(
	{
		manufacture: { type: String, required: true },
		model: String,
		color: String,
		product_shop: { type: Schema.Types.ObjectId, ref: "Shop" },
	},
	{
		collection: "Electronics",
		timestamps: true,
	}
);

const furnitureSchema = new Schema(
	{
		brand: { type: String, required: true },
		size: String,
		material: String,
		product_shop: { type: Schema.Types.ObjectId, ref: "Shop" },
	},
	{
		collection: "Furnitures",
		timestamps: true,
	}
);

// Export the model
module.exports = {
	product: model(DOCUMENT_NAME, productSchema),
	electronic: model("Electronics", electronicSchema),
	clothing: model("Clothing", clothingSchema),
	furniture: model("Furniture", furnitureSchema),
};
