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
import { MESSAGE_TYPE, MIME_TYPE, NOTIFICATION_MESSAGE_TYPE, REGEX, SERVER } from "@config/index";
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

const createAndroidPushPayload = function (data) {
	let set = {};
	let fieldsToFill = ["type", "title", "message", "priority", "sound", "image", "contentType", "category", "click_action", "category", "activityId", "userId", "activityName", "activityType", "notesId", "senderId", "receiverId", "requestId", "senderUserName", "senderUserProfilePic", "senderUserType", "rewardType"];

	data.priority = data.priority ? data.priority : "high";
	data.image = data.icon ? data.icon : "";

	set = setInsertObject(data, set, fieldsToFill);

	return {
		body: set,
		notification: {
			"sound": "default",
			"priority": data.priority
		}
	};
};

const createIOSPushPayload = function (data) {
	let set = {};
	let fieldsToFill = ["type", "title", "message", "body", "mutableContent", "threadId", "priority", "sound", "image", "contentType", "category", "activityName", "activityType", "notesId", "category", "activityId", "userId", "senderId", "receiverId", "requestId", "senderUserName", "senderUserProfilePic", "senderUserType", "rewardType"];

	data.mutableContent = 1;
	data.threadId = "Langaroo";
	data.priority = data.priority ? data.priority : "high";
	data.image = data.icon ? data.icon : "";
	data.contentType = "text";
	set = setInsertObject(data, set, fieldsToFill);

	return {
		data: set,
		notification: {
			"title": data.title,
			"body": data.body,
			"sound": "default",
			"priority": data.priority
		}
	};
};

const createWebPushPayload = function (data) {
	let set: any = {};
	const fieldsToFill = ["title", "type", "body", "priority", "sound", "click_action", "icon", "force", "badge", "requireInteraction", "silent"];

	data.icon = data.icon ? data.icon : "https://s3.amazonaws.com/appinventiv-development/ustandby/15644684745409Ri3K.png";
	data.priority = data.priority ? data.priority : "high";
	data.force = data.force ? data.force : true;
	data.badge = data.badge ? data.badge : 1;
	data.requireInteraction = data.requireInteraction ? data.requireInteraction : true;
	data.silent = data.silent ? data.silent : true;
	data.sound = "default";
	set = setInsertObject(data, set, fieldsToFill);
	return {
		data: set,
		notification: {
			"title": data.title,
			"body": data.body,
			"sound": "default",
			"priority": data.priority
		}
	};
};

const calculateAge = function (dob) {
	// 1545578721887 to 24
	dob = new Date(dob);
	const now = new Date();
	const otherDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
	let years = (otherDate.getFullYear() - dob.getFullYear());

	if (otherDate.getMonth() < dob.getMonth() || otherDate.getMonth() === dob.getMonth() && otherDate.getDate() < dob.getDate()) {
		years--;
	}

	return years;
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

const tinyUrl = (url: string) => {
	return new Promise((resolve, reject) => {
		TinyURL.shorten(url, async (response) => {
			resolve(response);
		});
	});
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

const clean = function (object) {
	for (const propName in object) {
		if (object[propName] === null || object[propName] === undefined || object[propName] === "") {
			delete object[propName];
		}
	}
	delete object["createdAt"];
	delete object["updatedAt"];
	return object;
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

const readAndParseJSON = function (json, excelKeyMap) {
	json = _.map(json, (element, elementIndex) => {
		const jsonTemp = {};
		_.each(element, (value, index) => {
			if (value) {
				if (typeof excelKeyMap[index] !== "undefined") {
					if (typeof excelKeyMap[index] === "object") {
						if (typeof jsonTemp[excelKeyMap[index]["parent"]] === "undefined") {
							jsonTemp[excelKeyMap[index]["parent"]] = {};
						}
						jsonTemp[excelKeyMap[index]["parent"]][excelKeyMap[index]["child"]] = value;
					} else {
						jsonTemp[excelKeyMap[index]] = value;
					}
				} else if (typeof excelKeyMap[index] === "undefined") {
					delete excelKeyMap[index];
				} else {
					jsonTemp[index] = value;
				}
			}
		});
		return jsonTemp;
	});
	return json;
};

const stringifyNumber = function (n) {
	const special = ["zeroth", "first", "second", "third", "fourth", "fifth", "sixth", "seventh", "eighth", "ninth", "tenth", "eleventh", "twelvth", "thirteenth", "fourteenth", "fifteenth", "sixteenth", "seventeenth", "eighteenth", "nineteenth"];
	const deca = ["twent", "thirt", "fourt", "fift", "sixt", "sevent", "eight", "ninet"];
	if (n < 20) { return special[n]; }
	if (n % 10 === 0) { return deca[Math.floor(n / 10) - 2] + "ieth"; }
	return deca[Math.floor(n / 10) - 2] + "y-" + special[n % 10];
};

const basicAuthFunction = async function (access_token) {
	const credentials = Buffer.from(access_token, "base64").toString("ascii");
	const [username, password] = credentials.split(":");
	if (username !== password) {
		return false;
	}
	return true;
};

const validateLatLong = function (lat, long) {
	let valid = true;
	if (lat < -90 || lat > 90) {
		valid = false;
	}
	if (long < -180 || long > 180) {
		valid = false;
	}
	return valid;
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

function generateRandomString(length) {
	let result = "";
	const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
	const charactersLength = characters.length;
	for (let i = 0; i < length; i++) {
		result += characters.charAt(Math.floor(Math.random() * charactersLength));
	}
	return result;
}

const isTimeExpired = function (exp) {
	let isTimeExpired = false;
	if (Number(exp) < new Date().getTime()) {
		isTimeExpired = true;
	}
	return isTimeExpired;
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

const encryptData = (text: string) => {
	try {
		const secret = CryptoJS.enc.Utf8.parse(SERVER.ENC);
		const encrypted = CryptoJS.AES.encrypt(text, secret, {
			iv: CryptoJS.enc.Utf8.parse(SERVER.ENC),
			padding: CryptoJS.pad.Pkcs7,
			mode: CryptoJS.mode.CBC
		}).toString();
		return encrypted;
	} catch (error) {
		console.error(error);
		return null;
	}
};

const decryptData = (request: any) => {
	try {
		switch (request.method.toUpperCase()) {
			case "POST":
			case "PUT":
				if (request.payload && request.payload.data) {
					const encrypted = request.payload.data.trim() || "";
					const decipher = CryptoJS.AES.decrypt(encrypted, CryptoJS.enc.Utf8.parse(SERVER.ENC), {
						iv: CryptoJS.enc.Utf8.parse(SERVER.ENC),
						padding: CryptoJS.pad.Pkcs7,
						mode: CryptoJS.mode.CBC
					});
					const decrypted = decipher.toString(CryptoJS.enc.Utf8);
					request.payload = JSON.parse(decrypted) || {};
					return request.payload;
				}
				break;
			default:
				return {};
		}
		return request;
	} catch (error) {
		console.error(error);
		return request;
	}
};

const getValidMediaType = (mediaUrl: string) => {
	try {
		let mediaExtension = mediaUrl.substring(mediaUrl.lastIndexOf(".") + 1, mediaUrl.length);
		mediaExtension = mediaExtension.split("?")[0];

		let mediaType = undefined;
		mimeType.image.map(image => {
			if (image.extension === `.${mediaExtension}`) mediaType = mimeType.image[0].defaultType;
		});
		if (mediaType === undefined) {
			mimeType.video.map(video => {
				if (video.extension === `.${mediaExtension}`) mediaType = mimeType.video[0].defaultType;
			});
		}
		if (mediaType === undefined) {
			mimeType.pdf.map(video => {
				if (video.extension === `.${mediaExtension}`) mediaType = mimeType.pdf[0].defaultType;
			});
		}
		return mediaType;
	} catch (error) {
		throw error;
	}
};

const getDayOfYear = (value: number, timezone: number = 0) => {
	let now: any = new Date(value);
	let start: any = new Date(now.getFullYear(), 0, 0);
	let diff = (now - start) + timezone;
	let oneDay = 1000 * 60 * 60 * 24;
	let day = Math.floor(diff / oneDay);
	return day;
};

const daysBwDates = (value1: number, value2: number, timezone: number = 0) => {
	let date1: any = new Date(value1 + timezone);
	let date2: any = new Date(value2 + timezone);
	const diffTime = Math.abs(date2 - date1);
	const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
	return diffDays;
};

const getTimezoneOffset = (value = 0) => {

	const date = new Date();
	const offset = date.getTimezoneOffset() * (-1);
	return offset * 60 * 1000; // convert in milliseconds
};

const diffBw2Arrays = (arr1, arr2) => {
	return arr1.filter(x => arr2.indexOf(x) === -1);
};

// Function to generate random number  
const randomNumber = (min = 1000, max = 3500) => {
	return Math.floor(Math.random() * (max - min) + min);
};

const filterPermissions = (tokenData: TokenData, sectionId: string, permission: string) => {
	let subAdminPermission = tokenData["permission"].filter(v => v["sectionId"] === sectionId);
	if (subAdminPermission.length) {
		return subAdminPermission[0][`${permission}`];
	}
	return false;
};

const passwordGenrator = (len: number) => {
	let length = (len) ? (len) : (10);
	let string = "abcdefghijklmnopqrstuvwxyz"; //to upper 
	let numeric = '0123456789';
	let punctuation = '@%&*';
	let password = "";
	let character = "";
	while (password.length < length) {
		let entity1 = Math.ceil(string.length * Math.random() * Math.random());
		let entity2 = Math.ceil(numeric.length * Math.random() * Math.random());
		let entity3 = Math.ceil(punctuation.length * Math.random() * Math.random());
		let hold = string.charAt(entity1);
		hold = (password.length % 2 == 0) ? (hold.toUpperCase()) : (hold);
		character += hold;
		character += numeric.charAt(entity2);
		character += punctuation.charAt(entity3);
		password = character;
	}
	password = password.split('').sort(function () { return 0.5 - Math.random() }).join('');
	return password.substr(0, len);
}

const sleep = (millis) => {
	return new Promise(resolve => setTimeout(resolve, millis));
};

const toTitleCase = (str: string, splitBy: string) => {
	return str.split(splitBy)
		.map(w => w[0].toUpperCase() + w.substr(1).toLowerCase())
		.join(' ');
};

const camelCase = (str: string) => {
	return str
		.replace(/\s(.)/g, function (a) {
			return a.toUpperCase();
		})
		.replace(/\s/g, '')
		.replace(/^(.)/, function (b) {
			return b.toLowerCase();
		});
};

const removeDuplicates = (array) => {
	return [... new Set(array)];
};

const getRandomDate = (start = 1592591400000, end = 1592764200000) => {
	return new Date(start + Math.random() * (end - start)).getTime();
};

const matchPassword = async function (password: string, dbHash: string, salt: string) {
	if (!salt) return false;
	const hash = encryptHashPassword(password, salt);
	if (
			dbHash !== hash
	) {
		return false;
	} else
		return true;
};

const matchOTP = async function (otp: string, redisOTP) {
	if (!redisOTP) return false;
	redisOTP = JSON.parse(redisOTP);
	if (
		(SERVER.ENVIRONMENT !== "production") ?
			(
				otp !== SERVER.DEFAULT_OTP &&
				redisOTP.otp !== otp
			) :
			redisOTP.otp !== otp
	) {
		return false;
	} else
		return true;
};

const getLocationByIp = async (ipAddress: string) => {
	try {
		const response = await axios.get(`http://ip-api.com/json/${ipAddress}`, {
			headers: {
				"Content-Type": "application/json"
			}
		});

		return response.data;
	} catch (error) {
		throw error;
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

const getSphericalDistance = (lat1, long1, lat2, long2) => {
	const π = Math.PI;
	const R = 6371e3; // metres
	const φ1 = lat1 * π / 180;
	const φ2 = lat2 * π / 180;
	const Δφ = (lat2 - lat1) * π / 180;
	const Δλ = (long2 - long1) * π / 180;
	const a = (Math.sin(Δφ / 2) * Math.sin(Δφ / 2)) + (Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2));
	const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
	return parseFloat(Number.parseFloat((R * c).toString()).toFixed(1));
};

/**
 * @function genIncidentNo
 * @description combination of INC+YY+MM+DD+3 digits Random No.
 */
const genIncidentNo = () => {
	const year = new Date().getFullYear();
	const month = ((new Date().getMonth() + 1) < 10) ? "0" + (new Date().getMonth() + 1) : (new Date().getMonth() + 1);
	const day = (new Date().getDate() < 10) ? "0" + new Date().getDate() : new Date().getDate();
	return "INC" + year + month + day + randomstring.generate({ length: 3, charset: "numeric" });
};

const startOfWeek = (date) => {
	const diff = date.getDate() - date.getDay() + (date.getDay() === 0 ? -6 : 1);
	return new Date(date.setDate(diff));
};

const endOfWeek = (date) => {
	const lastday = date.getDate() - (date.getDay() - 1) + 6;
	return new Date(new Date(date.setDate(lastday)).setHours(23, 59, 59, 999));
};

const startOfMonth = () => {
	const date = new Date();
	return new Date(date.getFullYear(), date.getMonth(), 1);
};

const endOfMonth = () => {
	const today = new Date();
	return new Date(today.getFullYear(), today.getMonth() + 1, 0);
};

  const fetchSecreteKeys = (async () => {
	const ENVIRONMENT = process.env.NODE_ENV.trim();
	if(ENVIRONMENT==="production" || ENVIRONMENT=== "preprod") {
		console.log("============= secrete manager loaded successfully =============")
	}
})

const messageTypeInChat = (messageType: string) => {
	try {
		if (messageType == MESSAGE_TYPE.IMAGE) {
			return NOTIFICATION_MESSAGE_TYPE.IMAGE;
		} else if (messageType == MESSAGE_TYPE.DOCS) {
			return NOTIFICATION_MESSAGE_TYPE.DOCS;
		} else if (messageType == MESSAGE_TYPE.VOICE) {
			return NOTIFICATION_MESSAGE_TYPE.VOICE;
		} else if (messageType == MESSAGE_TYPE.VIDEO) {
			return NOTIFICATION_MESSAGE_TYPE.VIDEO;
		} else if (messageType == MESSAGE_TYPE.LOCATION) {
			return NOTIFICATION_MESSAGE_TYPE.LOCATION;
		} else if (messageType == MESSAGE_TYPE.STICKER) {
			return NOTIFICATION_MESSAGE_TYPE.STICKER;
		}else  {
			return MESSAGE_TYPE.TEXT
		}
	} catch (error) {
		throw error
	}
}

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
	createAndroidPushPayload,
	createIOSPushPayload,
	createWebPushPayload,
	calculateAge,
	convertStringToRegExp,
	convertRegExpToString,
	CryptDataMD5,
	encodeToBase64,
	decodeBase64,
	tinyUrl,
	getRandomOtp,
	isValidEmail,
	stringToBoolean,
	stringReplace,
	isValidMobileNumber,
	clean,
	convertTimestampToDate,
	convertStringTimeToTimestamp,
	excelFilter,
	getDynamicName,
	deleteFiles,
	readAndParseJSON,
	stringifyNumber,
	basicAuthFunction,
	validateLatLong,
	timeConversion,
	generateRandomString,
	isTimeExpired,
	mailAttachments,
	consolelog,
	encryptData,
	decryptData,
	getValidMediaType,
	getDayOfYear,
	daysBwDates,
	getTimezoneOffset,
	diffBw2Arrays,
	randomNumber,
	filterPermissions,
	passwordGenrator,
	sleep,
	toTitleCase,
	removeDuplicates,
	getRandomDate,
	camelCase,
	matchPassword,
	matchOTP,
	getLocationByIp,
	mediaType,
	escapeSpecialCharacter,
	getSphericalDistance,
	genIncidentNo,
	startOfWeek,
	endOfWeek,
	startOfMonth,
	endOfMonth,
	fetchSecreteKeys,
	messageTypeInChat
};