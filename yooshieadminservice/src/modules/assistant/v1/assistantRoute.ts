"use strict";

import { assistantControllerV1 } from "@modules/assistant/index";
import * as appUtils from "@utils/appUtils";
import { SERVER, SWAGGER_DEFAULT_RESPONSE_MESSAGES } from "@config/index";
import { authorizationHeaderObj, headerObject } from "@utils/validator";
import { ResponseHandler } from "@utils/ResponseHandler";
import { ResponseToolkit } from "@hapi/hapi";
import { login } from "@modules/admin/v1/routeValidate";
import { userListing } from "@modules/user/v1/routeValidate";
import {
  addAssistant,
  assistantListing,
  assistant,
  editAssistant,
  updateStatus,
  reInviteAssistant,
  assignedAssistant,
  editProfileSetting,
} from "./routeValidate";
import { failActionFunction } from "@utils/appUtils";
let responseHandler = new ResponseHandler();

export const assistantRoute = [
  {
    method: "POST",
    path: `${SERVER.API_BASE_URL}/v1/assistant`,
    handler: async (request, h) => {
      let payload: AssistantRequest.CreateAssistant = request.payload;
      const tokenData: TokenData = request.auth?.credentials?.tokenData;
      try {
        let result = await assistantControllerV1.createAssistant(
          payload,
          tokenData
        );
        return responseHandler.sendSuccess(h, result);
      } catch (error) {
        return responseHandler.sendError(request, error);
      }
    },
    config: {
      tags: ["api", "Assistant"],
      description: "Create Assistant",
      auth: {
        strategies: ["AdminAuth"],
      },
      validate: {
        headers: authorizationHeaderObj,
        payload: addAssistant,
        failAction: appUtils.failActionFunction,
      },
      plugins: {
        "hapi-swagger": {
          responseMessages: SWAGGER_DEFAULT_RESPONSE_MESSAGES,
        },
      },
    },
  },
  {
    method: "PUT",
    path: `${SERVER.API_BASE_URL}/v1/assistant`,
    handler: async (request, h) => {
      const tokenData: TokenData = request.auth?.credentials?.tokenData;

      let payload: AssistantRequest.EditAssistant = request.payload;
      try {
        let result = await assistantControllerV1.editAssistant(
          payload,
          tokenData
        );
        return responseHandler.sendSuccess(h, result);
      } catch (error) {
        return responseHandler.sendError(request, error);
      }
    },
    config: {
      tags: ["api", "Assistant"],
      description: "Edit Assistant",
      auth: {
        strategies: ["AdminAuth"],
      },
      validate: {
        headers: authorizationHeaderObj,
        payload: editAssistant,
        failAction: appUtils.failActionFunction,
      },
      plugins: {
        "hapi-swagger": {
          responseMessages: SWAGGER_DEFAULT_RESPONSE_MESSAGES,
        },
      },
    },
  },
  {
    method: "PATCH",
    path: `${SERVER.API_BASE_URL}/v1/assistant/block-unblock`,
    handler: async (request, h) => {
      try {
        const tokenData: TokenData = request.auth?.credentials?.tokenData;

        const payload: AssistantRequest.BlockAssistant = request.payload;
        let result = await assistantControllerV1.blockUnblockAssistant(
          payload,
          tokenData
        );
        return responseHandler.sendSuccess(h, result);
      } catch (error) {
        return responseHandler.sendError(request, error);
      }
    },
    config: {
      tags: ["api", "Assistant"],
      description: "Block Unblock Assistant",
      auth: {
        strategies: ["AdminAuth"],
      },
      validate: {
        headers: authorizationHeaderObj,
        payload: updateStatus,
        failAction: appUtils.failActionFunction,
      },
      plugins: {
        "hapi-swagger": {
          responseMessages: SWAGGER_DEFAULT_RESPONSE_MESSAGES,
        },
      },
    },
  },
  {
		method: "PATCH",
		path: `${SERVER.API_BASE_URL}/v1/assistant/profile`,
		handler: async (request: Request | any, h: ResponseToolkit) => {
			try {
				const payload: AssistantRequest.EditProfileSetting = request.payload;
				const tokenData = request?.auth?.credentials;
				const result = await assistantControllerV1.editProfileSetting(payload, tokenData);
				return responseHandler.sendSuccess(h, result);
			} catch (error) {
				return responseHandler.sendError(request, error);
			}
		},
		options: {
			tags: ["api", "user"],
			description: "Edit user profile settings",
			auth: {
				strategies: ["AdminAuth"]
			},
			validate: {
				headers: authorizationHeaderObj,
				payload: editProfileSetting,
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
    path: `${SERVER.API_BASE_URL}/v1/assistant`,
    handler: async (request, h) => {
      try {
        const tokenData: TokenData = request.auth?.credentials?.tokenData;
        let query: AssistantRequest.AssistantId = request.query;
        let result = await assistantControllerV1.deleteAssistant(
          query,
          tokenData
        );
        return responseHandler.sendSuccess(h, result);
      } catch (error) {
        return responseHandler.sendError(request, error);
      }
    },
    config: {
      tags: ["api", "Assistant"],
      description: "Delete Assistant",
      auth: {
        strategies: ["AdminAuth"],
      },
      validate: {
        headers: authorizationHeaderObj,
        query: assistant,
        failAction: appUtils.failActionFunction,
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
    path: `${SERVER.API_BASE_URL}/v1/assistant`,
    handler: async (request, h) => {
      const tokenData: TokenData = request.auth?.credentials?.tokenData;

      let query: AssistantRequest.AssistantList = request.query;
      try {
        let result = await assistantControllerV1.AssistantList(
          query,
          tokenData
        );
        return responseHandler.sendSuccess(h, result);
      } catch (error) {
        return responseHandler.sendError(request, error);
      }
    },
    config: {
      tags: ["api", "Assistant"],
      description: "Assistant List",
      auth: {
        strategies: ["AdminAuth"],
      },
      validate: {
        headers: authorizationHeaderObj,
        query: assistantListing,
        failAction: appUtils.failActionFunction,
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
    path: `${SERVER.API_BASE_URL}/v1/assistant/details`,
    handler: async (request, h) => {
      const tokenData: TokenData = request.auth?.credentials?.tokenData;

      let query: AssistantRequest.AssistantId = request.query;
      try {
        let result = await assistantControllerV1.AssistantDetails(
          query,
          tokenData
        );
        return responseHandler.sendSuccess(h, result);
      } catch (error) {
        return responseHandler.sendError(request, error);
      }
    },
    config: {
      tags: ["api", "Assistant"],
      description: "Assistant Details",
      auth: {
        strategies: ["CommonAuth"],
      },
      validate: {
        headers: authorizationHeaderObj,
        query: assistant,
        failAction: appUtils.failActionFunction,
      },
      plugins: {
        "hapi-swagger": {
          responseMessages: SWAGGER_DEFAULT_RESPONSE_MESSAGES,
        },
      },
    },
  },
  {
    method: "POST",
    path: `${SERVER.API_BASE_URL}/v1/assistant/resend-invite`,
    handler: async (request, h) => {
      let payload: AssistantRequest.EditAssistant = request.payload;
      const tokenData: TokenData = request.auth?.credentials?.tokenData;

      try {
        let result = await assistantControllerV1.resendInviteAssistant(
          payload,
          tokenData
        );
        return responseHandler.sendSuccess(h, result);
      } catch (error) {
        return responseHandler.sendError(request, error);
      }
    },
    config: {
      tags: ["api", "Assistant"],
      description: "Resend Assistant invite",
      auth: {
        strategies: ["AdminAuth"],
      },
      validate: {
        headers: authorizationHeaderObj,
        payload: reInviteAssistant,
        failAction: appUtils.failActionFunction,
      },
      plugins: {
        "hapi-swagger": {
          responseMessages: SWAGGER_DEFAULT_RESPONSE_MESSAGES,
        },
      },
    },
  },

  {
    method: "PATCH",
    path: `${SERVER.API_BASE_URL}/v1/assistant/assigned`,
    handler: async (request, h) => {
      const tokenData: TokenData = request.auth?.credentials?.tokenData;
      try {
        let result = await assistantControllerV1.assignedAutomaticAssistant(
          tokenData
        );
        return responseHandler.sendSuccess(h, result);
      } catch (error) {
        return responseHandler.sendError(request, error);
      }
    },
    config: {
      tags: ["api", "Internal"],
      description: "Assigned Assistant",
      auth: {
        strategies: ["CommonAuth"],
      },
      validate: {
        headers: authorizationHeaderObj,
        failAction: appUtils.failActionFunction,
      },
      plugins: {
        "hapi-swagger": {
          responseMessages: SWAGGER_DEFAULT_RESPONSE_MESSAGES,
        },
      },
    },
  },

  {
    method: "PATCH",
    path: `${SERVER.API_BASE_URL}/v1/assistant/assigned-manual`,
    handler: async (request, h) => {
      const tokenData: TokenData = request.auth?.credentials?.tokenData;
      let payload: AssistantRequest.assignedAssistant = request.payload;

      try {
        let result = await assistantControllerV1.assignedManualAssistant(
          payload,
          tokenData
        );
        return responseHandler.sendSuccess(h, result);
      } catch (error) {
        return responseHandler.sendError(request, error);
      }
    },
    config: {
      tags: ["api", "Assistant"],
      description: "Assigned Assistant by admin",
      auth: {
        strategies: ["AdminAuth"],
      },
      validate: {
        headers: authorizationHeaderObj,
        payload: assignedAssistant,
        failAction: appUtils.failActionFunction,
      },
      plugins: {
        "hapi-swagger": {
          responseMessages: SWAGGER_DEFAULT_RESPONSE_MESSAGES,
        },
      },
    },
  },
  {
    method: "POST",
    path: `${SERVER.API_BASE_URL}/v1/assistant/login`,
    handler: async (request: Request | any, h: ResponseToolkit) => {
      try {
        const headers = request.headers;
        const payload: AdminRequest.Login = request.payload;
        payload.remoteAddress =
          request["headers"]["x-forwarded-for"] || request.info.remoteAddress;
        const result = await assistantControllerV1.login({
          ...headers,
          ...payload,
        });
        return responseHandler.sendSuccess(h, result);
      } catch (error) {
        return responseHandler.sendError(request, error);
      }
    },
    config: {
      tags: ["api", "Assistant"],
      description: "Assistant Login",
      auth: {
        strategies: ["BasicAuth"],
      },
      validate: {
        headers: headerObject["required"],
        payload: login,
        failAction: appUtils.failActionFunction,
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
    path: `${SERVER.API_BASE_URL}/v1/assistant/user-listing`,
    handler: async (request, h) => {
      try {
        const tokenData = request.auth?.credentials;
        let query: ListingRequest = request.query;
        let result = await assistantControllerV1.userListing(query, tokenData);
        return responseHandler.sendSuccess(h, result);
      } catch (error) {
        return responseHandler.sendError(request, error);
      }
    },
    config: {
      tags: ["api", "Assistant"],
      description: "user List for assistant",
      auth: {
        strategies: ["AdminAuth"],
      },
      validate: {
        headers: authorizationHeaderObj,
        query: userListing,
        failAction: appUtils.failActionFunction,
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
    path: `${SERVER.API_BASE_URL}/v1/assistant/dashboard`,
    handler: async (request: Request | any, h: ResponseToolkit) => {
      try {
        const tokenData = request?.auth?.credentials;
        const result = await assistantControllerV1.assitantDashboard(tokenData);
        return responseHandler.sendSuccess(h, result);
      } catch (error) {
        return responseHandler.sendError(request, error);
      }
    },
    config: {
      tags: ["api", "Assistant"],
      description: "get Assistant dashboard",
      auth: {
        strategies: ["AdminAuth"],
      },
      validate: {
        headers: authorizationHeaderObj,
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
