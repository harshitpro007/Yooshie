"use strict";

import { Request, ResponseToolkit } from "@hapi/hapi";

import { failActionFunction } from "@utils/appUtils";
import { chatControllerV1 } from "@modules/chat/index";
import {
	SWAGGER_DEFAULT_RESPONSE_MESSAGES,
	SERVER
} from "@config/index";
import { responseHandler } from "@utils/ResponseHandler";
import { authorizationHeaderObj } from "@utils/validator";
import { chatListing, chatProfile, groupDetails, messageListing, payload } from "./routeValidate";

export const chatRoute = [
	{
		method: "GET",
		path: `${SERVER.API_BASE_URL}/v1/chat-listing`,
		handler: async (request: Request | any, h: ResponseToolkit) => {
			try {
				const query: ListingRequest = request.query;
				const tokenData: TokenData = request.auth && request.auth.credentials && request.auth.credentials.tokenData;
				const result = await chatControllerV1.chatList(query, tokenData);
				return responseHandler.sendSuccess(h, result);
			} catch (error) {
				return responseHandler.sendError(request, error);
			}
		},
		config: {
			tags: ["api", "chats"],
			description: "Chats List",
			notes: "User chats list",
			auth: {
				strategies: ["CommonAuth"]
			},
			validate: {
				headers: authorizationHeaderObj,
				query: chatListing,
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
		path: `${SERVER.API_BASE_URL}/v1/message`,
		handler: async (request: Request | any, h: ResponseToolkit) => {
			try {
				const query: ChatRequest.MessageList = request.query;
				const tokenData: TokenData = request.auth && request.auth.credentials && request.auth.credentials.tokenData;
				const result = await chatControllerV1.messageList(query, tokenData);
				return responseHandler.sendSuccess(h, result);
			} catch (error) {
				return responseHandler.sendError(request, error);
			}
		},
		config: {
			tags: ["api", "chats"],
			description: "Message List",
			notes: "User messages list",
			auth: {
				strategies: ["CommonAuth"]
			},
			validate: {
				headers: authorizationHeaderObj,
				query: messageListing,
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
		path: `${SERVER.API_BASE_URL}/v1/chat/profile`,
		handler: async (request: Request | any, h: ResponseToolkit) => {
			try {
				const params: ChatRequest.Id = request.payload;
				const tokenData: TokenData = request.auth && request.auth.credentials && request.auth.credentials.tokenData;
				const result = await chatControllerV1.chatProfile(params, tokenData);
				return responseHandler.sendSuccess(h, result);
			} catch (error) {
				return responseHandler.sendError(request, error);
			}
		},
		config: {
			tags: ["api", "chats"],
			description: "Chat Profile Details",
			auth: {
				strategies: ["CommonAuth"]
			},
			validate: {
				headers: authorizationHeaderObj,
				payload: chatProfile,
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
		path: `${SERVER.API_BASE_URL}/v1/group/details`,
		handler: async (request: Request | any, h: ResponseToolkit) => {
			try {
				const query: ChatRequest.Id = request.query;
				const tokenData: TokenData = request.auth && request.auth.credentials && request.auth.credentials.tokenData;
				const result = await chatControllerV1.viewGroupDetails(query, tokenData);
				return responseHandler.sendSuccess(h, result);
			} catch (error) {
				return responseHandler.sendError(request, error);
			}
		},
		config: {
			tags: ["api", "chats"],
			description: "Group Chat Profile Details",
			auth: {
				strategies: ["CommonAuth"]
			},
			validate: {
				headers: authorizationHeaderObj,
				query: groupDetails,
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
		path: `${SERVER.API_BASE_URL}/v1/user-setting`,
		handler: async (request: Request | any, h: ResponseToolkit) => {
			try {
				const params: any = request.payload;
				const tokenData: TokenData = request?.auth?.credentials?.tokenData;
				const result = await chatControllerV1.userSetting(params, tokenData);
				return responseHandler.sendSuccess(h, result);
			} catch (error) {
				return responseHandler.sendError(request, error);
			}
		},
		config: {
			tags: ["api", "chats"],
			description: "API for subscription callback",
			auth: {
				strategies: ["CommonAuth"]
			},
			validate: {
				headers: authorizationHeaderObj,
				payload: payload,
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
		path: `${SERVER.API_BASE_URL}/v1/deleteUser`,
		handler: async (request: Request | any, h: ResponseToolkit) => {
			try {
				const params: any = request.payload;
				console.log('****************params---- deleteUser***********', params)
				const tokenData: TokenData = request.auth && request.auth.credentials && request.auth.credentials.tokenData;
				const result = await chatControllerV1.deleteUserHandling(tokenData);
				return responseHandler.sendSuccess(h, result);
			} catch (error) {
				return responseHandler.sendError(request, error);
			}
		},
		config: {
			tags: ["api", "chats"],
			description: "API for subscription callback",
			auth: {
				strategies: ["CommonAuth"]
			},
			validate: {
				headers: authorizationHeaderObj,
				payload: payload,
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