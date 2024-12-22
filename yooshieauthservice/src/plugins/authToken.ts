"use strict";

import * as AuthBearer from "hapi-auth-bearer-token";
import { Request, ResponseToolkit } from "@hapi/hapi";

import {
	userControllerV1,
	userDaoV1
} from "@modules/user/index";
import { loginHistoryDao } from "@modules/loginHistory/index"

import { buildToken } from "@utils/appUtils";
import { MESSAGES, STATUS, USER_TYPE, SERVER } from "@config/index";
import { redisClient } from "@lib/redis/RedisClient";
import { responseHandler } from "@utils/ResponseHandler";
import { decode, validate, validateTokenData } from "@lib/tokenManager";

// Register Authorization Plugin
export const plugin = {
	name: "auth-token-plugin",
	register: async function (server) {
		await server.register(AuthBearer);

		/**
		 * @function AdminAuth
		 */
		server.auth.strategy("AdminAuth", "bearer-access-token", {
			allowQueryToken: false,
			allowMultipleHeaders: true,
			accessTokenName: "accessToken",
			validate: async (request: Request, accessToken: string, h: ResponseToolkit) => {
				try {
					const isValid = await apiKeyFunction(request.headers.api_key);
					if (!isValid) {
						return ({ isValid: false, credentials: { accessToken: accessToken, tokenData: {} } });
					} else {
						const payload = await validate(accessToken, request);
						const userData = await userDaoV1.findUserById(payload.sub);
						if (!userData) return Promise.reject(responseHandler.sendError(request, MESSAGES.ERROR.BAD_TOKEN));
						if (userData.status === STATUS.BLOCKED) {
							await loginHistoryDao.removeDeviceById({ "userId": payload.sub });
							return Promise.reject(responseHandler.sendError(request, MESSAGES.ERROR.BLOCKED));
						} else {
							const step1 = await loginHistoryDao.findDeviceById({ "userId": payload.sub, "deviceId": payload.deviceId, "salt": payload.prm, isLogin:true });
							if (!step1) return Promise.reject(responseHandler.sendError(request, MESSAGES.ERROR.SESSION_EXPIRED));
							return { isValid: true, credentials: { "accessToken": accessToken, "tokenData": buildToken({ ...step1, ...userData }) } };
						}
					}
				} catch (error) {
					throw error;
				}
			}
		});

		/**
		 * @function UserAuth
		 */
		server.auth.strategy("UserAuth", "bearer-access-token", {
			allowQueryToken: false,
			allowMultipleHeaders: true,
			accessTokenName: "accessToken",
			allowChaining: false,
			validate: async (request: Request, accessToken: string, h: ResponseToolkit) => {
				try {
					const isValid = await apiKeyFunction(request.headers.api_key);
					if (!isValid) {
						return ({ isValid: false, credentials: { accessToken: accessToken, tokenData: {} } });
					} else {
						const payload = await validate(accessToken, request);
						if(payload?.sub){
							const user = await userDaoV1.findUserById(payload.sub);
							if(!user){
								await redisClient.deleteKey(`${payload.sub}.${payload.deviceId}`);
								return Promise.reject(responseHandler.sendError(request, MESSAGES.ERROR.SESSION_EXPIRED))
							}
						}
						await validateTokenData(payload, request);
						if (SERVER.IS_REDIS_ENABLE) {
							let userData: any = await redisClient.getValue(`${payload.sub}.${payload.deviceId}`);
							userData = JSON.parse(userData);
							let step1;
							if (!userData) {
								userData = await userDaoV1.findUserById(payload.sub);
								step1 = await loginHistoryDao.findDeviceById({ "userId": payload.sub, "deviceId": payload.deviceId, "salt": payload.prm, isLogin: true });
								if (!userData || !step1) return Promise.reject(responseHandler.sendError(request, MESSAGES.ERROR.SESSION_EXPIRED));
							}
							if (step1 && (step1.salt.toString() !== payload.prm.toString())) return Promise.reject(responseHandler.sendError(request, MESSAGES.ERROR.SESSION_EXPIRED));
							const tokenData = buildToken({ ...step1, ...userData });
							if (userData.status === STATUS.BLOCKED) {
								await userControllerV1.removeSession(tokenData, true);
								return Promise.reject(responseHandler.sendError(request, MESSAGES.ERROR.BLOCKED));
							} else
								return { isValid: true, credentials: { "accessToken": accessToken, "tokenData": tokenData } };
						} else {
							const userData = await userDaoV1.findUserById(payload.sub);
							if (!userData) return Promise.reject(responseHandler.sendError(request, MESSAGES.ERROR.BAD_TOKEN));
							if (userData.status === STATUS.BLOCKED) {
								await userControllerV1.removeSession({ "userId": payload.sub, "deviceId": payload.deviceId }, true);
								return Promise.reject(responseHandler.sendError(request, MESSAGES.ERROR.BLOCKED));
							} else {
								delete userData.salt;
								const step1 = await loginHistoryDao.findDeviceById({ "userId": payload.sub, "deviceId": payload.deviceId, "salt": payload.prm });
								if (!step1) return Promise.reject(responseHandler.sendError(request, MESSAGES.ERROR.SESSION_EXPIRED));
								return { isValid: true, credentials: { "accessToken": accessToken, "tokenData": buildToken({ ...step1, ...userData }) } };
							}
						}
					}
				} catch (error) {
					throw error;
				}
			}
		});

		/**
		 * @function CommonAuth -: conbination of both admin auth and user auth
		 */
		server.auth.strategy("CommonAuth", "bearer-access-token", {
			allowQueryToken: false,
			allowMultipleHeaders: true,
			accessTokenName: "accessToken",
			validate: async (request: Request, accessToken: string, h: ResponseToolkit) => {
				try {
					const isValid = await apiKeyFunction(request.headers.api_key);
					if (!isValid) {
						return ({ isValid: false, credentials: { accessToken: accessToken, tokenData: {} } });
					} else {
						const userType = (await decode(accessToken, request)).aud;
						switch (userType) {
							case USER_TYPE.ADMIN: {
								const payload = await validate(accessToken, request);
								const userData = await userDaoV1.findUserById(payload.sub);
								if (!userData) return Promise.reject(responseHandler.sendError(request, MESSAGES.ERROR.BAD_TOKEN));
								if (userData.status === STATUS.BLOCKED) {
									await loginHistoryDao.removeDeviceById({ "userId": payload.sub });
									return Promise.reject(responseHandler.sendError(request, MESSAGES.ERROR.BLOCKED));
								} else {
									const step1 = await loginHistoryDao.findDeviceById({ "userId": payload.sub, "deviceId": payload.deviceId, "salt": payload.prm });
									if (!step1) return Promise.reject(responseHandler.sendError(request, MESSAGES.ERROR.SESSION_EXPIRED));
									return { isValid: true, credentials: { "accessToken": accessToken, "tokenData": buildToken({ ...step1, ...userData }) } };
								}
							}
							case USER_TYPE.ASSISTANT: {
								const payload = await validate(accessToken, request);
								const userData = await userDaoV1.findUserById(payload.sub);
								if (!userData) return Promise.reject(responseHandler.sendError(request, MESSAGES.ERROR.BAD_TOKEN));
								if (userData.status === STATUS.BLOCKED) {
									await loginHistoryDao.removeDeviceById({ "userId": payload.sub });
									return Promise.reject(responseHandler.sendError(request, MESSAGES.ERROR.BLOCKED));
								} else {
									const step1 = await loginHistoryDao.findDeviceById({ "userId": payload.sub, "deviceId": payload.deviceId, "salt": payload.prm });
									if (!step1) return Promise.reject(responseHandler.sendError(request, MESSAGES.ERROR.SESSION_EXPIRED));
									return { isValid: true, credentials: { "accessToken": accessToken, "tokenData": buildToken({ ...step1, ...userData }) } };
								}
							}
							case USER_TYPE.USER: {
								const payload = await validate(accessToken, request);
								if(payload?.sub){
									const user = await userDaoV1.findUserById(payload.sub);
									if(!user){
										await redisClient.deleteKey(`${payload.sub}.${payload.deviceId}`);
										return Promise.reject(responseHandler.sendError(request, MESSAGES.ERROR.SESSION_EXPIRED))
									}
								}
								
								if (SERVER.IS_REDIS_ENABLE) {
									let userData: any = await redisClient.getValue(`${payload.sub}.${payload.deviceId}`);
									userData = JSON.parse(userData);
									let step1;
									if (!userData) {
										userData = await userDaoV1.findUserById(payload.sub);
										step1 = await loginHistoryDao.findDeviceById({ "userId": payload.sub, "deviceId": payload.deviceId, "salt": payload.prm });
										if (!userData || !step1) return Promise.reject(responseHandler.sendError(request, MESSAGES.ERROR.SESSION_EXPIRED));
									}
									if (userData.salt !== payload.prm) return Promise.reject(responseHandler.sendError(request, MESSAGES.ERROR.SESSION_EXPIRED));
									const tokenData = buildToken({ ...step1, ...userData });
									if (userData.status === STATUS.BLOCKED) {
										await userControllerV1.removeSession(tokenData, true);
										return Promise.reject(responseHandler.sendError(request, MESSAGES.ERROR.BLOCKED));
									} else
										return { isValid: true, credentials: { "accessToken": accessToken, "tokenData": tokenData } };
								} else {
									const userData = await userDaoV1.findUserById(payload.sub);
									if (!userData){
										await redisClient.deleteKey(`${payload.sub}.${payload.deviceId}`);
										return Promise.reject(responseHandler.sendError(request, MESSAGES.ERROR.BAD_TOKEN));
									} 
									if (userData.status === STATUS.BLOCKED) {
										await userControllerV1.removeSession({ "userId": payload.sub, "deviceId": payload.deviceId }, true);
										return Promise.reject(responseHandler.sendError(request, MESSAGES.ERROR.BLOCKED));
									} else {
										delete userData.salt;
										const step1 = await loginHistoryDao.findDeviceById({ "userId": payload.sub, "deviceId": payload.deviceId, "salt": payload.prm });
										if (!step1) return Promise.reject(responseHandler.sendError(request, MESSAGES.ERROR.SESSION_EXPIRED));
										return { isValid: true, credentials: { "accessToken": accessToken, "tokenData": buildToken({ ...step1, ...userData }) } };
									}
								}
							}
						}
					}
				} catch (error) {
					throw error;
				}
			}
		});

		await server.register(require("hapi-auth-basic"));

		/**
		 * @function BasicAuth
		 */
		server.auth.strategy("BasicAuth", "bearer-access-token", {
			tokenType: "Basic",
			validate: async (request: Request, token, h: ResponseToolkit) => {
				// validate user and pwd here
				const checkFunction = await basicAuthFunction(token);
				if (!checkFunction) {
					return ({ isValid: false, credentials: { token, userData: {} } });
				}
				return ({ isValid: true, credentials: { token, userData: {} } });
			}
		});

		/**
		 * @function DoubleAuth -: conbination of both basic auth and user auth
		 */
		server.auth.strategy("DoubleAuth", "bearer-access-token", {
			allowQueryToken: false,
			allowMultipleHeaders: true,
			validate: async (request: Request, accessToken, h: ResponseToolkit) => {
				const checkFunction = await basicAuthFunction(accessToken);
				if (checkFunction) {
					return ({ isValid: true, credentials: { token: accessToken, userData: {} } });
				}
			}
		});

	}
};

const apiKeyFunction = async function (apiKey) {
	try {
		return (apiKey === SERVER.API_KEY);
	} catch (error) {
		throw error;
	}
};

const basicAuthFunction = async function (accessToken) {
	const credentials = Buffer.from(accessToken, "base64").toString("ascii");
	const [username, password] = credentials.split(":");
	if (username !== SERVER.BASIC_AUTH.NAME || password !== SERVER.BASIC_AUTH.PASS) { return false; }
	return true;
};