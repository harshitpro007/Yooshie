"use strict";

import { Request, ResponseToolkit } from "@hapi/hapi";

import { failActionFunction } from "@utils/appUtils";
import { authorizationHeaderObj } from "@utils/validator";
import { reminderControllerV1 } from "@modules/reminder/index";
import {
  SWAGGER_DEFAULT_RESPONSE_MESSAGES,
  SERVER,
} from "@config/index";
import { responseHandler } from "@utils/ResponseHandler";
import { addReminder, editReminder, reminder, reminderListing } from "./routeValidate";

export const reminderRoute = [
  {
    method: "GET",
    path: `${SERVER.API_BASE_URL}/v1/reminder/reminderDetails`,
    handler: async (request: Request | any, h: ResponseToolkit) => {
      try {
        const query: ReminderRequest.Id = request.query;
        const result = await reminderControllerV1.reminderDetails(query);
        return responseHandler.sendSuccess(h, result);
      } catch (error) {
        return responseHandler.sendError(request, error);
      }
    },
    config: {
      tags: ["api", "reminder"],
      description: "reminder Details",
      auth: {
        strategies: ["CommonAuth"],
      },
      validate: {
        headers: authorizationHeaderObj,
        query: reminder,
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
    path: `${SERVER.API_BASE_URL}/v1/reminder`,
    handler: async (request: Request | any, h: ResponseToolkit) => {
      try {
        const payload: ReminderRequest.Edit = request.payload;
        const tokenData = request?.auth?.credentials;
        const result = await reminderControllerV1.editreminder(payload,tokenData);
        return responseHandler.sendSuccess(h, result);
      } catch (error) {
        return responseHandler.sendError(request, error);
      }
    },
    config: {
      tags: ["api", "reminder"],
      description: "Update reminder.",
      auth: {
        strategies: ["CommonAuth"],
      },
      validate: {
        headers: authorizationHeaderObj,
        payload: editReminder,
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
    path: `${SERVER.API_BASE_URL}/v1/reminder`,
    handler: async (request: Request | any, h: ResponseToolkit) => {
      try {
        const payload: ReminderRequest.Add = request.payload;
        const tokenData = request?.auth?.credentials;
        const result = await reminderControllerV1.addReminder(payload, tokenData);
        return responseHandler.sendSuccess(h, result);
      } catch (error) {
        return responseHandler.sendError(request, error);
      }
    },
    config: {
      tags: ["api", "reminder"],
      description: "Add Reminder",
      auth: {
        strategies: ["CommonAuth"],
      },
      validate: {
        headers: authorizationHeaderObj,
        payload: addReminder,
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
    path: `${SERVER.API_BASE_URL}/v1/reminder`,
    handler: async (request: Request | any, h: ResponseToolkit) => {
      try {
        const query = request.query;
        const tokenData: TokenData = request.auth?.credentials?.tokenData;
        const result = await reminderControllerV1.reminderList(query,tokenData);
        return responseHandler.sendSuccess(h, result);
      } catch (error) {
        return responseHandler.sendError(request, error);
      }
    },
    config: {
      tags: ["api", "reminder"],
      description: "Reminder List",
      auth: {
        strategies: ["CommonAuth"],
      },
      validate: {
        headers: authorizationHeaderObj,
        query: reminderListing,
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
    path: `${SERVER.API_BASE_URL}/v1/reminder`,
    handler: async (request: Request | any, h: ResponseToolkit) => {
      try {
        const params: ReminderRequest.Id = request.query;
        const tokenData = request?.auth?.credentials;
        console.log(params);
        const result = await reminderControllerV1.deleteReminder(params,tokenData);
        return responseHandler.sendSuccess(h, result);
      } catch (error) {
        return responseHandler.sendError(request, error);
      }
    },
    config: {
      tags: ["api", "reminder"],
      description: "Delete Reminder",
      auth: {
        strategies: ["CommonAuth"],
      },
      validate: {
        headers: authorizationHeaderObj,
        query: reminder,
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
