"use strict";

import { ResponseToolkit } from "@hapi/hapi";
import { failActionFunction } from "@utils/appUtils";
import { authorizationHeaderObj, headerObject } from "@utils/validator";
import { SWAGGER_DEFAULT_RESPONSE_MESSAGES, SERVER } from "@config/index";
import { responseHandler } from "@utils/ResponseHandler";
import { notificationControllerV1 } from "..";
import {
  emailTemplate,
  notificationDetails,
  notificationList,
  readNotification,
  sendMessage,
  sendNotification,
} from "./routeValidate";

export const notificationRoute = [
  {
    method: "POST",
    path: `${SERVER.API_BASE_URL}/v1/notification/email-template`,
    handler: async (request: any, h: ResponseToolkit) => {
      try {
        const payload = request.payload;
        const result = await notificationControllerV1.emailHandler(payload);
        return responseHandler.sendSuccess(h, result);
      } catch (error) {
        return responseHandler.sendError(request, error);
      }
    },
    options: {
      tags: ["api", "notification"],
      description: "send email template",
      auth: {
        strategies: ["BasicAuth"],
      },
      validate: {
        headers: headerObject["required"],
        payload: emailTemplate,
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
    path: `${SERVER.API_BASE_URL}/v1/notification/send`,
    handler: async (request: Request | any, h: ResponseToolkit) => {
      try {
        const tokenData: TokenData =
          request.auth &&
          request.auth.credentials &&
          request.auth.credentials.tokenData;
        const payload: NotificationRequest.Save = request.payload;
        const result = await notificationControllerV1.sendNotification(
          payload,
          tokenData
        );

        return responseHandler.sendSuccess(h, result);
      } catch (error) {
        return responseHandler.sendError(request, error);
      }
    },
    config: {
      tags: ["api", "notification"],
      description: "Create New Notification",
      auth: {
        strategies: ["CommonAuth"],
      },
      validate: {
        headers: authorizationHeaderObj,
        payload: sendNotification,
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
    path: `${SERVER.API_BASE_URL}/v1/notification/message`,
    handler: async (request: any, h: ResponseToolkit) => {
      try {
        const payload = request.payload;
        const result = await notificationControllerV1.sendMessage(payload);
        return responseHandler.sendSuccess(h, result);
      } catch (error) {
        return responseHandler.sendError(request, error);
      }
    },
    options: {
      tags: ["api", "notification"],
      description: "send message on mobileNumber",
      auth: {
        strategies: ["BasicAuth"],
      },
      validate: {
        headers: headerObject["required"],
        payload: sendMessage,
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
        const tokenData: TokenData =
          request.auth &&
          request.auth.credentials &&
          request.auth.credentials.tokenData;
        const result = await notificationControllerV1.notificationList(
          query,
          tokenData
        );
        return responseHandler.sendSuccess(h, result);
      } catch (error) {
        return responseHandler.sendError(request, error);
      }
    },
    config: {
      tags: ["api", "notification"],
      description: "Notification List",
      auth: {
        strategies: ["CommonAuth"],
      },
      validate: {
        headers: authorizationHeaderObj,
        query: notificationList,
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
    path: `${SERVER.API_BASE_URL}/v1/notification-details`,
    handler: async (request: Request | any, h: ResponseToolkit) => {
      try {
        const query: NotificationRequest.Read = request.query;
        const tokenData: TokenData =
          request.auth &&
          request.auth.credentials &&
          request.auth.credentials.tokenData;
        const result = await notificationControllerV1.notificationDetails(
          query,
          tokenData
        );
        return responseHandler.sendSuccess(h, result);
      } catch (error) {
        return responseHandler.sendError(request, error);
      }
    },
    config: {
      tags: ["api", "notification"],
      description: "Notification List",
      auth: {
        strategies: ["CommonAuth"],
      },
      validate: {
        headers: authorizationHeaderObj,
        query: notificationDetails,
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
    path: `${SERVER.API_BASE_URL}/v1/notification/read`,
    handler: async (request: Request | any, h: ResponseToolkit) => {
      try {
        const tokenData: TokenData =
          request.auth &&
          request.auth.credentials &&
          request.auth.credentials.tokenData;
        const payload: NotificationRequest.Read = request.payload;
        const result = await notificationControllerV1.readNotfication(
          payload,
          tokenData
        );

        return responseHandler.sendSuccess(h, result);
      } catch (error) {
        return responseHandler.sendError(request, error);
      }
    },
    config: {
      tags: ["api", "notification"],
      description: "read New Notification",
      auth: {
        strategies: ["CommonAuth"],
      },
      validate: {
        headers: authorizationHeaderObj,
        payload: readNotification,
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
    path: `${SERVER.API_BASE_URL}/v1/notification`,
    handler: async (request: Request | any, h: ResponseToolkit) => {
      const tokenData: TokenData = request?.auth?.credentials?.tokenData;
      const query = request.query;
      try {
        const result = await notificationControllerV1.deleteNotfication(
          query,
          tokenData
        );
        return responseHandler.sendSuccess(h, result);
      } catch (error) {
        return responseHandler.sendError(request, error);
      }
    },
    config: {
      tags: ["api", "notification"],
      description: "Notification Clear/Delete",
      auth: {
        strategies: ["CommonAuth"],
      },
      validate: {
        headers: authorizationHeaderObj,
        query: readNotification,
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
    path: `${SERVER.API_BASE_URL}/v1/notification`,
    handler: async (request: Request | any, h: ResponseToolkit) => {
      try {
        const payload: NotificationRequest.Save = request.payload;
        const tokenData = {
          userId: payload.receiverId[0],
          userType: payload.userType
        }
        const result = await notificationControllerV1.sendNotification(payload,tokenData);

        return responseHandler.sendSuccess(h, result);
      } catch (error) {
        return responseHandler.sendError(request, error);
      }
    },
    config: {
      tags: ["api", "internal"],
      description: "Send New Notification",
      auth: {
        strategies: ["BasicAuth"],
      },
      validate: {
        headers: authorizationHeaderObj,
        payload: sendNotification,
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
