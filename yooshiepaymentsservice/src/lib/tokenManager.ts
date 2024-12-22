"use strict";

import { Types } from 'mongoose';
import { readFile } from "fs";
import { Request } from "@hapi/hapi";
import { promisify } from "util";

import { MESSAGES, USER_TYPE, SERVER } from "@config/index";
import { responseHandler } from "@utils/ResponseHandler";
import { logger } from "@lib/logger";
let Jwt = require('jsonwebtoken');


function readPrivateKey(): Promise<string> {
	return promisify(readFile)(SERVER.JWT_PRIVATE_KEY, "utf8");
}

function readPublicKey(): Promise<string> {
	return promisify(readFile)(SERVER.JWT_PUBLIC_KEY, "utf8");
}

const encode = async function (payload: JwtPayload): Promise<string> {
	const cert = await readPrivateKey();
	if (!cert) return Promise.reject(MESSAGES.ERROR.TOKEN_GENERATE_ERROR);
	if (payload.exp) payload.exp = Math.floor((Date.now() + payload.exp) / 1000);
	if (payload.deviceId === "") delete payload.deviceId;
	return await Jwt.sign(payload, cert, { algorithm: SERVER.JWT_ALGO });
};

/**
 * @description This method checks the token and returns the decoded data when token is valid in all respect
 */
const validate = async function (token: string, request?: Request, auth: boolean = true): Promise<JwtPayload> {
	try {
		const cert = await readPublicKey();
		return await Jwt.verify(token,cert);

	} catch (error) {

		if (error && error.name === "TokenExpiredError" && auth) return Promise.reject(responseHandler.sendError(request, MESSAGES.ERROR.SESSION_EXPIRED));
		if (error && error.name === "TokenExpiredError" && !auth) return Promise.reject(MESSAGES.ERROR.TOKEN_EXPIRED);
		// throws error if the token has not been encrypted by the private key
		return Promise.reject(responseHandler.sendError(request, MESSAGES.ERROR.BAD_TOKEN));
	}
};


/**
 * @description This method checks the token and returns the decoded data when token is valid in all respect
 */
const validateAdmin = async function (token: string, request?: Request, auth: boolean = true): Promise<JwtPayload> {
	try {
		const cert = await readPublicKey();
		return await Jwt.verify(token,cert);

	} catch (error) {

		if (error && error.name === "TokenExpiredError" && auth) return Promise.reject(MESSAGES.ERROR.SESSION_EXPIRED);
		if (error && error.name === "TokenExpiredError" && !auth) return Promise.reject(MESSAGES.ERROR.TOKEN_EXPIRED);
		// throws error if the token has not been encrypted by the private key
		return Promise.reject(responseHandler.sendError(request, MESSAGES.ERROR.BAD_TOKEN));
	}
};
/**
 * @description Returns the decoded payload if the signature is valid even if it is expired
 */
const decode = async function (token: string, request?: Request, auth: boolean = true): Promise<JwtPayload> {
	try {
		const cert = await readPublicKey();
		return await Jwt.verify(token,cert,{ ignoreExpiration: true })

	} catch (error) {
		logger.error(error);
		if (error && error.name && auth) return Promise.reject(responseHandler.sendError(request, MESSAGES.ERROR.BAD_TOKEN));
		if (error && error.name && !auth) return Promise.reject(MESSAGES.ERROR.BAD_TOKEN);
		return Promise.reject(responseHandler.sendError(request, MESSAGES.ERROR.BAD_TOKEN));
	}
};



const createToken = async (
	data: {
		userId: string,
		deviceId?: string,
		accessTokenKey: string,
		type: string,
		userType: string
	}
): Promise<string> => {
	const accessToken = await encode({
		iss: SERVER.TOKEN_INFO.ISSUER,
		aud: data.userType,
		sub: data.userId.toString(),
		deviceId: data.deviceId,
		iat: Math.floor(Date.now() / 1000),
		exp: SERVER.TOKEN_INFO.EXPIRATION_TIME[data.type],
		prm: data.accessTokenKey
	});

	if (!accessToken) return Promise.reject(MESSAGES.ERROR.TOKEN_GENERATE_ERROR);

	return accessToken;
};

const createRefreshToken = async (
	data: {
		userId: string,
		deviceId?: string,
		accessTokenKey: string,
		type: string,
		userType: string
	}
): Promise<string> => {
	const refreshToken = await encode({
		iss: SERVER.TOKEN_INFO.ISSUER,
		aud: data.userType,
		sub: data.userId.toString(),
		deviceId: data.deviceId,
		iat: Math.floor(Date.now() / 1000),
		exp: SERVER.TOKEN_INFO.EXPIRATION_TIME.USER_REFRESH_TOKEN,
		prm: data.accessTokenKey
	});

	if (!refreshToken) return Promise.reject(MESSAGES.ERROR.TOKEN_GENERATE_ERROR);

	return refreshToken;
};

const validateTokenData = async (payload: JwtPayload, request?: Request, auth: boolean = true): Promise<boolean> => {
	if (
		!payload ||
		!payload.iss ||
		!payload.aud ||
		!payload.sub ||
		!payload.prm ||
		[USER_TYPE.ADMIN, USER_TYPE.USER].indexOf(payload.aud) === -1 ||
		!Types.ObjectId.isValid(payload.sub)
	) {
		if (auth) return Promise.reject(responseHandler.sendError(request, MESSAGES.ERROR.BAD_TOKEN));
		if (!auth) return Promise.reject(MESSAGES.ERROR.BAD_TOKEN);
	}
	return true;
};

const generateAdminToken = async function (params) {
	try {
		const cert = await readPrivateKey();
		if (!cert) return Promise.reject(MESSAGES.ERROR.TOKEN_GENERATE_ERROR);
		if (params.type === "CREATE_ADMIN" || params.type === "FORGOT_PASSWORD") {
			return await Jwt.sign({"accessToken": params.object}, cert, { algorithm: SERVER.JWT_ALGO, expiresIn: (SERVER.TOKEN_INFO.EXPIRATION_TIME.FORGOT_PASSWORD / 1000) }); // 10 min
		} else if (params.type === "ADMIN_LOGIN") {
			return await Jwt.sign({"accessToken": params.object}, cert, { algorithm: SERVER.JWT_ALGO, expiresIn: SERVER.TOKEN_INFO.EXPIRATION_TIME.ADMIN_LOGIN / 1000 }); // 180 days (in secs)
		}
	} catch (error) {
		return Promise.reject(responseHandler.sendError({}, MESSAGES.ERROR.TOKEN_GENERATE_ERROR));
	}
};


export {
	encode,
	validate,
	decode,
	createToken,
	validateTokenData,
	validateAdmin,
	generateAdminToken,
	createRefreshToken
};