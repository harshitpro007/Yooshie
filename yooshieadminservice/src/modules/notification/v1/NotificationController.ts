"use strict";
import { MESSAGES, USER_TYPE } from "@config/constant";
import { notificationDaoV1 } from "..";
import { axiosService } from "@lib/axiosService";
import { SERVER } from "@config/environment";

export class NotificationController {

  /**
   * @function createNotification
   * @description Create a new notification
   * @param params.title
   * @param params.description
   * @param params.userType
   * @returns notification object
   */
  async createNotification(params: NotificationRequest.CreateNotification, tokenData){
    try{
      console.log(tokenData);
      if(tokenData.tokenData.userType !== USER_TYPE.ADMIN)return Promise.reject(MESSAGES.ERROR.INVALID_ADMIN);
      const result = await notificationDaoV1.createNotification(params);
      if(result){
        const notificationBody = {
          notificationId: result._id,
          details: {
            senderId: tokenData.tokenData.userId
          }
        }
				axiosService.post({ "url": process.env.NOTIFICATION_APP_URL + SERVER.SEND_NOTIFICATION, "body": notificationBody, "auth": `Bearer ${tokenData.accessToken}` });
			}
      return MESSAGES.SUCCESS.ADD_NOTIFICATION(result);
    }
    catch(error){
      throw error;
    }
  }
  
  /**
   * @function notificationList
   * @description get the list of notifications created by admin
   * @param params.pageNo
   * @param params.limit
   * @returns list of notification
   */
  async notificationList(params: ListingRequest, tokeData: TokenData){
    try{
      if(tokeData.userType !== USER_TYPE.ADMIN)return Promise.reject(MESSAGES.ERROR.INVALID_ADMIN);
      const step1 = await notificationDaoV1.notificationList(params);
			return MESSAGES.SUCCESS.LIST(step1);
    }
    catch(error){
      throw error;
    }
  }

  /**
   * @function notificationDelete
   * @description delete notification
   * @param params.notificationId
   * @returns 
   */
  async notificationDelete(params: NotificationRequest.Id, tokeData: TokenData){
    try{
      if(tokeData.userType !== USER_TYPE.ADMIN)return Promise.reject(MESSAGES.ERROR.INVALID_ADMIN);
      await notificationDaoV1.notificationDelete(params.notificationId);
			return MESSAGES.SUCCESS.NOTIFICATION_DELETED;
    }
    catch(error){
      throw error;
    }
  }

  /**
   * @function editNotification
   * @description edit notification
   * @param params.notificationId
   * @returns edited notification object
   */
  async editNotification(params: NotificationRequest.CreateNotification, tokeData: TokenData){
    try{
      if(tokeData.userType !== USER_TYPE.ADMIN)return Promise.reject(MESSAGES.ERROR.INVALID_ADMIN);
      const result = await notificationDaoV1.editNotification(params);
      return MESSAGES.SUCCESS.EDIT_NOTIFICATION(result);
    }
    catch(error){
      throw error;
    }
  }

  /**
	 * @function notificationListing
	 * @description get the In-app notification listing
	 * @param params.pageNo 
	 * @param params.limit
	 * @returns list of In-App notification
	 */
	async notificationListing(params: ListingRequest, tokenData){
		try{
			const data = await axiosService.getData({"url": process.env.NOTIFICATION_APP_URL + SERVER.NOTIFICATION_LISTING, "payload": params, "auth": `Bearer ${tokenData.accessToken}`})
			return MESSAGES.SUCCESS.LIST(data.data);
		}
		catch(error){
			console.log("Error", error)
			throw error;
		}
	}
}

export const notificationController = new NotificationController();
