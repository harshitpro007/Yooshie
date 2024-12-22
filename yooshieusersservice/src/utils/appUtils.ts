"use strict";

import * as _ from "lodash";
import axios from "axios";
import * as Boom from "boom";
import { createHmac, randomBytes, randomInt } from "crypto";
import * as del from "del";
import { Request, ResponseToolkit } from "@hapi/hapi";
import * as MD5 from "md5";
import * as mongoose from "mongoose";
import * as randomstring from "randomstring";
import * as path from "path";
import * as TinyURL from "tinyurl";
import * as mimeType from "@json/mime-type.json";
import { GENERATOR, MIME_TYPE, REGEX, SERVER } from "@config/index";
import { logger } from "@lib/logger";
const TAG = "yooshie-uploads";

const setInsertObject = function (source, destination, fields) {
  _.each(fields, function (value, index) {
    if (source[value] != null && source[value] != "") {
      destination[value] = source[value];
    }
  });

  return destination;
};

const unsetInsertObject = function (source, destination, fields) {
  _.each(fields, function (value, index) {
    if (!source[value]) {
      destination[value] = "";
    }
  });

  return destination;
};

const buildToken = function (payload: TokenData) {
  const userObject: TokenData = {
    userId: payload.userId || payload["_id"],
    name: payload.name || undefined,
    firstName: payload.firstName || undefined,
    lastName: payload.lastName || undefined,
    email: payload.email,
    countryCode: payload.countryCode || undefined,
    mobileNo: payload.mobileNo || undefined,
    userType: payload.userType || payload["aud"],
    salt: payload.salt || undefined,
    profilePicture: payload.profilePicture || undefined,
    profileSteps: payload.profileSteps || undefined,
    isApproved: payload.isApproved || undefined, // optional
    created: payload.created || undefined, // optional
    platform: payload.platform,
    deviceId: payload.deviceId,
  };

  return userObject;
};

/**
 * generates random string of characters i.e salt
 * @function
 * @param {number} length - Length of the random string.
 */
const genRandomString = function (length) {
  return randomBytes(Math.ceil(length / 2))
    .toString("hex") /** convert to hexadecimal format */
    .slice(0, length); /** return required number of characters */
};

const encryptHashPassword = function (password: string, salt: string) {
  const hash = createHmac("sha512", salt); /** Hashing algorithm sha512 */
  hash.update(password);
  return hash.digest("hex");
};

const toObjectId = function (_id: string): mongoose.Types.ObjectId {
  return new mongoose.Types.ObjectId(_id);
};

const generateMongoId = function (): mongoose.Types.ObjectId {
  return new mongoose.Types.ObjectId();
};

const isObjectId = function (value: string): boolean {
  return REGEX.MONGO_ID.test(value);
};

const failActionFunction = async function (
  request: Request,
  h: ResponseToolkit,
  error: any
) {
  let customErrorMessage = "";
  if (error.name === "ValidationError") {
    customErrorMessage = error.details[0].message;
  } else {
    customErrorMessage = error.output.payload.message;
  }
  customErrorMessage = customErrorMessage.replace(/"/g, "");
  customErrorMessage = customErrorMessage.replace("[", "");
  customErrorMessage = customErrorMessage.replace("]", "");
  return Boom.badRequest(customErrorMessage);
};

Object.defineProperty(Array.prototype, "chunk_inefficient", {
  value: function (chunkSize) {
    const array = this;
    return [].concat.apply(
      [],
      array.map(function (elem, i) {
        return i % chunkSize ? [] : [array.slice(i, i + chunkSize)];
      })
    );
  },
});

const splitArrayInToChunks = function (
  data,
  chunkSize: number = SERVER.CHUNK_SIZE
) {
  return data.chunk_inefficient(chunkSize);
};

const encodeToBase64 = function (value: string) {
  // return btoa(value);
  return new Buffer(value).toString("base64");
};

const getDateWithoutTime = (timestamp) => {
  const date = new Date(timestamp);
  date.setHours(0, 0, 0, 0); // Set hours, minutes, and seconds to 0
  return date.getTime();
};

const decodeBase64 = function (value: string) {
  // return atob(value);
  return Buffer.from(value, "base64").toString("ascii");
};

const getRandomOtp = function (length = 4) {
  return randomstring.generate({ charset: "numeric", length: length });
};

const isValidEmail = function (email: string) {
  return new RegExp(REGEX.EMAIL).test(email);
};

const stringToBoolean = function (value: string) {
  switch (value.toString().toLowerCase().trim()) {
    case "true":
    case "yes":
    case "1":
      return true;
    case "false":
    case "no":
    case "0":
    case null:
      return false;
    default:
      return Boolean(value);
  }
};

const stringReplace = function (value: string) {
  return value.replace(REGEX.STRING_REPLACE, "");
};

const isValidMobileNumber = function (value: string) {
  return new RegExp(REGEX.MOBILE_NUMBER).test(value); // countryCode + mobileNo
};

const deleteFiles = function (filePath) {
  // delete files inside folder but not the folder itself
  del.sync([`${filePath}`, `!${SERVER.UPLOAD_DIR}`]);
  logger.info(TAG, "All files deleted successfully.");
};

const basicAuthFunction = async function (access_token) {
  const credentials = Buffer.from(access_token, "base64").toString("ascii");
  const [username, password] = credentials.split(":");
  if (username !== password) {
    return false;
  }
  return true;
};

const consolelog = (identifier: string, value: any, status: boolean) => {
  try {
    const displayColors = SERVER.DISPLAY_COLORS;
    if (Array.isArray(value)) {
      value.forEach((obj, i) => {
        if (status) {
          console.info(
            displayColors ? "\x1b[31m%s\x1b[0m" : "%s",
            "<--------------" +
              identifier +
              "--------------" +
              i +
              "-------------->",
            obj
          );
        } else {
          console.error(
            displayColors ? "\x1b[31m%s\x1b[0m" : "%s",
            "<--------------" +
              identifier +
              "--------------" +
              i +
              "-------------->",
            obj
          );
        }
      });
      return;
    } else {
      if (status) {
        console.info(
          displayColors ? "\x1b[31m%s\x1b[0m" : "%s",
          "<--------------" + identifier + "-------------->",
          value
        );
      } else {
        console.error(
          displayColors ? "\x1b[31m%s\x1b[0m" : "%s",
          "<--------------" + identifier + "-------------->",
          value
        );
      }
      return;
    }
  } catch (error) {
    console.log("Error in logging console", error);
    return;
  }
};

const passwordGenrator = (len: number) => {
  let length = len || 10;
  let string = GENERATOR.STRING; //to upper
  let numeric = GENERATOR.NUMBER;
  let punctuation = GENERATOR.PUNCTUATION;
  let password = "";
  let character = "";

  while (password.length < length) {
    let entity1 = randomInt(string.length);
    let entity2 = randomInt(numeric.length);
    let entity3 = randomInt(punctuation.length);

    let hold = string.charAt(entity1);
    hold = password.length % 2 == 0 ? hold.toUpperCase() : hold;
    character += hold;
    character += numeric.charAt(entity2);
    character += punctuation.charAt(entity3);
    password = character;
  }

  password = password
    .split("")
    .sort(() => 0.5 - Math.random())
    .join(""); //NOSONAR
  return password.substring(0, len);
};

const matchPassword = async function (
  password: string,
  dbHash: string,
  salt: string
) {
  if (!salt) return false;
  const hash = encryptHashPassword(password, salt);
  if (dbHash !== hash) {
    return false;
  } else return true;
};

const matchOTP = async function (otp: string, redisOTP) {
  if (!redisOTP) return false;
  redisOTP = JSON.parse(redisOTP);
  if (
    SERVER.ENVIRONMENT !== "production"
      ? otp !== SERVER.DEFAULT_OTP && redisOTP.otp !== otp
      : redisOTP.otp !== otp
  ) {
    return false;
  } else return true;
};

const escapeSpecialCharacter = function (value: string) {
  return value.replace(REGEX.SEARCH, "\\$&");
};

export {
  setInsertObject,
  unsetInsertObject,
  buildToken,
  genRandomString,
  encryptHashPassword,
  toObjectId,
  generateMongoId,
  isObjectId,
  failActionFunction,
  splitArrayInToChunks,
  encodeToBase64,
  decodeBase64,
  getRandomOtp,
  isValidEmail,
  stringToBoolean,
  stringReplace,
  isValidMobileNumber,
  deleteFiles,
  basicAuthFunction,
  consolelog,
  passwordGenrator,
  matchPassword,
  matchOTP,
  escapeSpecialCharacter,
  getDateWithoutTime,
};
