"use strict";

import { SERVER } from "@config/environment";
import { ResponseToolkit } from "@hapi/hapi";
import { smsProxy } from "./controller";
import { headerObject } from "@utils/validator";
import { failActionFunction } from "@utils/appUtils";
import { REGEX, SWAGGER_DEFAULT_RESPONSE_MESSAGES } from "@config/constant";
import { responseHandler } from "@utils/ResponseHandler";
import Joi = require("joi");

export const vonageRoute = [
    {
        method: "POST",
        path: `${SERVER.API_BASE_URL}/v1/vonage`,
        handler: async (request: any, h: ResponseToolkit) => {
            try {
                const { userANumber, userBNumber } = request.payload;
                const result = await smsProxy.createChat(userANumber, userBNumber);
                return responseHandler.sendSuccess(h, result);
            } catch (error) {
                return responseHandler.sendError(request, error);
            }
        },
        options: {
            tags: ["api", "vonage"],
            description: "send message",
            auth: {
                strategies: ["BasicAuth"],
            },
            validate: {
                headers: headerObject["required"],
                payload: Joi.object({
                    userANumber: Joi.string().trim(),
                    userBNumber: Joi.string().trim(),
                }),
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
        path: `${SERVER.API_BASE_URL}/v1/inbound-sms`,
        handler: async (request: any, h: ResponseToolkit) => {
            try {
                const { msisdn, text, to } = request.query;
                const result = await smsProxy.proxySms(msisdn, text);;
                return responseHandler.sendSuccess(h, result);
            } catch (error) {
                return responseHandler.sendError(request, error);
            }
        },
        options: {
            tags: ["api", "vonage"],
            description: "receive message",
            auth: {
                strategies: ["BasicAuth"],
            },
            validate: {
                headers: headerObject["required"],
                query: Joi.object({
                    msisdn: Joi.string().trim(),
                    text: Joi.string().trim(),
                    to: Joi.string().trim(),
                }),
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
        path: `${SERVER.API_BASE_URL}/v1/create-user`,
        handler: async (request: any, h: ResponseToolkit) => {
            try {
                const { userId } = request.payload;
                const result = await smsProxy.createUser(userId);
                return responseHandler.sendSuccess(h, result);
            } catch (error) {
                return responseHandler.sendError(request, error);
            }
        },
        options: {
            tags: ["api", "vonage"],
            description: "send message",
            auth: {
                strategies: ["BasicAuth"],
            },
            validate: {
                headers: headerObject["required"],
                payload: Joi.object({
                    userId: Joi.string().trim().required().regex(REGEX.MONGO_ID),
                }),
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
        path: `${SERVER.API_BASE_URL}/v1/create-group`,
        handler: async (request: any, h: ResponseToolkit) => {
            try {
                const { memberIds } = request.payload;
                const result = await smsProxy.createGroup(memberIds);
                return responseHandler.sendSuccess(h, result);
            } catch (error) {
                return responseHandler.sendError(request, error);
            }
        },
        options: {
            tags: ["api", "vonage"],
            description: "send message",
            auth: {
                strategies: ["BasicAuth"],
            },
            validate: {
                headers: headerObject["required"],
                payload: Joi.object({
                    memberIds: Joi.array(),
                }),
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
        path: `${SERVER.API_BASE_URL}/v1/create-events`,
        handler: async (request: any, h: ResponseToolkit) => {
            try {
                const payload = request.payload;
                const result = await smsProxy.createEvents(payload);
                return responseHandler.sendSuccess(h, result);
            } catch (error) {
                return responseHandler.sendError(request, error);
            }
        },
        options: {
            tags: ["api", "vonage"],
            description: "send message",
            auth: {
                strategies: ["BasicAuth"],
            },
            validate: {
                headers: headerObject["required"],
                payload: Joi.object({
                    conversationId: Joi.string().trim(),
                    memberId: Joi.string().trim(),
                    message: Joi.string(),
                }),
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
        path: `${SERVER.API_BASE_URL}/v1/send-message`,
        handler: async (request: any, h: ResponseToolkit) => {
            try {
                const payload = request.payload;
                const result = await smsProxy.vonageSend(payload);
                return responseHandler.sendSuccess(h, result);
            } catch (error) {
                return responseHandler.sendError(request, error);
            }
        },
        options: {
            tags: ["api", "vonage"],
            description: "send message",
            auth: {
                strategies: ["BasicAuth"],
            },
            validate: {
                headers: headerObject["required"],
                payload: Joi.object({
                    fromId: Joi.string().trim().required().regex(REGEX.MONGO_ID),
                    toId: Joi.string().trim().required().regex(REGEX.MONGO_ID),
                    message: Joi.string(),
                }),
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
        path: `${SERVER.API_BASE_URL}/v1/messages`,
        handler: async (request: any, h: ResponseToolkit) => {
            try {
                const { conversationId } = request.query;
                const result = await smsProxy.getMessagesListing(conversationId);;
                return responseHandler.sendSuccess(h, result);
            } catch (error) {
                return responseHandler.sendError(request, error);
            }
        },
        options: {
            tags: ["api", "vonage"],
            description: "message listing",
            auth: {
                strategies: ["BasicAuth"],
            },
            validate: {
                headers: headerObject["required"],
                query: Joi.object({
                    conversationId: Joi.string().trim()
                }),
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
