"use strict";

import { DASHBOARD_ACTION, MESSAGES, NOTIFICATION_TYPE, STATUS, USER_TYPE } from "@config/constant";
import { SERVER } from "@config/environment";
import { axiosService } from "@lib/axiosService";
import { budgetDaoV1 } from "@modules/budget/index";
import { userDaoV1 } from "@modules/user";

export class BudgetController {
  /**
   * @function budgetDetails
   */
  async budgetDetails(params: BudgetRequest.Id) {
    try {
      const step1 = await budgetDaoV1.budgetDetails(params);
      return MESSAGES.SUCCESS.DETAILS(step1);
    } catch (error) {
      console.log("Error in budget", error);
      throw error;
    }
  }

  /**
   * @function editBudget
   */
  async editBudget(params: BudgetRequest.Edit, tokenData: any) {
    try {
      let userDetails;
      if(tokenData.tokenData.userType === USER_TYPE.USER){
        userDetails = await userDaoV1.findUserById(tokenData.tokenData.userId);
        if(!userDetails) return Promise.reject(MESSAGES.ERROR.USER_NOT_FOUND);
      }
      const step1 = await budgetDaoV1.budgetDetails(params);
      if (!step1) return Promise.reject(MESSAGES.ERROR.BUDGET_NOT_FOUND);
      const result = await budgetDaoV1.editBudget(params);
      if (params.status == STATUS.COMPLETED) {
        let rewardData = {
          userId: step1.userId,
          budgetId: params.id,
        };
        axiosService.post({
          url: SERVER.USER_APP_URL + SERVER.BUDGET_REWARD,
          body: rewardData,
          auth: `Bearer ${tokenData.accessToken}`,
        });
      }
      this.trackDashboardEvents(tokenData, DASHBOARD_ACTION.BUDGET_UPDATE_CREATED);
      if (tokenData.tokenData.userType === USER_TYPE.ASSISTANT && !params.status) {
        if (result) {
          const sendNotificationData = {
            type: NOTIFICATION_TYPE.UPDATE_BUDGET_ASSISTANT,
            receiverId: [step1.userId],
            userType: USER_TYPE.USER,
            details: {
              senderId: tokenData.tokenData.userId,
              title: result.title,
              budgetId: params.id,
              type: NOTIFICATION_TYPE.UPDATE_BUDGET_ASSISTANT
            }
          }
          axiosService.post({ "url": process.env.NOTIFICATION_APP_URL + SERVER.SEND_NOTIFICATION, "body": sendNotificationData, "auth": `Bearer ${tokenData.accessToken}` });
        }
      }
      else if (tokenData.tokenData.userType === USER_TYPE.USER && !params.status) {
        if (result) {
          const sendNotificationData = {
            type: NOTIFICATION_TYPE.UPDATE_BUDGET_USER,
            receiverId: [userDetails.assistantId],
            userType: USER_TYPE.ASSISTANT,
            details: {
              senderId: tokenData.tokenData.userId,
              title: result.title,
              budgetId: params.id,
              type: NOTIFICATION_TYPE.UPDATE_BUDGET_USER
            }
          }
          axiosService.post({ "url": process.env.NOTIFICATION_APP_URL + SERVER.SEND_NOTIFICATION, "body": sendNotificationData, "auth": `Bearer ${tokenData.accessToken}` });
        }
      }
      if(tokenData.tokenData.userType === USER_TYPE.ASSISTANT && params.status === STATUS.COMPLETED){
        if (result) {
          const sendNotificationData = {
            type: NOTIFICATION_TYPE.BUDGET_MARKED_COMPLETED_ASSISTANT,
            receiverId: [result.userId],
            userType: USER_TYPE.USER,
            details: {
              senderId: tokenData.tokenData.userId,
              budgetId: params.id,
              type: NOTIFICATION_TYPE.BUDGET_MARKED_COMPLETED_ASSISTANT
            }
          }
          axiosService.post({ "url": process.env.NOTIFICATION_APP_URL + SERVER.SEND_NOTIFICATION, "body": sendNotificationData, "auth": `Bearer ${tokenData.accessToken}` });
        }
      }
      return MESSAGES.SUCCESS.EDIT_BUDGET;
    } catch (error) {
      console.log("Error in budget", error);
      throw error;
    }
  }

  /**
   * @function budgetList
   */
  async budgetList(params: BudgetRequest.budgetRequest, tokenData: TokenData) {
    try {
      params.userId = params?.userId ? params?.userId : tokenData.userId;
      const step1 = await budgetDaoV1.budgetList(params);
      return MESSAGES.SUCCESS.LIST(step1);
    } catch (error) {
      console.log("Error in budget", error);
      throw error;
    }
  }

  /**
   * @function deleteBudget
   */
  async deleteBudget(params: BudgetRequest.Id,tokenData) {
    try {
      let userDetails;
      console.log(tokenData);
      if(tokenData.tokenData.userType === USER_TYPE.USER){
        userDetails = await userDaoV1.findUserById(tokenData.tokenData.userId);
        if(!userDetails) return Promise.reject(MESSAGES.ERROR.USER_NOT_FOUND);
      }
      const result = await budgetDaoV1.deleteBudget(params);
      if (tokenData.tokenData.userType === USER_TYPE.ASSISTANT) {
        if (result) {
          const sendNotificationData = {
            type: NOTIFICATION_TYPE.DELETE_TASK_ASSISTANT,
            receiverId: [result.userId],
            userType: USER_TYPE.USER,
            details: {
              senderId: tokenData.tokenData.userId,
              title: result.title,
              budgetId: params.id,
              type: NOTIFICATION_TYPE.DELETE_TASK_ASSISTANT
            }
          }
          axiosService.post({ "url": process.env.NOTIFICATION_APP_URL + SERVER.SEND_NOTIFICATION, "body": sendNotificationData, "auth": `Bearer ${tokenData.accessToken}` });
        }
      }
      else if (tokenData.tokenData.userType === USER_TYPE.USER) {
        if (result) {
          const sendNotificationData = {
            type: NOTIFICATION_TYPE.DELETE_TASK_USER,
            receiverId: [userDetails.assistantId],
            userType: USER_TYPE.ASSISTANT,
            details: {
              senderId: tokenData.tokenData.userId,
              title: result.title,
              budgetId: params.id,
              type: NOTIFICATION_TYPE.DELETE_TASK_USER
            }
          }
          axiosService.post({ "url": process.env.NOTIFICATION_APP_URL + SERVER.SEND_NOTIFICATION, "body": sendNotificationData, "auth": `Bearer ${tokenData.accessToken}` });
        }
      }
      return MESSAGES.SUCCESS.DELETE_BUDGET;
    } catch (error) {
      console.log("Error in budget", error);
      throw error;
    }
  }
  /**
   * @function addBudget
   */
  async addBudget(params: BudgetRequest.Add, tokenData: any) {
    try {
      const userDetails = await userDaoV1.findUserById(params.userId);
      if(!userDetails) return Promise.reject(MESSAGES.ERROR.USER_NOT_FOUND);
      const result = await budgetDaoV1.addBudget(params);
      this.trackDashboardEvents(tokenData, DASHBOARD_ACTION.BUDGET_UPDATE_CREATED);
      if (tokenData.tokenData.userType === USER_TYPE.ASSISTANT) {
        if (result) {
          const sendNotificationData = {
            type: NOTIFICATION_TYPE.ADD_NEW_BUDGET_ASSISTANT,
            receiverId: [params.userId],
            userType: USER_TYPE.USER,
            details: {
              senderId: tokenData.tokenData.userId,
              title: result.title,
              budgetId: result._id,
              type: NOTIFICATION_TYPE.ADD_NEW_BUDGET_ASSISTANT
            }
          }
          axiosService.post({ "url": process.env.NOTIFICATION_APP_URL + SERVER.SEND_NOTIFICATION, "body": sendNotificationData, "auth": `Bearer ${tokenData.accessToken}` });
        }
      }
      else if (tokenData.tokenData.userType === USER_TYPE.USER) {
        if (result) {
          const sendNotificationData = {
            type: NOTIFICATION_TYPE.ADD_NEW_BUDGET_USER,
            receiverId: [userDetails.assistantId],
            userType: USER_TYPE.ASSISTANT,
            details: {
              senderId: tokenData.tokenData.userId,
              title: result.title,
              budgetId: result._id,
              type: NOTIFICATION_TYPE.ADD_NEW_BUDGET_USER
            }
          }
          axiosService.post({ "url": process.env.NOTIFICATION_APP_URL + SERVER.SEND_NOTIFICATION, "body": sendNotificationData, "auth": `Bearer ${tokenData.accessToken}` });
        }
      }
      return MESSAGES.SUCCESS.ADD_BUDGET;
    } catch (error) {
      console.log("Error in budget", error);
      throw error;
    }
  }

  async trackDashboardEvents(token: any, actionType: any) {
    const data = {
      userId: token?.tokenData.userId,
      actionType,
    };

    axiosService.post({
      url: SERVER.ADMIN_APP_URL + SERVER.DASHBOARD_LOG,
      body: data,
      auth: `Bearer ${token.accessToken}`,
    });
  }
}

export const budgetController = new BudgetController();
