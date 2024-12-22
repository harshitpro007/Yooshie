"use strict";

import { MESSAGES, NOTIFICATION_TYPE, STATUS, USER_TYPE } from "@config/constant";
import { SERVER } from "@config/environment";
import { axiosService } from "@lib/axiosService";
import { reminderDaoV1 } from "@modules/reminder/index";
import { userDaoV1 } from "@modules/user";

export class ReminderController {
  /**
   * @function reminderDetails
   */
  async reminderDetails(params: ReminderRequest.Id) {
    try {
      const step1 = await reminderDaoV1.reminderDetails(params);
      return MESSAGES.SUCCESS.DETAILS(step1);
    } catch (error) {
      console.log("Error in reminder", error);
      throw error;
    }
  }

  /**
   * @function editreminder
   */
  async editreminder(params: ReminderRequest.Edit, tokenData) {
    try {
      let userDetails;
      if(tokenData.tokenData.userType === USER_TYPE.USER){
        userDetails = await userDaoV1.findUserById(tokenData.tokenData.userId);
        if(!userDetails) return Promise.reject(MESSAGES.ERROR.USER_NOT_FOUND);
      }
      const step1 = await reminderDaoV1.reminderDetails(params);
      if (!step1) return Promise.reject(MESSAGES.ERROR.REMINDER_NOT_FOUND);
      const result = await reminderDaoV1.editReminder(params);
      if (tokenData.tokenData.userType === USER_TYPE.ASSISTANT && !params?.status) {
        if (result) {
          const sendNotificationData = {
            type: NOTIFICATION_TYPE.UPDATE_REMINDER_ASSISTANT,
            receiverId: [step1.userId],
            userType: USER_TYPE.USER,
            details: {
              senderId: tokenData.tokenData.userId,
              title: result.title,
              reminderId: params.id,
              type: NOTIFICATION_TYPE.UPDATE_REMINDER_ASSISTANT
            }
          }
          axiosService.post({ "url": process.env.NOTIFICATION_APP_URL + SERVER.SEND_NOTIFICATION, "body": sendNotificationData, "auth": `Bearer ${tokenData.accessToken}` });
        }
      }
      else if (tokenData.tokenData.userType === USER_TYPE.USER && !params?.status) {
        if (result) {
          const sendNotificationData = {
            type: NOTIFICATION_TYPE.UPDATE_REMINDER_USER,
            receiverId: [userDetails.assistantId],
            userType: USER_TYPE.ASSISTANT,
            details: {
              senderId: tokenData.tokenData.userId,
              title: result.title,
              reminderId: params.id,
              type: NOTIFICATION_TYPE.UPDATE_REMINDER_USER
            }
          }
          axiosService.post({ "url": process.env.NOTIFICATION_APP_URL + SERVER.SEND_NOTIFICATION, "body": sendNotificationData, "auth": `Bearer ${tokenData.accessToken}` });
        }
      }
      if(tokenData.tokenData.userType === USER_TYPE.ASSISTANT && params.status === STATUS.COMPLETED){
        if (result) {
          const sendNotificationData = {
            type: NOTIFICATION_TYPE.REMINDER_MARKED_COMPLETED_ASSISTANT,
            receiverId: [result.userId],
            userType: USER_TYPE.USER,
            details: {
              senderId: tokenData.tokenData.userId,
              reminderId: params.id,
              type: NOTIFICATION_TYPE.REMINDER_MARKED_COMPLETED_ASSISTANT
            }
          }
          axiosService.post({ "url": process.env.NOTIFICATION_APP_URL + SERVER.SEND_NOTIFICATION, "body": sendNotificationData, "auth": `Bearer ${tokenData.accessToken}` });
        }
      }
      return MESSAGES.SUCCESS.EDIT_REMINDER;
    } catch (error) {
      console.log("Error in reminder", error);
      throw error;
    }
  }

  /**
   * @function reminderList
   */
  async reminderList(params: ReminderRequest.reminderRequest, tokenData: TokenData) {
    try {
      params.userId = params?.userId ? params?.userId : tokenData.userId;
      const step1 = await reminderDaoV1.reminderList(params);
      return MESSAGES.SUCCESS.LIST(step1);
    } catch (error) {
      console.log("Error in reminder", error);
      throw error;
    }
  }

  /**
   * @function deleteReminder
   */
  async deleteReminder(params: ReminderRequest.Id,tokenData) {
    try {
      let userDetails;
      if(tokenData.tokenData.userType === USER_TYPE.USER){
        userDetails = await userDaoV1.findUserById(tokenData.tokenData.userId);
        if(!userDetails) return Promise.reject(MESSAGES.ERROR.USER_NOT_FOUND);
      }
      const result = await reminderDaoV1.deleteReminder(params);
      if (tokenData.tokenData.userType === USER_TYPE.ASSISTANT) {
        if (result) {
          const sendNotificationData = {
            type: NOTIFICATION_TYPE.DELETE_REMINDER_ASSISTANT,
            receiverId: [result.userId],
            userType: USER_TYPE.USER,
            details: {
              senderId: tokenData.tokenData.userId,
              title: result.title,
              reminderId: params.id,
              type: NOTIFICATION_TYPE.DELETE_REMINDER_ASSISTANT
            }
          }
          axiosService.post({ "url": process.env.NOTIFICATION_APP_URL + SERVER.SEND_NOTIFICATION, "body": sendNotificationData, "auth": `Bearer ${tokenData.accessToken}` });
        }
      }
      else if (tokenData.tokenData.userType === USER_TYPE.USER) {
        if (result) {
          const sendNotificationData = {
            type: NOTIFICATION_TYPE.DELETE_REMINDER_USER,
            receiverId: [userDetails.assistantId],
            userType: USER_TYPE.ASSISTANT,
            details: {
              senderId: tokenData.tokenData.userId,
              title: result.title,
              reminderId: params.id,
              type: NOTIFICATION_TYPE.DELETE_REMINDER_USER
            }
          }
          axiosService.post({ "url": process.env.NOTIFICATION_APP_URL + SERVER.SEND_NOTIFICATION, "body": sendNotificationData, "auth": `Bearer ${tokenData.accessToken}` });
        }
      }
      return MESSAGES.SUCCESS.DELETE_REMINDER;
    } catch (error) {
      console.log("Error in reminder", error);
      throw error;
    }
  }
  /**
   * @function addReminder
   */
  async addReminder(params: ReminderRequest.Add, tokenData) {
    try {
      const userDetails = await userDaoV1.findUserById(params.userId);
      if(!userDetails) return Promise.reject(MESSAGES.ERROR.USER_NOT_FOUND);
      const result = await reminderDaoV1.addReminder(params);
      if (tokenData.tokenData.userType === USER_TYPE.ASSISTANT) {
        if (result) {
          const sendNotificationData = {
            type: NOTIFICATION_TYPE.ADD_NEW_REMINDER_ASSISTANT,
            receiverId: [params.userId],
            userType: USER_TYPE.USER,
            details: {
              senderId: tokenData.tokenData.userId,
              title: result.title,
              reminderId: result._id,
              type: NOTIFICATION_TYPE.ADD_NEW_REMINDER_ASSISTANT
            }
          }
          axiosService.post({ "url": process.env.NOTIFICATION_APP_URL + SERVER.SEND_NOTIFICATION, "body": sendNotificationData, "auth": `Bearer ${tokenData.accessToken}` });
        }
      }
      else if (tokenData.tokenData.userType === USER_TYPE.USER) {
        if (result) {
          const sendNotificationData = {
            type: NOTIFICATION_TYPE.ADD_NEW_REMINDER_USER,
            receiverId: [userDetails.assistantId],
            userType: USER_TYPE.ASSISTANT,
            details: {
              senderId: tokenData.tokenData.userId,
              title: result.title,
              reminderId: result._id,
              type: NOTIFICATION_TYPE.ADD_NEW_REMINDER_USER
            }
          }
          axiosService.post({ "url": process.env.NOTIFICATION_APP_URL + SERVER.SEND_NOTIFICATION, "body": sendNotificationData, "auth": `Bearer ${tokenData.accessToken}` });
        }
      }
      return MESSAGES.SUCCESS.ADD_REMINDER;
    } catch (error) {
      console.log("Error in reminder", error);
      throw error;
    }
  }
}

export const reminderController = new ReminderController();
