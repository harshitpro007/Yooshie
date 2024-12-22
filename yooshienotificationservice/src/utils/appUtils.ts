"use strict";

import * as _ from "lodash";
import axios from "axios";
import Boom from "boom";
import { createHmac, randomBytes, randomInt } from "crypto";
const CryptoJS = require("crypto-js");
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

const splitArrayInToChunks = function (data, chunkSize: number = SERVER.CHUNK_SIZE) {
	return data.chunk_inefficient(chunkSize);
};

const convertStringToRegExp = function (value: string) {
	return new RegExp(value);
};

const convertRegExpToString = function (value) {
	return value.source;
};

const CryptDataMD5 = function (stringToCrypt: string) {
	return MD5(stringToCrypt);
};

const encodeToBase64 = function (value: string) {
	// return btoa(value);
	return new Buffer(value).toString("base64");
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

const isValidMobileNumber = function (value: string) {
	return new RegExp(REGEX.MOBILE_NUMBER).test(value); // countryCode + mobileNo
};

const convertTimestampToDate = function (value: number) {
	// 1545868800000 to 01-01-2019
	const year = new Date(value).getFullYear();
	const month = ((new Date(value).getMonth() + 1) < 10) ? "0" + (new Date(value).getMonth() + 1) : (new Date(value).getMonth() + 1);
	const day = (new Date(value).getDate() < 10) ? "0" + new Date(value).getDate() : new Date(value).getDate();

	return month + "-" + day + "-" + year;
};

const convertStringTimeToTimestamp = function (value: string) {
	const hours = Number(value.split(":")[0]);
	const minutes = Number(value.split(":")[1]);

	return (hours * 60 * 60 * 1000) + (minutes * 60 * 1000);
};

const excelFilter = function (fileName: string) {
	// accept image only
	if (!fileName.toLowerCase().match(/\.(csv|xlsx|xls)$/)) {
		return false;
	}
	return true;
};

const getDynamicName = function (file) {
	return file.hapi ? (new Date().getTime() + "_" + randomstring.generate(5) + path.extname(file.hapi.filename)) : (new Date().getTime() + "_" + randomstring.generate(5) + path.extname(file.filename));
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

function timeConversion(value) {
	const seconds: number = Number((value / 1000).toFixed(0));
	const minutes: number = Number((value / (1000 * 60)).toFixed(0));
	const hours: number = Number((value / (1000 * 60 * 60)).toFixed(0));
	const days: number = Number((value / (1000 * 60 * 60 * 24)).toFixed(0));

	if (seconds < 60) {
		return seconds + " Sec";
	} else if (minutes < 60) {
		return minutes + " Minutes";
	} else if (hours < 24) {
		return hours + " Hrs";
	} else {
		return days + " Days";
	}
};

const mailAttachments = function (payload) {
	switch (payload.type) {
		case "xlsx":
			return [
				{
					filename: new Date().getTime() + ".xlsx",
					content: payload.data,
					contentType: MIME_TYPE.CSV2
				}
			];
		case "csv":
			return [
				{
					filename: payload.url.split("/").slice(-1)[0],
					path: payload.url,
					cid: payload.url.split("/").slice(-1)[0],
					contentType: payload.file.hapi.headers["content-type"]
				}
			];
	}
};

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

/**
 * @function mediaType
 * @description return all unique media types (AUDIO/VIDEO/IMAGE/CSV)
 */
const mediaType = () => {
	const mimeTypes = [];
	for (const e in mimeType) {
		mimeTypes.push(...new Set(mimeType[e].map(v => v.defaultType)));
	}
	return mimeTypes;
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
	splitArrayInToChunks,
	convertStringToRegExp,
	convertRegExpToString,
	CryptDataMD5,
	encodeToBase64,
	decodeBase64,
	getRandomOtp,
	isValidEmail,
	isValidMobileNumber,
	convertTimestampToDate,
	convertStringTimeToTimestamp,
	excelFilter,
	getDynamicName,
	deleteFiles,
	basicAuthFunction,
	timeConversion,
	mailAttachments,
	consolelog,
	mediaType,
	stringToBoolean,
	escapeSpecialCharacter,
};