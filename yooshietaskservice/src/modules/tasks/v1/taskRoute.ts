"use strict";

import { Request, ResponseToolkit } from "@hapi/hapi";

import { failActionFunction } from "@utils/appUtils";
import { authorizationHeaderObj } from "@utils/validator";
import { taskControllerV1 } from "@modules/tasks/index";
import { SWAGGER_DEFAULT_RESPONSE_MESSAGES, SERVER } from "@config/index";
import { responseHandler } from "@utils/ResponseHandler";
import {
  addTask,
  calender,
  editTask,
  task,
  taskListing,
} from "./routeValidate";

export const taskRoute = [
  {
    method: "GET",
    path: `${SERVER.API_BASE_URL}/v1/task/taskDetails`,
    handler: async (request: Request | any, h: ResponseToolkit) => {
      try {
        const query: TaskRequest.Id = request.query;
        const result = await taskControllerV1.taskDetails(query);
        return responseHandler.sendSuccess(h, result);
      } catch (error) {
        return responseHandler.sendError(request, error);
      }
    },
    config: {
      tags: ["api", "tasks"],
      description: "Task Details",
      auth: {
        strategies: ["CommonAuth"],
      },
      validate: {
        headers: authorizationHeaderObj,
        query: task,
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
    path: `${SERVER.API_BASE_URL}/v1/task/editTask`,
    handler: async (request: Request | any, h: ResponseToolkit) => {
      try {
        const tokenData = request?.auth?.credentials;
        const payload: TaskRequest.Edit = request.payload;
        const result = await taskControllerV1.editTask(payload, tokenData);
        return responseHandler.sendSuccess(h, result);
      } catch (error) {
        return responseHandler.sendError(request, error);
      }
    },
    config: {
      tags: ["api", "tasks"],
      description: "Update .",
      auth: {
        strategies: ["CommonAuth"],
      },
      validate: {
        headers: authorizationHeaderObj,
        payload: editTask,
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
    path: `${SERVER.API_BASE_URL}/v1/task/addTask`,
    handler: async (request: Request | any, h: ResponseToolkit) => {
      try {
        const tokenData = request?.auth?.credentials;
        const payload: TaskRequest.Add = request.payload;
        const result = await taskControllerV1.addTask(payload, tokenData);
        return responseHandler.sendSuccess(h, result);
      } catch (error) {
        return responseHandler.sendError(request, error);
      }
    },
    config: {
      tags: ["api", "tasks"],
      description: "Add Task",
      auth: {
        strategies: ["CommonAuth"],
      },
      validate: {
        headers: authorizationHeaderObj,
        payload: addTask,
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
    path: `${SERVER.API_BASE_URL}/v1/task/taskList`,
    handler: async (request: Request | any, h: ResponseToolkit) => {
      try {
        const query: TaskRequest.taskListing = request.query;
        const tokenData: TokenData = request.auth?.credentials?.tokenData;
        const result = await taskControllerV1.taskList(query, tokenData);
        return responseHandler.sendSuccess(h, result);
      } catch (error) {
        return responseHandler.sendError(request, error);
      }
    },
    config: {
      tags: ["api", "tasks"],
      description: "Task List",
      auth: {
        strategies: ["CommonAuth"],
      },
      validate: {
        headers: authorizationHeaderObj,
        query: taskListing,
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
    path: `${SERVER.API_BASE_URL}/v1/task/deleteTask`,
    handler: async (request: Request | any, h: ResponseToolkit) => {
      try {
        const params: TaskRequest.Id = request.query;
        const tokenData = request.auth?.credentials;
        const result = await taskControllerV1.deleteTask(params, tokenData);
        return responseHandler.sendSuccess(h, result);
      } catch (error) {
        return responseHandler.sendError(request, error);
      }
    },
    config: {
      tags: ["api", "tasks"],
      description: "Delete Task",
      auth: {
        strategies: ["CommonAuth"],
      },
      validate: {
        headers: authorizationHeaderObj,
        query: task,
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
    path: `${SERVER.API_BASE_URL}/v1/calender-details`,
    handler: async (request: Request | any, h: ResponseToolkit) => {
      try {
        const tokenData: TokenData = request.auth?.credentials?.tokenData;
        const query = request.query;
        const result = await taskControllerV1.getCalenderData(tokenData, query);
        return responseHandler.sendSuccess(h, result);
      } catch (error) {
        return responseHandler.sendError(request, error);
      }
    },
    config: {
      tags: ["api", "calender"],
      description: "Calender Details",
      auth: {
        strategies: ["CommonAuth"],
      },
      validate: {
        headers: authorizationHeaderObj,
        query: calender,
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
    path: `${SERVER.API_BASE_URL}/v1/calender-dates`,
    handler: async (request: Request | any, h: ResponseToolkit) => {
      try {
        const tokenData: TokenData = request.auth?.credentials?.tokenData;
        const query = request.query;
        const result = await taskControllerV1.getCalenderDates(
          tokenData,
          query
        );
        return responseHandler.sendSuccess(h, result);
      } catch (error) {
        return responseHandler.sendError(request, error);
      }
    },
    config: {
      tags: ["api", "calender"],
      description: "Calender Details",
      auth: {
        strategies: ["CommonAuth"],
      },
      validate: {
        headers: authorizationHeaderObj,
        query: calender,
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
    path: `${SERVER.API_BASE_URL}/v1/getUpcomingAssistantTask`,
    handler: async (request: Request | any, h: ResponseToolkit) => {
      try {
        const tokenData: TokenData = request.auth?.credentials?.tokenData;
        const query = request.query;
        const result = await taskControllerV1.getUpcomingTasksAndReminders(
          tokenData
        );
        return responseHandler.sendSuccess(h, result);
      } catch (error) {
        return responseHandler.sendError(request, error);
      }
    },
    config: {
      tags: ["api", "tasks"],
      description: "getUpcomingAssistantTask Details",
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
