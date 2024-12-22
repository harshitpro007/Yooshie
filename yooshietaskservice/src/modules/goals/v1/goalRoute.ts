"use strict";

import { Request, ResponseToolkit } from "@hapi/hapi";

import { failActionFunction } from "@utils/appUtils";
import { authorizationHeaderObj } from "@utils/validator";
import { goalControllerV1 } from "@modules/goals/index";
import { SWAGGER_DEFAULT_RESPONSE_MESSAGES, SERVER } from "@config/index";
import { responseHandler } from "@utils/ResponseHandler";
import { addGoal, editGoal, goal, goalList } from "./routeValidate";

export const goalRoute = [
  {
    method: "GET",
    path: `${SERVER.API_BASE_URL}/v1/goal-details`,
    handler: async (request: Request | any, h: ResponseToolkit) => {
      try {
        const query: GoalRequest.Id = request.query;
        const result = await goalControllerV1.goalDetails(query);
        return responseHandler.sendSuccess(h, result);
      } catch (error) {
        return responseHandler.sendError(request, error);
      }
    },
    config: {
      tags: ["api", "goal"],
      description: "goal Details",
      auth: {
        strategies: ["CommonAuth"],
      },
      validate: {
        headers: authorizationHeaderObj,
        query: goal,
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
    path: `${SERVER.API_BASE_URL}/v1/goal`,
    handler: async (request: Request | any, h: ResponseToolkit) => {
      try {
        const tokenData = request?.auth?.credentials;
        const payload: GoalRequest.Edit = request.payload;
        const result = await goalControllerV1.editGoal(payload, tokenData);
        return responseHandler.sendSuccess(h, result);
      } catch (error) {
        return responseHandler.sendError(request, error);
      }
    },
    config: {
      tags: ["api", "goal"],
      description: "Update goal.",
      auth: {
        strategies: ["CommonAuth"],
      },
      validate: {
        headers: authorizationHeaderObj,
        payload: editGoal,
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
    path: `${SERVER.API_BASE_URL}/v1/goal`,
    handler: async (request: Request | any, h: ResponseToolkit) => {
      try {
        const tokenData = request?.auth?.credentials;

        const payload: GoalRequest.Add = request.payload;
        const result = await goalControllerV1.addGoal(payload, tokenData);
        return responseHandler.sendSuccess(h, result);
      } catch (error) {
        return responseHandler.sendError(request, error);
      }
    },
    config: {
      tags: ["api", "goal"],
      description: "Add goal",
      auth: {
        strategies: ["CommonAuth"],
      },
      validate: {
        headers: authorizationHeaderObj,
        payload: addGoal,
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
    path: `${SERVER.API_BASE_URL}/v1/goal`,
    handler: async (request: Request | any, h: ResponseToolkit) => {
      try {
        const query = request.query;
        const tokenData: TokenData = request.auth?.credentials?.tokenData;
        const result = await goalControllerV1.goalList(query, tokenData);
        return responseHandler.sendSuccess(h, result);
      } catch (error) {
        return responseHandler.sendError(request, error);
      }
    },
    config: {
      tags: ["api", "goal"],
      description: "Goal List",
      auth: {
        strategies: ["CommonAuth"],
      },
      validate: {
        headers: authorizationHeaderObj,
        query: goalList,
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
    path: `${SERVER.API_BASE_URL}/v1/goal`,
    handler: async (request: Request | any, h: ResponseToolkit) => {
      try {
        const params: GoalRequest.Id = request.query;
        const tokenData = request.auth?.credentials;
        const result = await goalControllerV1.deleteGoal(params, tokenData);
        return responseHandler.sendSuccess(h, result);
      } catch (error) {
        return responseHandler.sendError(request, error);
      }
    },
    config: {
      tags: ["api", "goal"],
      description: "Delete goal",
      auth: {
        strategies: ["CommonAuth"],
      },
      validate: {
        headers: authorizationHeaderObj,
        query: goal,
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
