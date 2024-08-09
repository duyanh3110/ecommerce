"use strict";

const JWT = require("jsonwebtoken");
const asyncHandler = require("../helpers/asyncHandler");
const { AuthFailureError, NotFoundError } = require("../core/error.response");
const { findByUserId } = require("../services/keyToken.service");

const HEADER = {
    API_KEY: "x-api-key",
    CLIENT_ID: "x-client-id",
    AUTHORIZATION: "authorization",
};

const createTokenPair = async (payload, publicKey, privateKey) => {
    try {
        // accessToken
        const accessToken = await JWT.sign(payload, publicKey, {
            expiresIn: "2 days",
        });

        const refreshToken = await JWT.sign(payload, privateKey, {
            expiresIn: "7 days",
        });

        JWT.verify(accessToken, publicKey, (err, decoded) => {
            if (err) {
                console.error(`error verify::`, err);
            } else {
                console.log(`decode verify::`, decoded);
            }
        });

        return { accessToken, refreshToken };
    } catch (error) {
        return error;
    }
};

const authentication = asyncHandler(async (req, res, next) => {
    // 1. Check userId missing or invalid
    // 2. Get access token
    // 3. Verify access token
    // 4. Check user in db
    // 5. Check key Store with userId
    // 6. OK: return next()

    // 1.
    const userId = req.headers[HEADER.CLIENT_ID];
    if (!userId) throw new AuthFailureError("Invalid Request");

    // 2.
    const keyStore = await findByUserId(userId);
    if (!keyStore) throw new NotFoundError("Not found keyStore");

    // 3.
    const accessToken = req.headers[HEADER.AUTHORIZATION];
    if (!accessToken) throw new AuthFailureError("Invalid Request");

    try {
        const decodeUser = JWT.verify(accessToken, keyStore.publicKey);

        if (userId !== decodeUser.userId)
            throw new AuthFailureError("Invalid Request");

        req.keyStore = keyStore;
        next();
    } catch (error) {
        throw error;
    }
});

const verifyJWT = async (token, keySecret) => {
    return await JWT.verify(token, keySecret);
};

module.exports = {
    createTokenPair,
    authentication,
    verifyJWT,
};
