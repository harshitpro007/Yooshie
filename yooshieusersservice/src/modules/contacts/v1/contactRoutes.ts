"use strict";

import { Request, ResponseToolkit } from "@hapi/hapi";

import { failActionFunction } from "@utils/appUtils";
import { authorizationHeaderObj } from "@utils/validator";
import { SWAGGER_DEFAULT_RESPONSE_MESSAGES, SERVER } from "@config/index";
import { responseHandler } from "@utils/ResponseHandler";
import { contactControllerV1 } from "..";
import { addContact, contactListing, deleteContact, editContact } from "./routeValidator";

export const contactRoute = [
  {
    method: "POST",
    path: `${SERVER.API_BASE_URL}/v1/user/contact`,
    handler: async (request: Request | any, h: ResponseToolkit) => {
      try {
        const payload: ContactRequest.addContact = request.payload;
        const tokenData: TokenData = request.auth?.credentials?.tokenData;
        const result = await contactControllerV1.addContact(payload, tokenData);
        return responseHandler.sendSuccess(h, result);
      } catch (error) {
        return responseHandler.sendError(request, error);
      }
    },
    config: {
        tags: ["api", "Contact"],
        description: "add user contacts",
        auth: {
            strategies: ["UserAuth"]
        },
        validate: {
        headers: authorizationHeaderObj,
        payload: addContact,
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
    path: `${SERVER.API_BASE_URL}/v1/user/contact`,
    handler: async (request: Request | any, h: ResponseToolkit) => {
      try {
        const payload: ContactRequest.editContact = request.payload;
        const tokenData: TokenData = request.auth?.credentials?.tokenData;
        const result = await contactControllerV1.editContact(payload, tokenData);
        return responseHandler.sendSuccess(h, result);
      } catch (error) {
        return responseHandler.sendError(request, error);
      }
    },
    config: {
        tags: ["api", "Contact"],
        description: "edit user contacts",
        auth: {
            strategies: ["UserAuth"]
        },
        validate: {
        headers: authorizationHeaderObj,
        payload: editContact,
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
    path: `${SERVER.API_BASE_URL}/v1/user/contact`,
    handler: async (request: Request | any, h: ResponseToolkit) => {
      try {
        const contactId:string = request.query.contactId;
        const result = await contactControllerV1.deleteContact(contactId);
        return responseHandler.sendSuccess(h, result);
      } catch (error) {
        return responseHandler.sendError(request, error);
      }
    },
    config: {
        tags: ["api", "Contact"],
        description: "delete user contacts",
        auth: {
            strategies: ["UserAuth"]
        },
        validate: {
        headers: authorizationHeaderObj,
        query: deleteContact,
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
    path: `${SERVER.API_BASE_URL}/v1/user/contact`,
    handler: async (request: Request | any, h: ResponseToolkit) => {
      try {
        const query: ListingRequest = request.query;
        const tokenData: TokenData = request.auth?.credentials?.tokenData;
        const result = await contactControllerV1.getContactListing(query, tokenData);
        return responseHandler.sendSuccess(h, result);
      } catch (error) {
        return responseHandler.sendError(request, error);
      }
    },
    config: {
        tags: ["api", "Contact"],
        description: "get user contacts listing",
        auth: {
            strategies: ["CommonAuth"]
        },
        validate: {
        headers: authorizationHeaderObj,
        query: contactListing,
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

