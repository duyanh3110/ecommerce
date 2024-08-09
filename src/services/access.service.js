"user strict";

const bcrypt = require("bcrypt");
const crypto = require("crypto");
const shopModel = require("../models/shop.model");
const KeyTokenService = require("./keyToken.service");
const { createTokenPair, verifyJWT } = require("../auth/authUtils");
const { getInfoData, generateKeys } = require("../utils");
const {
    BadRequestError,
    AuthFailureError,
    ForbiddenError,
} = require("../core/error.response");
const { findByEmail } = require("./shop.service");

const ShopRole = {
    SHOP: "SHOP",
    WRITER: "WRITER",
    EDITOR: "EDITOR",
    ADMIN: "ADMIN",
};

class AccessService {
    // Check token is already used
    static handleRefreshToken = async ({ refreshToken, user, keyStore }) => {
        const { userId, email } = user;
        if (keyStore.refreshTokensUsed.includes(refreshToken)) {
            await KeyTokenService.deleteKeyById(userId);
            throw new ForbiddenError("Something went wrong! Please re login");
        }

        if (keyStore.refreshToken !== refreshToken) {
            throw new AuthFailureError("Shop not registered!");
        }

        // Check userId existed
        const foundShop = await findByEmail({ email });
        if (!foundShop) throw new AuthFailureError("Shop not registered!");

        // Create new token
        const tokens = await createTokenPair(
            { userId, email },
            keyStore.publicKey,
            keyStore.privateKey,
        );

        // Update token
        await keyStore.updateOne({
            $set: {
                refreshToken: tokens.refreshToken,
            },
            $addToSet: {
                refreshTokensUsed: refreshToken,
            },
        });

        return {
            user,
            tokens,
        };
    };

    static logout = async (keyStore) => {
        const delKey = await KeyTokenService.removeKeyById(keyStore._id);
        return delKey;
    };

    /*
    1 - Check email in DB
    2 - Match password
    3 - Create access token & refresh token and save
    4 - Generate tokens
    5 - Get data return login
  */
    static login = async ({ email, password, refreshToken = null }) => {
        // 1.
        const foundShop = await findByEmail({ email });
        console.log("SHOP ::: ", foundShop);
        if (!foundShop) throw new BadRequestError("Shop not registered");

        // 2.
        const match = bcrypt.compare(password, foundShop.password);
        if (!match) throw new AuthFailureError("Authentication error");

        // 3.
        const { privateKey, publicKey } = generateKeys();

        // 4.
        const { _id: userId } = foundShop;
        const tokens = await createTokenPair(
            { userId: foundShop._id, email },
            publicKey,
            privateKey,
        );

        await KeyTokenService.createKeyToken({
            refreshToken: tokens.refreshToken,
            privateKey,
            publicKey,
            userId,
        });
        return {
            shop: getInfoData({
                fields: ["_id", "name", "email"],
                object: foundShop,
            }),
            tokens,
        };
    };

    static signUp = async ({ name, email, password }) => {
        // try {
        // Step 1: Check email exists??
        const holderShop = await shopModel.findOne({ email }).lean();
        if (holderShop) {
            throw new BadRequestError("Error: Shop already registered!");
        }

        const passwordHash = await bcrypt.hash(password, 10);

        const newShop = await shopModel.create({
            name,
            email,
            password: passwordHash,
            roles: [ShopRole.SHOP],
        });

        if (newShop) {
            // Create privateKey, publicKey
            // privateKey:: sign token
            // publicKey:: verify token
            // const { privateKey, publicKey } = crypto.generateKeyPairSync("rsa", {
            //   modulusLength: 4096,
            //   publicKeyEncoding: {
            //     type: "pkcs1",
            //     format: "pem",
            //   },
            //   privateKeyEncoding: {
            //     type: "pkcs1",
            //     format: "pem",
            //   },
            // });

            const privateKey = crypto.randomBytes(64).toString("hex");
            const publicKey = crypto.randomBytes(64).toString("hex");
            console.log({ privateKey, publicKey }); // TODO: save collection KeyStore

            const keyStore = await KeyTokenService.createKeyToken({
                userId: newShop._id,
                publicKey,
                privateKey,
            });

            if (!keyStore) {
                throw new BadRequestError("Error: Keystore error!");
            }

            // Create token paired
            const tokens = await createTokenPair(
                { userId: newShop._id, email },
                publicKey,
                privateKey,
            );

            return {
                code: 201,
                metadata: {
                    shop: getInfoData({
                        fields: ["_id", "name", "email"],
                        object: newShop,
                    }),
                    shop: newShop,
                    tokens,
                },
            };
        }

        return {
            code: 200,
            metadata: null,
        };
        // } catch (error) {
        //   console.log(error);
        //   return {
        //     code: "xxx",
        //     message: error.message,
        //     status: "error",
        //   };
        // }
    };
}

module.exports = AccessService;
