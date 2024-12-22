"use strict";

import * as AuthBearer from "hapi-auth-bearer-token";
import { Request, ResponseToolkit } from "@hapi/hapi";

import { MESSAGES, SERVER } from "@config/index";
import { responseHandler } from "@utils/ResponseHandler";
import { logger } from "@lib/index";
import { axiosService } from "@lib/axiosService";

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
					const isValidApiKey = await apiKeyFunction(request.headers.api_key);
					if (!isValidApiKey) {
						return { isValid: false, credentials: { accessToken: accessToken, tokenData: {} } };
					} else {
						try {
							const payload = await axiosService.getData({ "url": process.env.AUTH_APP_URL + SERVER.VERIFY_ADMIN_AUTH_TOKEN, "body": {}, "auth": 'Bearer ' + accessToken });
							payload["credentials"]["tokenData"]["userId"] = payload.data.sub;
							return { isValid: true, credentials: { "accessToken": payload.credentials.accessToken, "tokenData": payload.credentials.tokenData } };
						} catch (e) {
							console.log("e.response.data.error === >", e);
							if (e.type == "SESSION_EXPIRED") {
								return Promise.reject(responseHandler.sendError(request, MESSAGES.ERROR.SESSION_EXPIRED));
							}
							if (e.type == "BAD_TOKEN") {
								return Promise.reject(responseHandler.sendError(request, MESSAGES.ERROR.BAD_TOKEN));
							}
						}
					}
				} catch (error) {
					logger.error(error);
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
					const isValidApiKey = await apiKeyFunction(request.headers.api_key);

					if (!isValidApiKey) {
						return { isValid: false, credentials: { accessToken: accessToken, tokenData: {} } };
					} else {
						try {
							const payload = await axiosService.getData({"url":process.env.AUTH_APP_URL+SERVER.VERIFY_AUTH_TOKEN, "body":{}, auth: 'Bearer '+accessToken });
							return { isValid: true, credentials: { "accessToken": payload.credentials.accessToken, "tokenData": payload.credentials.tokenData } };

						} catch (e){
							console.log("e.response.data.error === >",e);
							// return MESSAGES.ERROR.BAD_TOKEN
							if(e.type == "SESSION_EXPIRED"){
								return Promise.reject(responseHandler.sendError(request, MESSAGES.ERROR.SESSION_EXPIRED));
							}
							if(e.type == "BAD_TOKEN"){
								return Promise.reject(responseHandler.sendError(request, MESSAGES.ERROR.BAD_TOKEN));
							}
						}
					}
				} catch (error) {
					logger.error(error);
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
					const isValidApiKey = await apiKeyFunction(request.headers.api_key);

					if (!isValidApiKey) {
						return { isValid: false, credentials: { accessToken: accessToken, tokenData: {} } };
					} else {
						try {
							const payload = await axiosService.getData({"url":process.env.AUTH_APP_URL+SERVER.VERIFY_COMMON_AUTH_TOKEN, "body":{}, auth: 'Bearer '+accessToken });
							return { isValid: true, credentials: { "accessToken": payload.credentials.accessToken, "tokenData": payload.credentials.tokenData } };

						} catch (e){
							console.log("e.response.data.error === >",e);
							// return MESSAGES.ERROR.BAD_TOKEN
							if(e.type == "SESSION_EXPIRED"){
								return Promise.reject(responseHandler.sendError(request, MESSAGES.ERROR.SESSION_EXPIRED));
							}
							if(e.type == "BAD_TOKEN"){
								return Promise.reject(responseHandler.sendError(request, MESSAGES.ERROR.BAD_TOKEN));
							}
						}
					}
				} catch (error) {
					logger.error(error);
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