"use strict";

import { Request, ResponseToolkit } from "@hapi/hapi";

import { failActionFunction } from "@utils/appUtils";
import { authorizationHeaderObj } from "@utils/validator";
import { rewardControllerV1 } from "@modules/reward/index";
import { SWAGGER_DEFAULT_RESPONSE_MESSAGES, SERVER } from "@config/index";
import { responseHandler } from "@utils/ResponseHandler";
import {
  rewardHistory,
  completeGoal,
  completeTask,
  budgetMet,
  purchaseGiftCard,
} from "./routeValidate";

export const rewardRoute = [
  {
    method: "GET",
    path: `${SERVER.API_BASE_URL}/v1/reward-history`,
    handler: async (request: Request | any, h: ResponseToolkit) => {
      try {
        const userId = request?.auth?.credentials?.tokenData.userId;
        let query: ListingRequest = request.query;
        query.userId = query.userId ? query.userId : userId;
        const result = await rewardControllerV1.rewardHistory(query);
        return responseHandler.sendSuccess(h, result);
      } catch (error) {
        return responseHandler.sendError(request, error);
      }
    },
    config: {
      tags: ["api", "reward"],
      description: "Get Reward History",
      auth: {
        strategies: ["CommonAuth"],
      },
      validate: {
        headers: authorizationHeaderObj,
        query: rewardHistory,
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
    path: `${SERVER.API_BASE_URL}/v1/reward/goal`,
    handler: async (request: Request | any, h: ResponseToolkit) => {
      try {
        const payload: RewardRequest.CompleteGoal = request.payload;
        const tokenData = request?.auth?.credentials?.tokenData;
        const result = await rewardControllerV1.completeGoalReward(
          tokenData,
          payload
        );
        return responseHandler.sendSuccess(h, result);
      } catch (error) {
        return responseHandler.sendError(request, error);
      }
    },
    config: {
      tags: ["api", "reward"],
      description: "Complete a Goal and Get Reward",
      auth: {
        strategies: ["CommonAuth"],
      },
      validate: {
        headers: authorizationHeaderObj,
        payload: completeGoal,
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
    path: `${SERVER.API_BASE_URL}/v1/reward/task`,
    handler: async (request: Request | any, h: ResponseToolkit) => {
      try {
        const payload: RewardRequest.CompleteTask = request.payload;
        const tokenData = request?.auth?.credentials?.tokenData;
        const result = await rewardControllerV1.completeTaskReward(
          tokenData,
          payload
        );
        return responseHandler.sendSuccess(h, result);
      } catch (error) {
        return responseHandler.sendError(request, error);
      }
    },
    config: {
      tags: ["api", "reward"],
      description: "Complete a Task and Get Reward",
      auth: {
        strategies: ["CommonAuth"],
      },
      validate: {
        headers: authorizationHeaderObj,
        payload: completeTask,
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
    path: `${SERVER.API_BASE_URL}/v1/reward/budget`,
    handler: async (request: Request | any, h: ResponseToolkit) => {
      try {
        const payload: RewardRequest.BudgetMet = request.payload;
        const tokenData = request?.auth?.credentials?.tokenData;
        const result = await rewardControllerV1.budgetMetReward(
          tokenData,
          payload
        );
        return responseHandler.sendSuccess(h, result);
      } catch (error) {
        return responseHandler.sendError(request, error);
      }
    },
    config: {
      tags: ["api", "reward"],
      description: "Meet Budget and Get Reward",
      auth: {
        strategies: ["CommonAuth"],
      },
      validate: {
        headers: authorizationHeaderObj,
        payload: budgetMet,
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
    path: `${SERVER.API_BASE_URL}/v1/reward/purchase`,
    handler: async (request: Request | any, h: ResponseToolkit) => {
      try {
        const payload: RewardRequest.purchaseGiftCard = request.payload;
        const tokenData = request?.auth?.credentials?.tokenData;
        const result = await rewardControllerV1.purchaseGiftCard(
          tokenData,
          payload
        );
        return responseHandler.sendSuccess(h, result);
      } catch (error) {
        return responseHandler.sendError(request, error);
      }
    },
    config: {
      tags: ["api", "reward"],
      description: "purchase Gift Card and Get Reward",
      auth: {
        strategies: ["CommonAuth"],
      },
      validate: {
        headers: authorizationHeaderObj,
        payload: purchaseGiftCard,
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
