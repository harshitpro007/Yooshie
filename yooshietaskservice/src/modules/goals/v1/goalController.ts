"use strict";

import { DASHBOARD_ACTION, MESSAGES, NOTIFICATION_TYPE, STATUS, USER_TYPE } from "@config/constant";
import { SERVER } from "@config/environment";
import { axiosService } from "@lib/axiosService";
import { goalDaoV1 } from "@modules/goals/index";
import { userDaoV1 } from "@modules/user";

export class GoalController {
  /**
   * @function goalDetails
   */
  async goalDetails(params: GoalRequest.Id) {
    try {
      const step1 = await goalDaoV1.goalDetails(params);
      return MESSAGES.SUCCESS.DETAILS(step1);
    } catch (error) {
      console.log("Error in goal", error);
      throw error;
    }
  }

  /**
   * @function editGoal
   */
  async editGoal(params: GoalRequest.Edit, tokenData: any) {
    try {
      let userDetails;
      if(tokenData.tokenData.userType === USER_TYPE.USER){
        userDetails = await userDaoV1.findUserById(tokenData.tokenData.userId);
        if(!userDetails) return Promise.reject(MESSAGES.ERROR.USER_NOT_FOUND);
      }
      const step1 = await goalDaoV1.goalDetails(params);
      if (!step1) return Promise.reject(MESSAGES.ERROR.GOAL_NOT_FOUND);
      const result = await goalDaoV1.editGoal(params);

      if (params.status == STATUS.COMPLETED) {
        let rewardData = {
          userId: step1.userId,
          goalId: params.id,
        };
        axiosService.post({
          url: SERVER.USER_APP_URL + SERVER.GOAL_REWARD,
          body: rewardData,
          auth: `Bearer ${tokenData?.accessToken}`,
        });
      }

      this.trackDashboardEvents(tokenData, DASHBOARD_ACTION.GOAL_UPDATE_CREATED);
      if (tokenData.tokenData.userType === USER_TYPE.ASSISTANT && !params.status) {
        if (result) {
          const sendNotificationData = {
            type: NOTIFICATION_TYPE.UPDATE_GOAL_ASSISTANT,
            receiverId: [step1.userId],
            userType: USER_TYPE.USER,
            details: {
              senderId: tokenData.tokenData.userId,
              title: result.title,
              goalId: params.id,
              type: NOTIFICATION_TYPE.UPDATE_GOAL_ASSISTANT
            }
          }
          axiosService.post({ "url": process.env.NOTIFICATION_APP_URL + SERVER.SEND_NOTIFICATION, "body": sendNotificationData, "auth": `Bearer ${tokenData.accessToken}` });
        }
      }
      else if (tokenData.tokenData.userType === USER_TYPE.USER && !params.status) {
        if (result) {
          const sendNotificationData = {
            type: NOTIFICATION_TYPE.UPDATE_GOAL_USER,
            receiverId: [userDetails.assistantId],
            userType: USER_TYPE.ASSISTANT,
            details: {
              senderId: tokenData.tokenData.userId,
              title: result.title,
              goalId: params.id,
              type: NOTIFICATION_TYPE.UPDATE_GOAL_USER
            }
          }
          axiosService.post({ "url": process.env.NOTIFICATION_APP_URL + SERVER.SEND_NOTIFICATION, "body": sendNotificationData, "auth": `Bearer ${tokenData.accessToken}` });
        }
      }
      if(tokenData.tokenData.userType === USER_TYPE.ASSISTANT && params.status === STATUS.COMPLETED){
        if (result) {
          const sendNotificationData = {
            type: NOTIFICATION_TYPE.GOAL_MARKED_COMPLETED_ASSISTANT,
            receiverId: [result.userId],
            userType: USER_TYPE.USER,
            details: {
              senderId: tokenData.tokenData.userId,
              goalId: params.id,
              type: NOTIFICATION_TYPE.GOAL_MARKED_COMPLETED_ASSISTANT
            }
          }
          axiosService.post({ "url": process.env.NOTIFICATION_APP_URL + SERVER.SEND_NOTIFICATION, "body": sendNotificationData, "auth": `Bearer ${tokenData.accessToken}` });
        }
      }
      return MESSAGES.SUCCESS.GOAL_EDIT;
    } catch (error) {
      console.log("Error in goal", error);
      throw error;
    }
  }

  /**
   * @function goalList
   */
  async goalList(params: GoalRequest.goalRequest, tokenData: TokenData) {
    try {
      params.userId = params?.userId ? params?.userId : tokenData.userId;
      const step1 = await goalDaoV1.goalList(params);
      return MESSAGES.SUCCESS.LIST(step1);
    } catch (error) {
      console.log("Error in goal", error);
      throw error;
    }
  }

  /**
   * @function deleteGoal
   */
  async deleteGoal(params: GoalRequest.Id, tokenData) {
    try {
      let userDetails;
      if(tokenData.tokenData.userType === USER_TYPE.USER){
        userDetails = await userDaoV1.findUserById(tokenData.tokenData.userId);
        if(!userDetails) return Promise.reject(MESSAGES.ERROR.USER_NOT_FOUND);
      }
      const result = await goalDaoV1.deleteGoal(params);
      if (tokenData.tokenData.userType === USER_TYPE.ASSISTANT) {
        if (result) {
          const sendNotificationData = {
            type: NOTIFICATION_TYPE.DELETE_GOAL_ASSISTANT,
            receiverId: [result.userId],
            userType: USER_TYPE.USER,
            details: {
              senderId: tokenData.tokenData.userId,
              title: result.title,
              goalId: params.id,
              type: NOTIFICATION_TYPE.DELETE_GOAL_ASSISTANT
            }
          }
          axiosService.post({ "url": process.env.NOTIFICATION_APP_URL + SERVER.SEND_NOTIFICATION, "body": sendNotificationData, "auth": `Bearer ${tokenData.accessToken}` });
        }
      }
      else if (tokenData.tokenData.userType === USER_TYPE.USER) {
        if (result) {
          const sendNotificationData = {
            type: NOTIFICATION_TYPE.DELETE_GOAL_USER,
            receiverId: [userDetails.assistantId],
            userType: USER_TYPE.ASSISTANT,
            details: {
              senderId: tokenData.tokenData.userId,
              title: result.title,
              goalId: params.id,
              type: NOTIFICATION_TYPE.DELETE_GOAL_USER
            }
          }
          axiosService.post({ "url": process.env.NOTIFICATION_APP_URL + SERVER.SEND_NOTIFICATION, "body": sendNotificationData, "auth": `Bearer ${tokenData.accessToken}` });
        }
      }
      return MESSAGES.SUCCESS.GOAL_DELETE;
    } catch (error) {
      console.log("Error in goal", error);
      throw error;
    }
  }
  /**
   * @function addGoal
   */
  async addGoal(params: GoalRequest.Add, tokenData: any) {
    try {
      const userDetails = await userDaoV1.findUserById(params.userId);
      if(!userDetails) return Promise.reject(MESSAGES.ERROR.USER_NOT_FOUND);
      
      const result = await goalDaoV1.addGoal(params);
      this.trackDashboardEvents(tokenData, DASHBOARD_ACTION.GOAL_UPDATE_CREATED);
      if (tokenData.tokenData.userType === USER_TYPE.ASSISTANT) {
        if (result) {
          const sendNotificationData = {
            type: NOTIFICATION_TYPE.ADD_NEW_GOAL_ASSISTANT,
            receiverId: [params.userId],
            userType: USER_TYPE.USER,
            details: {
              senderId: tokenData.tokenData.userId,
              title: result.title,
              goalId: result._id,
              type: NOTIFICATION_TYPE.ADD_NEW_GOAL_ASSISTANT
            }
          }
          axiosService.post({ "url": process.env.NOTIFICATION_APP_URL + SERVER.SEND_NOTIFICATION, "body": sendNotificationData, "auth": `Bearer ${tokenData.accessToken}` });
        }
      }
      else if (tokenData.tokenData.userType === USER_TYPE.USER) {
        if (result) {
          const sendNotificationData = {
            type: NOTIFICATION_TYPE.ADD_NEW_GOAL_USER,
            receiverId: [userDetails.assistantId],
            userType: USER_TYPE.ASSISTANT,
            details: {
              senderId: tokenData.tokenData.userId,
              title: result.title,
              goalId: result._id,
              type: NOTIFICATION_TYPE.ADD_NEW_GOAL_USER
            }
          }
          axiosService.post({ "url": process.env.NOTIFICATION_APP_URL + SERVER.SEND_NOTIFICATION, "body": sendNotificationData, "auth": `Bearer ${tokenData.accessToken}` });
        }
      }
      return MESSAGES.SUCCESS.ADD_GOAL;
    } catch (error) {
      console.log("Error in goal", error);
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

export const goalController = new GoalController();
