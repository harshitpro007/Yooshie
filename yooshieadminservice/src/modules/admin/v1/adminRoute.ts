"use strict";

import { Request, ResponseToolkit } from "@hapi/hapi";

import { adminControllerV1 } from "@modules/admin/index";

import { failActionFunction } from "@utils/appUtils";
import { authorizationHeaderObj, headerObject } from "@utils/validator";
import {
	SWAGGER_DEFAULT_RESPONSE_MESSAGES,
	SERVER,
} from "@config/index";
import { responseHandler } from "@utils/ResponseHandler";
import { validateResetToken } from "@lib/index";
import { changePassword, editProfile, forgotPassword, login, preSignedURL, resetPassword } from "./routeValidate";
export const adminRoute = [
	{
		method: "POST",
		path: `${SERVER.API_BASE_URL}/v1/admin/login`,
		handler: async (request: Request | any, h: ResponseToolkit) => {
			try {
				const headers = request.headers;
				const payload: AdminRequest.Login = request.payload;
				payload.remoteAddress = request["headers"]["x-forwarded-for"] || request.info.remoteAddress;
				const result = await adminControllerV1.login({ ...headers, ...payload });
				return responseHandler.sendSuccess(h, result);
			} catch (error) {
				return responseHandler.sendError(request, error);
			}
		},
		config: {
			tags: ["api", "admin"],
			description: "Admin Login",
			auth: {
				strategies: ["BasicAuth"]
			},
			validate: {
				headers: headerObject["required"],
				payload: login,
				failAction: failActionFunction
			},
			plugins: {
				"hapi-swagger": {
					responseMessages: SWAGGER_DEFAULT_RESPONSE_MESSAGES
				}
			}
		}
	},
	{
		method: "POST",
		path: `${SERVER.API_BASE_URL}/v1/admin/logout`,
		handler: async (request: Request | any, h: ResponseToolkit) => {
			try {
				const tokenData: TokenData = request.auth?.credentials?.tokenData;
				const result = await adminControllerV1.logout(tokenData);
				return responseHandler.sendSuccess(h, result);
			} catch (error) {
				return responseHandler.sendError(request, error);
			}
		},
		config: {
			tags: ["api", "admin"],
			description: "Logout",
			auth: {
				strategies: ["AdminAuth"]
			},
			validate: {
				headers: authorizationHeaderObj,
				failAction: failActionFunction
			},
			plugins: {
				"hapi-swagger": {
					responseMessages: SWAGGER_DEFAULT_RESPONSE_MESSAGES
				}
			}
		}
	},
	{
		method: "POST",
		path: `${SERVER.API_BASE_URL}/v1/admin/forgot-password`,
		handler: async (request: Request | any, h: ResponseToolkit) => {
			try {
				const payload: AdminRequest.ForgotPasswordRequest = request.payload;
				const result = await adminControllerV1.forgotPassword(payload);
				return responseHandler.sendSuccess(h, result);
			} catch (error) {
				return responseHandler.sendError(request, error);
			}
		},
		config: {
			tags: ["api", "admin"],
			description: "Forgot Password",
			auth: {
				strategies: ["BasicAuth"]
			},
			validate: {
				headers: headerObject["required"],
				payload: forgotPassword,
				failAction: failActionFunction
			},
			plugins: {
				"hapi-swagger": {
					responseMessages: SWAGGER_DEFAULT_RESPONSE_MESSAGES
				},
				"hapi-rate-limit": {
                    userLimit: 5, // Customize rate limit as per your requirement
                    duration: 60000, // 1 minute duration
                }
			}
		}
	},
	{
		method: "POST",
		path: `${SERVER.API_BASE_URL}/v1/admin/reset-password`,
		handler: async (request: Request | any, h: ResponseToolkit) => {
			try {
				const payload: AdminRequest.ChangeForgotPassword = request.payload;
				const tokenData = await validateResetToken(payload.token, request, false)
				const result = await adminControllerV1.resetPassword(payload, tokenData);
				return responseHandler.sendSuccess(h, result);
			} catch (error) {
				return responseHandler.sendError(request, error);
			}
		},
		config: {
			tags: ["api", "admin"],
			description: "Reset Password After forgot password",
			auth: {
				strategies: ["BasicAuth"]
			},
			validate: {
				headers: headerObject["required"],
				payload: resetPassword,
				failAction: failActionFunction
			},
			plugins: {
				"hapi-swagger": {
					responseMessages: SWAGGER_DEFAULT_RESPONSE_MESSAGES
				}
			}
		}
	},
	{
		method: "POST",
		path: `${SERVER.API_BASE_URL}/v1/admin/change-password`,
		handler: async (request: Request | any, h: ResponseToolkit) => {
			try {
				const payload: ChangePasswordRequest = request.payload;
				const tokenData: TokenData = request.auth?.credentials?.tokenData;

				const result = await adminControllerV1.changePassword(payload, tokenData);
				return responseHandler.sendSuccess(h, result);
			} catch (error) {
				return responseHandler.sendError(request, error);
			}
		},
		config: {
			tags: ["api", "admin"],
			description: "Change Password",
			auth: {
				strategies: ["AdminAuth"]
			},
			validate: {
				headers: authorizationHeaderObj,
				payload: changePassword,
				failAction: failActionFunction
			},
			plugins: {
				"hapi-swagger": {
					responseMessages: SWAGGER_DEFAULT_RESPONSE_MESSAGES
				}
			}
		}
	},
	{
		method: "GET",
		path: `${SERVER.API_BASE_URL}/v1/admin/profile`,
		handler: async (request: Request | any, h: ResponseToolkit) => {
			try {
				const tokenData: TokenData = request.auth?.credentials?.tokenData;
				const result = await adminControllerV1.adminDetails(tokenData);
				return responseHandler.sendSuccess(h, result);
			} catch (error) {
				return responseHandler.sendError(request, error);
			}
		},
		config: {
			tags: ["api", "admin"],
			description: "Admin Details",
			auth: {
				strategies: ["AdminAuth"]
			},
			validate: {
				headers: authorizationHeaderObj,
				failAction: failActionFunction
			},
			plugins: {
				"hapi-swagger": {
					responseMessages: SWAGGER_DEFAULT_RESPONSE_MESSAGES
				}
			}
		}
	},
	{
		method: "PUT",
		path: `${SERVER.API_BASE_URL}/v1/admin/profile`,
		handler: async (request: Request | any, h: ResponseToolkit) => {
			try {
				const payload: AdminRequest.EditProfile = request.payload;
				const tokenData: TokenData = request.auth?.credentials?.tokenData;
				const result = await adminControllerV1.editProfile(payload, tokenData);
				return responseHandler.sendSuccess(h, result);
			} catch (error) {
				return responseHandler.sendError(request, error);
			}
		},
		config: {
			tags: ["api", "admin"],
			description: "Edit Profile",
			auth: {
				strategies: ["AdminAuth"]
			},
			validate: {
				headers: authorizationHeaderObj,
				payload: editProfile,
				failAction: failActionFunction
			},
			plugins: {
				"hapi-swagger": {
					responseMessages: SWAGGER_DEFAULT_RESPONSE_MESSAGES
				}
			}
		}
	},
	{
		method: "GET",
		path: `${SERVER.API_BASE_URL}/v1/admin/preSignedUrl`,
		handler: async (request: Request | any, h: ResponseToolkit) => {
			try {
				const query:AdminRequest.PreSignedUrl = request.query
				const result = await adminControllerV1.preSignedURL(query);
				return responseHandler.sendSuccess(h, result);
			} catch (error) {
				return responseHandler.sendError(request, error);
			}
		},
		config: {
			tags: ["api", "admin"],
			description: "presigned URL",
			auth: {
				strategies: ["AdminAuth"]
			},
			validate: {
				headers: authorizationHeaderObj,
				query: preSignedURL,
				failAction: failActionFunction
			},
			plugins: {
				"hapi-swagger": {
					responseMessages: SWAGGER_DEFAULT_RESPONSE_MESSAGES
				}
			}
		}
	},

	{
		method: "GET",
		path: `${SERVER.API_BASE_URL}/v1/admin/dashboard`,
		handler: async (request: Request | any, h: ResponseToolkit) => {
			try {
				const tokenData: TokenData = request.auth?.credentials?.tokenData;
				const result = await adminControllerV1.adminDashboard();
				return responseHandler.sendSuccess(h, result);
			} catch (error) {
				return responseHandler.sendError(request, error);
			}
		},
		config: {
			tags: ["api", "admin"],
			description: "get dashboard",
			auth: {
				strategies: ["AdminAuth"]
			},
			validate: {
				headers: authorizationHeaderObj,
				failAction: failActionFunction
			},
			plugins: {
				"hapi-swagger": {
					responseMessages: SWAGGER_DEFAULT_RESPONSE_MESSAGES
				}
			}
		}
	},
];