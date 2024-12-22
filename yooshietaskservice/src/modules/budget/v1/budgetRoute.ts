"use strict";

import { Request, ResponseToolkit } from "@hapi/hapi";

import { failActionFunction } from "@utils/appUtils";
import { authorizationHeaderObj } from "@utils/validator";
import { budgetControllerV1 } from "@modules/budget/index";
import { SWAGGER_DEFAULT_RESPONSE_MESSAGES, SERVER } from "@config/index";
import { responseHandler } from "@utils/ResponseHandler";
import { addBudget, budget, budgetList, editBudget } from "./routeValidate";

export const budgetRoute = [
  {
    method: "GET",
    path: `${SERVER.API_BASE_URL}/v1/budget/details`,
    handler: async (request: Request | any, h: ResponseToolkit) => {
      try {
        const query: BudgetRequest.Id = request.query;
        const result = await budgetControllerV1.budgetDetails(query);
        return responseHandler.sendSuccess(h, result);
      } catch (error) {
        return responseHandler.sendError(request, error);
      }
    },
    config: {
      tags: ["api", "budget"],
      description: "budget Details",
      auth: {
        strategies: ["CommonAuth"],
      },
      validate: {
        headers: authorizationHeaderObj,
        query: budget,
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
    path: `${SERVER.API_BASE_URL}/v1/budget`,
    handler: async (request: Request | any, h: ResponseToolkit) => {
      try {
        const tokenData = request?.auth?.credentials;
        const payload: BudgetRequest.Edit = request.payload;
        const result = await budgetControllerV1.editBudget(payload, tokenData);
        return responseHandler.sendSuccess(h, result);
      } catch (error) {
        return responseHandler.sendError(request, error);
      }
    },
    config: {
      tags: ["api", "budget"],
      description: "Update budget.",
      auth: {
        strategies: ["CommonAuth"],
      },
      validate: {
        headers: authorizationHeaderObj,
        payload: editBudget,
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
    path: `${SERVER.API_BASE_URL}/v1/budget`,
    handler: async (request: Request | any, h: ResponseToolkit) => {
      try {
        const tokenData = request?.auth?.credentials;
        const payload: BudgetRequest.Add = request.payload;
        const result = await budgetControllerV1.addBudget(payload, tokenData);
        return responseHandler.sendSuccess(h, result);
      } catch (error) {
        return responseHandler.sendError(request, error);
      }
    },
    config: {
      tags: ["api", "budget"],
      description: "Add budget",
      auth: {
        strategies: ["CommonAuth"],
      },
      validate: {
        headers: authorizationHeaderObj,
        payload: addBudget,
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
    path: `${SERVER.API_BASE_URL}/v1/budget`,
    handler: async (request: Request | any, h: ResponseToolkit) => {
      try {
        const query = request.query;
        const tokenData: TokenData = request.auth?.credentials?.tokenData;
        const result = await budgetControllerV1.budgetList(query, tokenData);
        return responseHandler.sendSuccess(h, result);
      } catch (error) {
        return responseHandler.sendError(request, error);
      }
    },
    config: {
      tags: ["api", "budget"],
      description: "budget List",
      auth: {
        strategies: ["CommonAuth"],
      },
      validate: {
        headers: authorizationHeaderObj,
        query: budgetList,
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
    path: `${SERVER.API_BASE_URL}/v1/budget`,
    handler: async (request: Request | any, h: ResponseToolkit) => {
      try {
        const params: BudgetRequest.Id = request.query;
        const tokenData = request?.auth?.credentials;
        const result = await budgetControllerV1.deleteBudget(params,tokenData);
        return responseHandler.sendSuccess(h, result);
      } catch (error) {
        return responseHandler.sendError(request, error);
      }
    },
    config: {
      tags: ["api", "budget"],
      description: "Delete budget",
      auth: {
        strategies: ["CommonAuth"],
      },
      validate: {
        headers: authorizationHeaderObj,
        query: budget,
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
