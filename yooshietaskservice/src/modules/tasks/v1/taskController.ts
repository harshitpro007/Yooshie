"use strict";

import {
  DASHBOARD_ACTION,
  MESSAGES,
  NOTIFICATION_TYPE,
  STATUS,
  USER_TYPE,
} from "@config/constant";
import { taskDaoV1 } from "@modules/tasks/index";
import { axiosService } from "@lib/axiosService";
import { SERVER } from "@config/environment";
import { userDaoV1 } from "@modules/user";

export class TaskController {
  /**
   * @function taskDetails
   */
  async taskDetails(params: TaskRequest.Id) {
    try {
      const step1 = await taskDaoV1.taskDetails(params);
      return MESSAGES.SUCCESS.DETAILS(step1);
    } catch (error) {
      console.log("Error in task", error);
      throw error;
    }
  }

  /**
   * @function editTask
   */
  async editTask(params: TaskRequest.Edit, tokenData) {
    try {
      let userDetails;
      if (tokenData.tokenData.userType === USER_TYPE.USER) {
        userDetails = await userDaoV1.findUserById(tokenData.tokenData.userId);
        if (!userDetails) return Promise.reject(MESSAGES.ERROR.USER_NOT_FOUND);
      }
      const step1 = await taskDaoV1.taskDetails(params);
      if (!step1) return Promise.reject(MESSAGES.ERROR.TASK_NOT_FOUND);
      const result = await taskDaoV1.editTask(params, step1);
      console.log(SERVER.USER_APP_URL);
      if (params.status == STATUS.COMPLETED) {
        let rewardData = {
          userId: step1.userId,
          taskId: params.id,
        };
        axiosService.post({
          url: SERVER.USER_APP_URL + SERVER.TASK_REWARD,
          body: rewardData,
          auth: `Bearer ${tokenData.accessToken}`,
        });
      }

      this.trackDashboardEvents(tokenData, DASHBOARD_ACTION.TASK_UPDATE_CREATED);
      if (tokenData.tokenData.userType === USER_TYPE.ASSISTANT && !params.status) {
        if (result) {
          const sendNotificationData = {
            type: NOTIFICATION_TYPE.UPDATE_TASK_ASSISTANT,
            receiverId: [step1.userId],
            userType: USER_TYPE.USER,
            details: {
              senderId: tokenData.tokenData.userId,
              title: result.title,
              taskId: params.id,
              type: NOTIFICATION_TYPE.UPDATE_TASK_ASSISTANT,
            },
          };
          axiosService.post({
            url: process.env.NOTIFICATION_APP_URL + SERVER.SEND_NOTIFICATION,
            body: sendNotificationData,
            auth: `Bearer ${tokenData.accessToken}`,
          });
        }
      }
      else if (tokenData.tokenData.userType === USER_TYPE.USER && !params.status) {
        if (result) {
          const sendNotificationData = {
            type: NOTIFICATION_TYPE.UPDATE_TASK_USER,
            receiverId: [userDetails.assistantId],
            userType: USER_TYPE.ASSISTANT,
            details: {
              senderId: tokenData.tokenData.userId,
              title: result.title,
              taskId: params.id,
              type: NOTIFICATION_TYPE.UPDATE_TASK_USER,
            },
          };
          axiosService.post({
            url: process.env.NOTIFICATION_APP_URL + SERVER.SEND_NOTIFICATION,
            body: sendNotificationData,
            auth: `Bearer ${tokenData.accessToken}`,
          });
        }
      }
      if (
        tokenData.tokenData.userType === USER_TYPE.ASSISTANT &&
        params.status === STATUS.COMPLETED
      ) {
        if (result) {
          const sendNotificationData = {
            type: NOTIFICATION_TYPE.TASK_MARKED_COMPLETED_ASSISTANT,
            receiverId: [result.userId],
            userType: USER_TYPE.USER,
            details: {
              senderId: tokenData.tokenData.userId,
              taskId: params.id,
              type: NOTIFICATION_TYPE.TASK_MARKED_COMPLETED_ASSISTANT,
            },
          };
          axiosService.post({
            url: process.env.NOTIFICATION_APP_URL + SERVER.SEND_NOTIFICATION,
            body: sendNotificationData,
            auth: `Bearer ${tokenData.accessToken}`,
          });
        }
      }
      if (step1.isTaskShared === true && params.shareTaskUser) {
        if (result) {
          const sendNotificationData = {
            type: NOTIFICATION_TYPE.NEW_TASK_SHARED,
            receiverId: [result.shareTaskUser.userId],
            userType: USER_TYPE.USER,
            details: {
              senderId: result.userId,
              title: result.title,
              clientName: userDetails.name,
              taskId: result._id,
              type: NOTIFICATION_TYPE.NEW_TASK_SHARED,
            },
          };
          axiosService.post({
            url: process.env.NOTIFICATION_APP_URL + SERVER.SEND_NOTIFICATION,
            body: sendNotificationData,
            auth: `Bearer ${tokenData.accessToken}`,
          });
        }
      }
      return MESSAGES.SUCCESS.EDIT_TASK;
    } catch (error) {
      console.log("Error in task", error);
      throw error;
    }
  }

  /**
   * @function taskList
   */
  async taskList(params: TaskRequest.taskListing, tokenData: TokenData) {
    try {
      params.userId = params?.userId ? params?.userId : tokenData.userId;
      const step1 = await taskDaoV1.taskList(params);
      return MESSAGES.SUCCESS.LIST(step1);
    } catch (error) {
      console.log("Error in task", error);
      throw error;
    }
  }

  /**
   * @function deleteTask
   */
  async deleteTask(params: TaskRequest.Id, tokenData) {
    try {
      let userDetails;
      if (tokenData.tokenData.userType === USER_TYPE.USER) {
        userDetails = await userDaoV1.findUserById(tokenData.tokenData.userId);
        if (!userDetails) return Promise.reject(MESSAGES.ERROR.USER_NOT_FOUND);
      }
      const result = await taskDaoV1.deleteTask(params);
      if (tokenData.tokenData.userType === USER_TYPE.ASSISTANT) {
        if (result) {
          const sendNotificationData = {
            type: NOTIFICATION_TYPE.DELETE_TASK_ASSISTANT,
            receiverId: [result.userId],
            userType: USER_TYPE.USER,
            details: {
              senderId: tokenData.tokenData.userId,
              title: result.title,
              taskId: params.id,
              type: NOTIFICATION_TYPE.DELETE_TASK_ASSISTANT,
            },
          };
          axiosService.post({
            url: process.env.NOTIFICATION_APP_URL + SERVER.SEND_NOTIFICATION,
            body: sendNotificationData,
            auth: `Bearer ${tokenData.accessToken}`,
          });
        }
      } else if (tokenData.tokenData.userType === USER_TYPE.USER) {
        if (result) {
          const sendNotificationData = {
            type: NOTIFICATION_TYPE.DELETE_TASK_USER,
            receiverId: [userDetails.assistantId],
            userType: USER_TYPE.ASSISTANT,
            details: {
              senderId: tokenData.tokenData.userId,
              title: result.title,
              taskId: params.id,
              type: NOTIFICATION_TYPE.DELETE_TASK_USER,
            },
          };
          axiosService.post({
            url: process.env.NOTIFICATION_APP_URL + SERVER.SEND_NOTIFICATION,
            body: sendNotificationData,
            auth: `Bearer ${tokenData.accessToken}`,
          });
        }
      }
      return MESSAGES.SUCCESS.DELETE_TASK;
    } catch (error) {
      console.log("Error in task", error);
      throw error;
    }
  }
  /**
   * @function addTask
   */
  async addTask(params: TaskRequest.Add, tokenData) {
    try {
      const userDetails = await userDaoV1.findUserById(params.userId);
      if (!userDetails) return Promise.reject(MESSAGES.ERROR.USER_NOT_FOUND);
      if (params.shareTaskUser) {
        params.isTaskShared = true;
      }
      const result = await taskDaoV1.addTask(params);
      this.trackDashboardEvents(
        tokenData,
        DASHBOARD_ACTION.TASK_UPDATE_CREATED
      );
      if (tokenData.tokenData.userType === USER_TYPE.ASSISTANT) {
        if (result) {
          const sendNotificationData = {
            type: NOTIFICATION_TYPE.ADD_NEW_TASK_ASSISTANT,
            receiverId: [params.userId],
            userType: USER_TYPE.USER,
            details: {
              senderId: tokenData.tokenData.userId,
              title: result.title,
              taskId: result._id,
              type: NOTIFICATION_TYPE.ADD_NEW_TASK_ASSISTANT,
            },
          };
          axiosService.post({
            url: process.env.NOTIFICATION_APP_URL + SERVER.SEND_NOTIFICATION,
            body: sendNotificationData,
            auth: `Bearer ${tokenData.accessToken}`,
          });
        }
      } else if (tokenData.tokenData.userType === USER_TYPE.USER) {
        if (result) {
          const sendNotificationData = {
            type: NOTIFICATION_TYPE.ADD_NEW_TASK_USER,
            receiverId: [userDetails.assistantId],
            userType: USER_TYPE.ASSISTANT,
            details: {
              senderId: tokenData.tokenData.userId,
              title: result.title,
              taskId: result._id,
              type: NOTIFICATION_TYPE.ADD_NEW_TASK_USER,
            },
          };
          axiosService.post({
            url: process.env.NOTIFICATION_APP_URL + SERVER.SEND_NOTIFICATION,
            body: sendNotificationData,
            auth: `Bearer ${tokenData.accessToken}`,
          });
        }
      }
      if (params.shareTaskUser) {
        if (result) {
          const sendNotificationData = {
            type: NOTIFICATION_TYPE.NEW_TASK_SHARED,
            receiverId: [result.shareTaskUser.userId],
            userType: USER_TYPE.USER,
            details: {
              senderId: result.userId,
              title: result.title,
              clientName: userDetails.name,
              taskId: result._id,
              type: NOTIFICATION_TYPE.NEW_TASK_SHARED,
            },
          };
          axiosService.post({
            url: process.env.NOTIFICATION_APP_URL + SERVER.SEND_NOTIFICATION,
            body: sendNotificationData,
            auth: `Bearer ${tokenData.accessToken}`,
          });
        }
      }
      return MESSAGES.SUCCESS.ADD_TASK;
    } catch (error) {
      console.log("Error in task", error);
      throw error;
    }
  }

  async getCalenderDates(token: TokenData, params) {
    try {
      const userId = params.userId || token.userId;
      const result = await taskDaoV1.getCalenderDates(userId, params);
      return MESSAGES.SUCCESS.DETAILS(result);
    } catch (error) {
      console.log("Error in task", error);
      throw error;
    }
  }

  /**
   * Get calender details
   * @param token TokenData
   * @param params {userId, startDate, endDate}
   * @returns {Promise<{events: ICalender[]}>}
   */
  async getCalenderData(token: TokenData, params: any) {
    const { userId } = params;
    const external =
      token.userType === USER_TYPE.ADMIN ||
      token.userType === USER_TYPE.ASSISTANT;
    const result = await taskDaoV1.getCalendarData(
      userId || token.userId,
      params,
      external
    );
    return MESSAGES.SUCCESS.DETAILS(result);
  }

  async trackDashboardEvents(token: any, actionType: any) {
    const data = {
      userId: token?.tokenData.userId,
      actionType,
    };

    try {
      await axiosService.post({
        url: SERVER.ADMIN_APP_URL + SERVER.DASHBOARD_LOG,
        body: data,
        auth: `Bearer ${token.accessToken}`,
      });
    } catch (error) {
      console.log(
        `Error calling ${SERVER.ADMIN_APP_URL + SERVER.DASHBOARD_LOG}`,
        error
      );
    }
  }

  /**
   * @function getUpcomingTasksAndReminders
   */
  async getUpcomingTasksAndReminders(tokenData: TokenData) {
    try {
      const step1 = await taskDaoV1.getUpcomingTasksAndReminders(
        tokenData?.userId
      );
      return MESSAGES.SUCCESS.DETAILS(step1);
    } catch (error) {
      console.log("Error in task", error);
      throw error;
    }
  }
}

export const taskController = new TaskController();
