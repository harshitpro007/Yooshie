"use strict";

import { ResponseToolkit } from "@hapi/hapi";
import { failActionFunction } from "@utils/appUtils";
import { authorizationHeaderObj } from "@utils/validator";
import {
  SWAGGER_DEFAULT_RESPONSE_MESSAGES,
  SERVER,
} from "@config/index";
import { responseHandler } from "@utils/ResponseHandler";
import { notificationControllerV1 } from "..";
import { createNotification, deleteNotification, editNotification, notificationListing } from "./routeValidate";

export const notificationRoute = [
  {
    method: "POST",
    path: `${SERVER.API_BASE_URL}/v1/admin/notification`,
    handler: async (request: any, h: ResponseToolkit) => {
      try {
        const payload: NotificationRequest.CreateNotification = request.payload;
        const tokenData = request.auth?.credentials;
        const result = await notificationControllerV1.createNotification(payload,tokenData);
        return responseHandler.sendSuccess(h, result);
      } catch (error) {
        return responseHandler.sendError(request, error);
      }
    },
    options: {
      tags: ["api", "notification"],
      description: "create notification at admin side for multiple configuration",
      auth: {
        strategies: ["AdminAuth"],
      },
      validate: {
        headers: authorizationHeaderObj,
        payload: createNotification,
        failAction: failActionFunction,
      },
      plugins: {
        "hapi-swagger": {
          responseMessages: SWAGGER_DEFAULT_RESPONSE_MESSAGES,
        },
      },
    },
  },
  {
		method: "GET",
		path: `${SERVER.API_BASE_URL}/v1/notification`,
		handler: async (request: Request | any, h: ResponseToolkit) => {
			try {
				const query: ListingRequest = request.query;
				const tokenData: TokenData = request.auth?.credentials?.tokenData;
				const result = await notificationControllerV1.notificationList(query, tokenData);
				return responseHandler.sendSuccess(h, result);
			} catch (error) {
				return responseHandler.sendError(request, error);
			}
		},
		config: {
			tags: ["api", "notification"],
			description: "Notification List",
			auth: {
				strategies: ["AdminAuth"]
			},
			validate: {
				headers: authorizationHeaderObj,
				query: notificationListing,
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
		method: "DELETE",
		path: `${SERVER.API_BASE_URL}/v1/notification`,
		handler: async (request: Request | any, h: ResponseToolkit) => {
			const tokenData: TokenData = request.auth?.credentials?.tokenData;
			const query : NotificationRequest.Id = request.query 
			try {
				const result = await notificationControllerV1.notificationDelete(query,tokenData);
				return responseHandler.sendSuccess(h, result);
			} catch (error) {
				return responseHandler.sendError(request, error);
			}
		},
		config: {
			tags: ["api", "notification"],
			description: "Notification Delete",
			auth: {
				strategies: ["AdminAuth"]
			},
			validate: {
				headers: authorizationHeaderObj,
				query: deleteNotification,
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
    method: "PATCH",
    path: `${SERVER.API_BASE_URL}/v1/admin/notification`,
    handler: async (request: any, h: ResponseToolkit) => {
      try {
        const payload: NotificationRequest.CreateNotification = request.payload;
        const tokenData: TokenData = request.auth?.credentials?.tokenData;
        const result = await notificationControllerV1.editNotification(payload,tokenData);
        return responseHandler.sendSuccess(h, result);
      } catch (error) {
        return responseHandler.sendError(request, error);
      }
    },
    options: {
      tags: ["api", "notification"],
      description: "edit notification at admin side for multiple configuration",
      auth: {
        strategies: ["AdminAuth"],
      },
      validate: {
        headers: authorizationHeaderObj,
        payload: editNotification,
        failAction: failActionFunction,
      },
      plugins: {
        "hapi-swagger": {
          responseMessages: SWAGGER_DEFAULT_RESPONSE_MESSAGES,
        },
      },
    },
  },
  {
    method: "GET",
    path: `${SERVER.API_BASE_URL}/v1/admin/notification-list`,
    handler: async (request, h) => {
      try {
        const tokenData = request.auth?.credentials;
        let query: ListingRequest = request.query;
        let result = await notificationControllerV1.notificationListing(query, tokenData);
        return responseHandler.sendSuccess(h, result);
      } catch (error) {
        return responseHandler.sendError(request, error);
      }
    },
    config: {
      tags: ["api", "user"],
      description: "In-App notification listing",
      auth: {
        strategies: ["UserAuth"],
      },
      validate: {
        headers: authorizationHeaderObj,
        query: notificationListing,
        failAction: failActionFunction,
      },
      plugins: {
        "hapi-swagger": {
          responseMessages: SWAGGER_DEFAULT_RESPONSE_MESSAGES,
        },
      },
    },
  },
 ];
