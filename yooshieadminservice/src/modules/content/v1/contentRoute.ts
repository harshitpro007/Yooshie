"use strict";

import { Request, ResponseToolkit } from "@hapi/hapi";

import { failActionFunction } from "@utils/appUtils";
import {
  authorizationHeaderObj,
  authorizationOptionalHeaderObj,
} from "@utils/validator";
import { contentControllerV1 } from "@modules/content/index";
import { SWAGGER_DEFAULT_RESPONSE_MESSAGES, SERVER } from "@config/index";
import { responseHandler } from "@utils/ResponseHandler";
import {
  addFaq,
  contentDetails,
  editContent,
  editFaq,
  faq,
  faqDetails,
  faqList,
  getContent,
  viewContent,
} from "./routeValidate";

export const contentRoute = [
  {
    method: "GET",
    path: `${SERVER.API_BASE_URL}/v1/contents/details`,
    handler: async (request: Request | any, h: ResponseToolkit) => {
      try {
        const query: ContentRequest.Type = request.query;
        const result = await contentControllerV1.contentDetails(query);
        return responseHandler.sendSuccess(h, result);
      } catch (error) {
        return responseHandler.sendError(request, error);
      }
    },
    config: {
      tags: ["api", "contents"],
      description: "Content Details",
      auth: {
        strategies: ["AdminAuth"],
      },
      validate: {
        headers: authorizationHeaderObj,
        query: contentDetails,
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
    path: `${SERVER.API_BASE_URL}/v1/contents`,
    handler: async (request: Request | any, h: ResponseToolkit) => {
      try {
        const query: ContentRequest.Type = request.query;
        const result = await contentControllerV1.contentDetails(query);
        return responseHandler.sendSuccess(h, result);
      } catch (error) {
        return responseHandler.sendError(request, error);
      }
    },
    config: {
      tags: ["api", "contents"],
      description: "Content Details",
      auth: {
        strategies: ["BasicAuth"],
      },
      validate: {
        headers: authorizationOptionalHeaderObj,
        query: getContent,
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
    method: "PUT",
    path: `${SERVER.API_BASE_URL}/v1/contents`,
    handler: async (request: Request | any, h: ResponseToolkit) => {
      try {
        const payload: ContentRequest.Edit = request.payload;
        const result = await contentControllerV1.editContent(payload);
        return responseHandler.sendSuccess(h, result);
      } catch (error) {
        return responseHandler.sendError(request, error);
      }
    },
    config: {
      tags: ["api", "contents"],
      description: "Update if Exists or Create Content.",
      auth: {
        strategies: ["AdminAuth"],
      },
      validate: {
        headers: authorizationHeaderObj,
        payload: editContent,
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
    path: `${SERVER.API_BASE_URL}/v1/contents/view`,
    handler: async (request: Request | any, h: ResponseToolkit) => {
      try {
        const query: ContentRequest.View = request.query;
        const result = await contentControllerV1.viewContent(query);
        return responseHandler.sendSuccess(h, result);
      } catch (error) {
        return responseHandler.sendError(request, error);
      }
    },
    config: {
      tags: ["api", "contents"],
      description: "View Content",
      validate: {
        query: viewContent,
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
    method: "POST",
    path: `${SERVER.API_BASE_URL}/v1/contents/faq`,
    handler: async (request: Request | any, h: ResponseToolkit) => {
      try {
        const payload: ContentRequest.AddFaq = request.payload;
        const result = await contentControllerV1.addFaq(payload);
        return responseHandler.sendSuccess(h, result);
      } catch (error) {
        return responseHandler.sendError(request, error);
      }
    },
    config: {
      tags: ["api", "contents"],
      description: "Add Faq",
      auth: {
        strategies: ["AdminAuth"],
      },
      validate: {
        headers: authorizationHeaderObj,
        payload: addFaq,
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
    path: `${SERVER.API_BASE_URL}/v1/contents/faq`,
    handler: async (request: Request | any, h: ResponseToolkit) => {
      try {
        const query: ListingRequest = request.query;
        const result = await contentControllerV1.faqList(query);
        return responseHandler.sendSuccess(h, result);
      } catch (error) {
        return responseHandler.sendError(request, error);
      }
    },
    config: {
      tags: ["api", "contents"],
      description: "Faq List",
      auth: {
        strategies: ["AdminAuth"],
      },
      validate: {
        headers: authorizationHeaderObj,
        query: faqList,
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
    path: `${SERVER.API_BASE_URL}/v1/contents/faq-list`,
    handler: async (request: Request | any, h: ResponseToolkit) => {
      try {
        const query: ListingRequest = request.query;
        const result = await contentControllerV1.faqListDetails(query);
        return responseHandler.sendSuccess(h, result);
      } catch (error) {
        return responseHandler.sendError(request, error);
      }
    },
    config: {
      tags: ["api", "contents"],
      description: "Faq List",
      auth: {
        strategies: ["CommonAuth"],
      },
      validate: {
        headers: authorizationOptionalHeaderObj,
        query: faqDetails,
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
    method: "PUT",
    path: `${SERVER.API_BASE_URL}/v1/contents/faq`,
    handler: async (request: Request | any, h: ResponseToolkit) => {
      try {
        const payload: ContentRequest.EditFaq = request.payload;
        const result = await contentControllerV1.editFaq(payload);
        return responseHandler.sendSuccess(h, result);
      } catch (error) {
        return responseHandler.sendError(request, error);
      }
    },
    config: {
      tags: ["api", "contents"],
      description: "Edit Faq",
      auth: {
        strategies: ["AdminAuth"],
      },
      validate: {
        headers: authorizationHeaderObj,
        payload: editFaq,
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
    method: "DELETE",
    path: `${SERVER.API_BASE_URL}/v1/contents/faq`,
    handler: async (request: Request | any, h: ResponseToolkit) => {
      try {
        const params: ContentRequest.FaqId = request.query;
        const result = await contentControllerV1.deleteFaq(params);
        return responseHandler.sendSuccess(h, result);
      } catch (error) {
        return responseHandler.sendError(request, error);
      }
    },
    config: {
      tags: ["api", "contents"],
      description: "Delete Faq",
      auth: {
        strategies: ["AdminAuth"],
      },
      validate: {
        headers: authorizationHeaderObj,
        query: faq,
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
    path: `${SERVER.API_BASE_URL}/v1/contents/faq-details`,
    handler: async (request: Request | any, h: ResponseToolkit) => {
      try {
        const query: ContentRequest.FaqId = request.query;
        const result = await contentControllerV1.faqDetails(query);
        return responseHandler.sendSuccess(h, result);
      } catch (error) {
        return responseHandler.sendError(request, error);
      }
    },
    config: {
      tags: ["api", "contents"],
      description: "FAQ Details",
      auth: {
        strategies: ["AdminAuth"],
      },
      validate: {
        headers: authorizationHeaderObj,
        query: faq,
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
