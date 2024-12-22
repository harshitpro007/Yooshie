"use strict";

import { Request, ResponseToolkit } from "@hapi/hapi";
import * as Joi from "joi";

import { failActionFunction } from "@utils/appUtils";
import { authorizationHeaderObj } from "@utils/validator";
import { SWAGGER_DEFAULT_RESPONSE_MESSAGES, SERVER } from "@config/index";
import { responseHandler } from "@utils/ResponseHandler";
import { subscriptionControllerV1 } from "..";
import { subscribedUserListing, subscriptionHistory, verifyAndroidToken, verifyIosToken } from "./routeValidate";

export const subscriptionRoute = [
	{
		method: "PUT",
		path: `${SERVER.API_BASE_URL}/v1/user/subscription/verify-ios-token`,
		handler: async (request: Request | any, h: ResponseToolkit) => {
			try {
				const tokenData = request.auth?.credentials; 
				const payload: SubscriptionRequest.VerifyIosInAppToken = request.payload;
				const result = await subscriptionControllerV1.verifyIosInAppToken(payload, tokenData);
				return responseHandler.sendSuccess(h, result);
			} catch (error) {
				return responseHandler.sendError(request, error);
			}
		},
		config: {
			tags: ["api", "subscription"],
			description: "verify token for ios in-app purchase",
			auth: {
				strategies: ["UserAuth"]
			},
			validate: {
				headers: authorizationHeaderObj,
				payload: verifyIosToken,
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
		path: `${SERVER.API_BASE_URL}/v1/user/subscription/ios-webhook`,
		handler: async (request: Request | any, h: ResponseToolkit) => {
			try {
				const payload= request.payload;
				const result = await subscriptionControllerV1.iosWebhook(payload);
				return responseHandler.sendSuccess(h, result);
			} catch (error) {
				return responseHandler.sendError(request, error);
			}
		},
		config: {
			tags: ["api", "subscription"],
			description: "verify token for ios in-app purchase",
			validate: {
				payload: Joi.object(),
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
		path: `${SERVER.API_BASE_URL}/v1/user/subscription/verify-android-token`,
		handler: async (request: Request | any, h: ResponseToolkit) => {
			try {
				const tokenData: TokenData = request.auth?.credentials; 
				const payload: SubscriptionRequest.VerifyAndroidInAppToken = request.payload;
				const result = await subscriptionControllerV1.verifyAndroidInAppToken(payload, tokenData);
				return responseHandler.sendSuccess(h, result);
			} catch (error) {
				return responseHandler.sendError(request, error);
			}
		},
		config: {
			tags: ["api", "subscription"],
			description: "verify token for android in-app purchase",
			auth: {
				strategies: ["UserAuth"]
			},
			validate: {
				headers: authorizationHeaderObj,
				payload: verifyAndroidToken,
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
		path: `${SERVER.API_BASE_URL}/v1/user/subscription/android-webhook`,
		handler: async (request: Request | any, h: ResponseToolkit) => {
			try {
				const payload = request.payload;
				const result = await subscriptionControllerV1.androidWebhok(payload);
				return responseHandler.sendSuccess(h, result);
			} catch (error) {
				return responseHandler.sendError(request, error);
			}
		},
		config: {
			tags: ["api", "subscription"],
			description: "verify token for android in-app purchase",
			validate: {
				payload: Joi.object(),
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
		path: `${SERVER.API_BASE_URL}/v1/user/subscription/features-details`,
		handler: async (request: Request | any, h: ResponseToolkit) => {
			try {
				const result = await subscriptionControllerV1.featuresDetail();
				return responseHandler.sendSuccess(h, result);
			} catch (error) {
				return responseHandler.sendError(request, error);
			}
		},
		config: {
			tags: ["api", "subscription"],
			description: "Features Detail of subscriptions",
			auth: {
				strategies: ["UserAuth"]
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
		method: "GET",
		path: `${SERVER.API_BASE_URL}/v1/subscription/transactions`,
		handler: async (request: Request| any, h: ResponseToolkit) => {
			try{
				const query: any = request.query;
				const tokenData: TokenData = request.auth?.credentials?.tokenData; 
				const result = await subscriptionControllerV1.getTransactions(query, tokenData);
				return responseHandler.sendSuccess(h, result);
			}
			catch(error){
				console.log(error);
				return responseHandler.sendError(request, error);
			}
		},
		config: {
			tags: ["api", "subscription"],
			description: "Transaction List",
			auth: {
				strategies: ["CommonAuth"]
			},
			validate: {
				headers: authorizationHeaderObj,
				query: subscribedUserListing,
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
		path: `${SERVER.API_BASE_URL}/v1/subscription/subscribed-users`,
		handler: async(request: Request | any, h: ResponseToolkit) => {
			try{
				const query: any = request.query;
				const tokenData: TokenData = request.auth?.credentials?.tokenData; 
				const result = await subscriptionControllerV1.subscribedUser(query, tokenData);
				return responseHandler.sendSuccess(h,result);
			}
			catch(error){
				return responseHandler.sendError(request, error);
			}
		},
		config: {
			tags: ["api", "subscription"],
			description: "Subscribed Users List",
			auth: {
				strategies: ["CommonAuth"]
			},
			validate: {
				headers: authorizationHeaderObj,
				query: subscribedUserListing,
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
		path: `${SERVER.API_BASE_URL}/v1/transaction/overview`,
		handler: async(request: Request | any, h: ResponseToolkit) => {
			try{
				const result = await subscriptionControllerV1.transactionOverview();
				return responseHandler.sendSuccess(h, result);
			}
			catch(error){
				return responseHandler.sendError(request, error);
			}
		},
		config: {
			tags: ["api", "subscription"],
			description: "Overview of subscription and transactions",
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
		method: "GET",
		path: `${SERVER.API_BASE_URL}/v1/subscription/history`,
		handler: async (request: Request | any, h: ResponseToolkit) => {
			try{
				const query: SubscriptionRequest.Subscriptions = request.query;
				const result = await subscriptionControllerV1.userSubscriptions(query);
				return responseHandler.sendSuccess(h, result);
			}
			catch(error){
				return responseHandler.sendError(request, error);
			}
		},
		config: {
			tags: ["api", "user"],
			description: "User Subscriptions list",
			auth: {
				strategies: ["CommonAuth"]
			},
			validate: {
				headers: authorizationHeaderObj,
				query: subscriptionHistory,
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
		path: `${SERVER.API_BASE_URL}/v1/user/subscription/free-trial`,
		handler: async (request: Request | any, h: ResponseToolkit) => {
			try {
				const tokenData: TokenData = request.auth?.credentials?.tokenData;
				const result = await subscriptionControllerV1.freeTrial(tokenData);
				return responseHandler.sendSuccess(h, result);
			} catch (error) {
				return responseHandler.sendError(request, error);
			}
		},
		config: {
			tags: ["api", "subscription"],
			description: "verify token for android in-app purchase",
			auth: {
				strategies: ["CommonAuth"]
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
