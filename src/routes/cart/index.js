"use strict";

const express = require("express");
const { authentication } = require("../../auth/authUtils");
const asyncHandler = require("../../helpers/asyncHandler");
const cartController = require("../../controllers/cart.controller");
const router = express.Router();

router.post("/", asyncHandler(cartController.addToCart));
router.delete("/", asyncHandler(cartController.deleteToCart));
router.post("/update", asyncHandler(cartController.updateToCart));
router.get("/", asyncHandler(cartController.listToCart));

module.exports = router;
