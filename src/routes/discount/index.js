"use strict";

const express = require("express");
const { authentication } = require("../../auth/authUtils");
const asyncHandler = require("../../helpers/asyncHandler");
const discountController = require("../../controllers/discount.controller");
const router = express.Router();

router.get("/amount", asyncHandler(discountController.getDiscountAmount));
router.get(
	"/listProductCode",
	asyncHandler(discountController.getAllDiscountCodesWithProduct)
);

router.use(authentication);

router.post("/", asyncHandler(discountController.createDiscountCode));
router.get("/", asyncHandler(discountController.getAllDiscountCodes));

module.exports = router;
