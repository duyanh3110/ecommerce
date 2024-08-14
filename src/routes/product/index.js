const express = require("express");
const productController = require("../../controllers/product.controller");
const asyncHandler = require("../../helpers/asyncHandler");
const { authentication } = require("../../auth/authUtils");
const router = express.Router();

// Authentication
router.use(authentication);
router.post("/product", asyncHandler(productController.createProduct));

module.exports = router;