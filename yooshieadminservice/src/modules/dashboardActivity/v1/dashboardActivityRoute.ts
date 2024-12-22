"use strict";

import { Request, ResponseToolkit } from "@hapi/hapi";

import { failActionFunction } from "@utils/appUtils";
import { authorizationHeaderObj } from "@utils/validator";
import { dashboardActivityControllerV1 } from "@modules/dashboardActivity/index";
import { SWAGGER_DEFAULT_RESPONSE_MESSAGES, SERVER } from "@config/index";
import { responseHandler } from "@utils/ResponseHandler";
import { AddDashboardLog } from "./routeValidate";

export const dashboardRoute = [
  {
    method: "POST",
    path: `${SERVER.API_BASE_URL}/v1/dashboard/add-logs`,
    handler: async (request: Request | any, h: ResponseToolkit) => {
      try {
        const tokenData: TokenData = request?.auth?.credentials?.tokenData;

        const payload = request.payload;
        payload.userType = tokenData.userType;
        const result = await dashboardActivityControllerV1.dashboardActivity(
          payload
        );
        return responseHandler.sendSuccess(h, result);
      } catch (error) {
        return responseHandler.sendError(request, error);
      }
    },
    config: {
      tags: ["api", "Dashboard"],
      description: "Add Dashboard Activity",
      auth: {
        strategies: ["CommonAuth"],
      },
      validate: {
        headers: authorizationHeaderObj,
        payload: AddDashboardLog,
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
