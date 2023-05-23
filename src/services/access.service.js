"user strict";

const bcrypt = require("bcrypt");
const crypto = require("crypto");
const shopModel = require("../models/shop.model");
const KeyTokenService = require("./keyToken.service");
const { createTokenPair } = require("../auth/authUtils");
const { getInfoData } = require("../utils");

const ShopRole = {
  SHOP: "SHOP",
  WRITER: "WRITER",
  EDITOR: "EDITOR",
  ADMIN: "ADMIN",
};

class AccessService {
  static signUp = async ({ name, email, password }) => {
    try {
      // Step 1: Check email exists??
      const holderShop = await shopModel.findOne({ email }).lean();
      if (holderShop) {
        return {
          code: "xxxx",
          message: "Shop already exists!",
        };
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
        const { privateKey, publicKey } = crypto.generateKeyPairSync("rsa", {
          modulusLength: 4096,
          publicKeyEncoding: {
            type: "pkcs1",
            format: "pem",
          },
          privateKeyEncoding: {
            type: "pkcs1",
            format: "pem",
          },
        });

        console.log({ privateKey, publicKey }); // TODO: save collection KeyStore

        const publicKeyString = await KeyTokenService.createKeyToken({
          userId: newShop._id,
          publicKey,
        });

        if (!publicKeyString) {
          return {
            code: "xxxx",
            message: "publicKeyString error",
          };
        }

        console.log(`publicKeyString::${publicKeyString}`);
        const publicKeyObject = crypto.createPublicKey(publicKeyString);
        console.log(`publicKeyObject::${publicKeyObject}`);

        // Create token paired
        const tokens = await createTokenPair(
          { userId: newShop._id, email },
          publicKeyString,
          privateKey
        );
        console.log(`Created Token Success::`, tokens);

        return {
          code: 201,
          metadata: {
            // shop: getInfoData({
            //   fields: ["_id", "name", "email"],
            //   object: newShop,
            // }),
            shop: newShop,
            tokens,
          },
        };
      }

      return {
        code: 200,
        metadata: null,
      };
    } catch (error) {
      return {
        code: "xxx",
        message: error.message,
        status: "error",
      };
    }
  };
}

module.exports = AccessService;
