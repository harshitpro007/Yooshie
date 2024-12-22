"use strict";

import { MESSAGES, USER_TYPE } from "@config/constant";
import { dashboardActivityDaoV1 } from "@modules/dashboardActivity/index";

export class DashboardActivityController {
  /**
   * @function AdddashboardActivity
   */
  async dashboardActivity(params: any) {
    try {
      console.log("params", params);
      if (
        params.userType == USER_TYPE.ADMIN ||
        params.userType == USER_TYPE.ASSISTANT
      ) {
        await dashboardActivityDaoV1.logAssistantActivity(
          params.userId, //assitant or admin id
          params.actionType
        );
      } else {
        await dashboardActivityDaoV1.logUserActivity(
          params.userId,
          params.actionType
        );
      }
      return MESSAGES.SUCCESS.DASHBOARD_ACTIVITY;
    } catch (error) {
      console.log("Error", error);
      throw error;
    }
  }
}

export const dashboardActivityController = new DashboardActivityController();
