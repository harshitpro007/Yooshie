"use strict";

import * as _ from "lodash";
import axios from "axios";
import * as Boom from "boom";
import { createHmac, randomBytes } from "crypto";
const CryptoJS = require("crypto-js");
import * as del from "del";
import { Request, ResponseToolkit } from "@hapi/hapi";
import * as MD5 from "md5";
import * as mongoose from "mongoose";
import * as randomstring from "randomstring";
import * as path from "path";
import * as TinyURL from "tinyurl";

import * as mimeType from "@json/mime-type.json";
import { MIME_TYPE, REGEX, SERVER } from "@config/index";
import { logger } from "@lib/logger";
const TAG = "langaroo-uploads";


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
		"userId": payload.userId || payload["_id"],
		"name": payload.name || undefined,
		"firstName": payload.firstName || undefined,
		"lastName": payload.lastName || undefined,
		"email": payload.email,
		"countryCode": payload.countryCode || undefined,
		"mobileNo": payload.mobileNo || undefined,
		"userType": payload.userType || payload["aud"],
		"salt": payload.salt || undefined,
		"profilePicture": payload.profilePicture || undefined,
		"profileSteps": payload.profileSteps || undefined,
		"isApproved": payload.isApproved || undefined, // optional
		"created": payload.created || undefined, // optional
		"platform": payload.platform,
		"deviceId": payload.deviceId
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
		.slice(0, length);   /** return required number of characters */
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

const failActionFunction = async function (request: Request, h: ResponseToolkit, error: any) {
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
		return [].concat.apply([], array.map(function (elem, i) {
			return i % chunkSize ? [] : [array.slice(i, i + chunkSize)];
		}));
	}
});

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

function generateRandomString(length) {
	let result = "";
	const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
	const charactersLength = characters.length;
	for (let i = 0; i < length; i++) {
		result += characters.charAt(Math.floor(Math.random() * charactersLength));
	}
	return result;
}

const consolelog = (identifier: string, value: any, status: boolean) => {
	try {
		const displayColors = SERVER.DISPLAY_COLORS;
		if (Array.isArray(value)) {
			value.forEach((obj, i) => {
				if (status) {
					console.info(displayColors ? "\x1b[31m%s\x1b[0m" : "%s", "<--------------" + identifier + "--------------" + i + "-------------->", obj);
				} else {
					console.error(displayColors ? "\x1b[31m%s\x1b[0m" : "%s", "<--------------" + identifier + "--------------" + i + "-------------->", obj);
				}
			});
			return;
		} else {
			if (status) {
				console.info(displayColors ? "\x1b[31m%s\x1b[0m" : "%s", "<--------------" + identifier + "-------------->", value);
			} else {
				console.error(displayColors ? "\x1b[31m%s\x1b[0m" : "%s", "<--------------" + identifier + "-------------->", value);
			}
			return;
		}
	} catch (error) {
		console.log("Error in logging console", error);
		return;
	}
};

// Function to generate random number  
const randomNumber = (min = 1000, max = 3500) => {
	return Math.floor(Math.random() * (max - min) + min);
};

const escapeSpecialCharacter = function (value: string) {
	return value.replace(REGEX.SEARCH, '\\$&');
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
	stringToBoolean,
	deleteFiles,
	basicAuthFunction,
	generateRandomString,
	consolelog,
	randomNumber,
	escapeSpecialCharacter,
};