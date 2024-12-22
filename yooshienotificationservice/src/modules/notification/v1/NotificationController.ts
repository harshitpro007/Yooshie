"use strict";
import { mailManager } from "@lib/MailManager";
import { MAIL_TYPE, MESSAGES } from "@config/index";
import { notificationDaoV1 } from "..";
import { smsManager } from "@lib/SMSManager";
export class NotificationController {
  /**
   * @function emailHandler
   * @description this method is use to send the mail
   * @param params.type mail type(required)
   * @returns
   */
  async emailHandler(params: NotificationRequest.Mail) {
    try {
      switch (params.type) {
        case MAIL_TYPE.VERIFY_EMAIL:
          await mailManager.verifyEmail(params);
          break;
        case MAIL_TYPE.FORGOT_PASSWORD:
          await mailManager.forgotPasswordMail(params);
          break;
        case MAIL_TYPE.ADD_ASSISTANT:
          await mailManager.subAdminPasswordMail(params);
          break;
        case MAIL_TYPE.ASSIGN_NEW_ASSISTANT:
          await mailManager.assignNewAssistantMail(params);
          break;
        case MAIL_TYPE.CHANGE_PASSWORD:
          await mailManager.changePasswordMail(params);
          break;
        default:
          return Promise.reject(MESSAGES.ERROR.INVALID_MAIL_TYPE);
      }

      return MESSAGES.SUCCESS.MAIL_SENT;
    } catch (error) {
      throw error;
    }
  }

  /**
   * @function sendMessage
   * @description this method is use to send the messsage on mobile number
   * @param params.fullMobileNo fullMobileNo(required)
   * @returns
   */
  async sendMessage(params) {
    try {
      await smsManager.vonagesend(params);
      return MESSAGES.SUCCESS.MESSAGE_SENT;
    } catch (error) {
      throw error;
    }
  }

  /**
   * @function sendNotification
   * @description function will send notification to users
   */
  async sendNotification(params: NotificationRequest.Id, tokenData?: TokenData) {
    try {
      return await notificationDaoV1.sendNotificationsToUsers(
        params,
        tokenData
      );
    } catch (error) {
      throw error;
    }
  }

  /**
   * @function notificationList
   * @description function will the list of all notificaiton
   */
  async notificationList(params: ListingRequest, tokenData: TokenData) {
    try {
      const step1 = await notificationDaoV1.notificationList(
        params,
        tokenData.userId
      );
      return MESSAGES.SUCCESS.LIST_DATA(step1);
    } catch (error) {
      throw error;
    }
  }

  /* @function readNotification
   * @description function will read notification to users
   */
  async readNotfication(
    params: NotificationRequest.Read,
    tokenData: TokenData
  ) {
    try {
      await notificationDaoV1.updateReadStatus(params, tokenData);
      return MESSAGES.SUCCESS.NOTIFICATION_READ;
    } catch (error) {
      throw error;
    }
  }

  async deleteNotfication(
    params: NotificationRequest.Id,
    tokenData: TokenData
  ) {
    try {
      await notificationDaoV1.deleteNotification(params, tokenData);
      return MESSAGES.SUCCESS.NOTIFICATION_DELETED;
    } catch (error) {
      throw error;
    }
  }

  async notificationDetails(params: NotificationRequest.Read,
    tokenData: TokenData){
    try{
      const data = await notificationDaoV1.notificationDetails(params);
      return MESSAGES.SUCCESS.NOTIFICATION_DETAILS(data);
    }
    catch(error){
      throw error;
    }
  }
}

export const notificationController = new NotificationController();
