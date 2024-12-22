"use strict";

import { Request, ResponseToolkit } from "@hapi/hapi";

import { failActionFunction } from "@utils/appUtils";
import { authorizationHeaderObj } from "@utils/validator";
import { SWAGGER_DEFAULT_RESPONSE_MESSAGES, SERVER } from "@config/index";
import { responseHandler } from "@utils/ResponseHandler";
import { addCalender } from "./routeValidate";
import { calendarControllerV1 } from "..";

export const calendarRoute = [
  {
    method: "POST",
    path: `${SERVER.API_BASE_URL}/v1/calender-events`,
    handler: async (request: Request, h: ResponseToolkit) => {
      const Payload: any = request.payload;

      try {
        const result = await calendarControllerV1.addCalenderEVents(Payload);
        return responseHandler.sendSuccess(h, result);
      } catch (error) {
        return responseHandler.sendError(request, error);
      }
    },
    config: {
      tags: ["api", "calender"],
      description: "Add Calender Events",
      auth: {
        strategies: ["UserAuth"],
      },
      validate: {
        headers: authorizationHeaderObj,
        payload: addCalender,
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
