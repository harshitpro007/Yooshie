"use strict";

import { BaseDao, baseDao } from "@modules/baseDao/BaseDao";
import { genRandomString, toObjectId } from "@utils/appUtils";
import {
  DB_MODEL_REF,
  MESSAGES,
  NOTIFICATION,
  NOTIFICATION_TYPE,
  STATUS,
  TIMERS,
  USER_TYPE,
} from "@config/constant";
import {
  admins,
  login_histories,
  notification_lists,
  users,
} from "@modules/models";
import { SERVER } from "@config/environment";
import { fireBase } from "@lib/firebase";
import { logger } from "@lib/logger";
import { sqsService } from "@lib/sqsService";

export class NotificationDao extends BaseDao {
  public modelNotificationList: any = DB_MODEL_REF.NOTIFICATION_LIST;
  public modelNotification: any = DB_MODEL_REF.NOTIFICATION;
  public modelUser: any = DB_MODEL_REF.USER;

  /**
   * @function notificationList
   */
  async notificationList(params: ListingRequest, userId: string) {
    try {
      const aggPipe = [];
      const match: any = {};
      match.receiverId = { $in: [toObjectId(userId)] };
      match.status = { $eq: STATUS.UN_BLOCKED };
      aggPipe.push({ $match: match });

      aggPipe.push({ $sort: { created: -1 } });

      if (params.limit && params.pageNo) {
        const [skipStage, limitStage] = this.addSkipLimit(
          params.limit,
          params.pageNo
        );
        aggPipe.push(skipStage, limitStage);
      }

      aggPipe.push({
		$lookup: {
		  from: DB_MODEL_REF.USER,
		  localField: "senderId",
		  foreignField: "_id",
		  pipeline: [{ $project: { profilePicture: 1, status: 1, name: 1 } }],
		  as: "userDetails",
		},
	  });
  
	  aggPipe.push({
		$unwind: {
		  path: "$userDetails",
		  preserveNullAndEmptyArrays: true, // Allow for cases where the user might not exist
		},
	  });
  
	  aggPipe.push({
		$lookup: {
		  from: DB_MODEL_REF.ADMIN,
		  localField: "senderId",
		  foreignField: "_id",
		  pipeline: [{ $project: { profilePicture: 1, status: 1, name: 1 } }],
		  as: "adminDetails",
		},
	  });
  
	  aggPipe.push({
		$unwind: {
		  path: "$adminDetails",
		  preserveNullAndEmptyArrays: true, // Allow for cases where the admin might not exist
		},
	  });
  
	  // Add conditional fields based on `details.senderType`
	  aggPipe.push({
		$addFields: {
		  senderName: {
			$cond: {
			  if: { $eq: ["$details.senderType", "user"] },
			  then: "$userDetails.name",
			  else: "$adminDetails.name",
			},
		  },
		  profilePicture: {
			$cond: {
			  if: { $eq: ["$details.senderType", "user"] },
			  then: "$userDetails.profilePicture",
			  else: "$adminDetails.profilePicture",
			},
		  },
		  senderStatus: {
			$cond: {
			  if: { $eq: ["$details.senderType", "user"] },
			  then: "$userDetails.status",
			  else: "$adminDetails.status",
			},
		  },
		},
	  });

      aggPipe.push({
        $project: {
          senderId: 1,
          isRead: 1,
          notificationStatus: "$status",
          message: 1,
          title: 1,
          details: 1,
          senderName: 1,
          profilePicture: 1,
          senderStatus: 1,
          created: 1,
          type: 1,
        },
      });

      return await this.dataPaginate(
        this.modelNotificationList,
        aggPipe,
        params.limit,
        params.pageNo,
        {},
		true
      );
    } catch (error) {
      throw error;
    }
  }

  /**
   * @function notificationDelete
   */
  async notificationDelete(params) {
    try {
      const query: any = {};
      query._id = toObjectId(params.notificationId);

      const update = {};
      update["$set"] = { status: STATUS.DELETED };
      const step1 = await this.findOneAndUpdate(
        this.modelNotification,
        query,
        update,
        {}
      );
      let notificaitonCount = 0;
      if (step1.isRead == false) notificaitonCount = 1;
      // const notificaitonCount = await this.aggregate(this.modelNotification,[{"$match":{_id:query._id,isRead:false}},{ '$count': 'total' }])
      // console.log('notificaitonCount?>>>',notificaitonCount)

      return notificaitonCount;
    } catch (error) {
      throw error;
    }
  }

  /**
   * @function isNotificationExists
   */
  async isNotificationExists(notificationId: string) {
    try {
      const query: any = {};
      query._id = toObjectId(notificationId);
      query.status = { $eq: STATUS.UN_BLOCKED };
      const options = { lean: true };
      return await this.findOne(
        this.modelNotification,
        query,
        { createdAt: 0, updatedAt: 0, status: 0, created: 0 },
        options,
        {}
      );
    } catch (error) {
      throw error;
    }
  }

  /**
   * @function sendNotificationsToUsers
   */
  async sendNotificationsToUsers(params, tokenData?: TokenData) {
    try {
      let notificationData: any;
      let platform: string = "";
      let query: any = {};
      const model: any = DB_MODEL_REF.LOGIN_HISTORY;
      // console.log(params,'params::::::::::::tokedata',tokenData)
      if (params?.notificationId && !params.receiverId) {
        const step1 = await this.findOne(this.modelNotification, {
          _id: params.notificationId,
          status: STATUS.UN_BLOCKED,
        });
        console.log(step1, params, "step1::::::::::::::");
        notificationData = await NOTIFICATION(
          NOTIFICATION_TYPE.ADMIN_NOTIFICATION,
          {...step1, details:params.details}
        );
        query = {
          "userId.status": STATUS.UN_BLOCKED,
          "userId.userType": step1.userType == USER_TYPE.ALL ? {$in: [USER_TYPE.ASSISTANT, USER_TYPE.USER]} : step1.userType,
        };

        const messageGroupId = genRandomString(10);
        await sqsService.sendMessage({query, notificationData},messageGroupId)
        // return await this.sendBulkNotification(
        //   query,
        //   notificationData
        // );
      } else if (!params?.notificationId && params?.receiverId) {
        let userName: any;
        const model: any = DB_MODEL_REF.USER;
        const adminModel: any = DB_MODEL_REF.ADMIN;
        let senderData;
        if (tokenData && tokenData.userType === USER_TYPE.USER) {
          senderData = await this.findOne(
            model,
            { _id: toObjectId(tokenData.userId.toString()) },
            { name: 1, profilePicture: 1, userType: 1 }
          );
        }
        else {
          senderData = await this.findOne(
            adminModel,
            { _id: toObjectId(tokenData.userId.toString()) },
            { name: 1, profilePicture: 1, userType: 1 }
          );
        }

        params.userName = senderData?.name || "";
        if(tokenData?.email){
          params.details.senderType = senderData?.userType || "";
        }
        console.log(">>>>>>>>>>>params", params, "<<<<<<<<<<<<<<<<<");

        query = {
          "userId._id": { $in: params.receiverId },
          "userId.status": STATUS.UN_BLOCKED,
          "userId.userType": { $in: [USER_TYPE.ASSISTANT, USER_TYPE.USER, USER_TYPE.ADMIN] },
        };
        notificationData = NOTIFICATION(params.type, params);
        console.log("Generated Notification Data", notificationData)
        const messageGroupId = genRandomString(10);
        await sqsService.sendMessage({query, notificationData},messageGroupId)
        // return await this.sendBulkNotification(
        //   query,
        //   notificationData
        // );
      } else {
        return MESSAGES.ERROR.BAD_NOTIFICATION;
      }
    } catch (error) {
      throw error;
    }
  }

  /**
   * @function sendBulkNotification
   * @description function will used for bulk notificaiton
   */
	async sendBulkNotification(
		query: any,
		notificationData: any
	) {
		try {
			const userToken = login_histories
				.find(query, {
					userId: 1,
					deviceToken: 1,
					platform: 1,
					isLogin: 1,
					userType: 1,
				})
				.cursor({ batchSize: SERVER.CHUNK_SIZE });
			const processedUserIds = new Map();
      let tokens = [];
			userToken.on("data", async function (doc) {
				console.log(doc, ":::::::::::::::::");
				const deviceToken = doc.deviceToken;
				const userType = doc.userId.userType;
				const userId = toObjectId(doc.userId._id).toString();
				if (!processedUserIds.has(userId)) {
					processedUserIds.set(userId, true);
					const query_notification = {
						senderId: toObjectId(notificationData.details.senderId),
						receiverId: userId,
						message: notificationData.message,
						title: notificationData.title,
						type: notificationData.type,
						details: notificationData.details,
					};
					await notification_lists.insertMany(query_notification);
					if (userType === USER_TYPE.USER) {
						await users.findOneAndUpdate(
							{ _id: userId },
							{ $inc: { notificationCount: 1 } }
						);
					} else {
						await admins.findOneAndUpdate(
							{ _id: userId },
							{ $inc: { notificationCount: 1 } }
						);
					}
				}
        if (deviceToken !== undefined && doc.isLogin && userType === USER_TYPE.USER) {
					// console.log(`createPayload for push notification invoked`);
					// await fireBase.multiCastPayload(tokens, notificationData);
          tokens.push(deviceToken);
				}
			});
      userToken.on("error", async (error) => {
        logger.error(`sendPushNotification cursor error`, error);
      });
      userToken.on("end", async () => {
        setTimeout(async ()=> {
          console.log('****************notification****************',notificationData);
          await fireBase.multiCastPayload(tokens, notificationData);          
        },TIMERS.TWO_SECOND)
      });
      return MESSAGES.SUCCESS.NOTIFICATION_SENT;
		} catch (error) {
			throw error;
		}
	}

  async updateReadStatus(
    params: NotificationRequest.Read,
    tokenData: TokenData
  ) {
    try {
      const query: any = {
        receiverId: toObjectId(tokenData.userId.toString()),
        isRead: false,
        status: STATUS.UN_BLOCKED,
      };

      if (params.notificationId) {
        query._id = toObjectId(params.notificationId);
      }

      const update = {
        $set: {
          isRead: true,
        },
      };

      const result = await this.updateMany(
        this.modelNotificationList,
        query,
        update,
        {}
      );
      await this.findOneAndUpdate(this.modelUser, {_id: tokenData.userId, notificationCount: { $gt: 0 }}, {$inc: {notificationCount:-1}})
      return result;
    } catch (error) {
      throw error;
    }
  }

  async deleteNotification(
    params: NotificationRequest.Id,
    tokenData: TokenData
  ) {
    try {
      const query: any = {
        receiverId: toObjectId(tokenData.userId),
      };
      let result;
      if (params.notificationId) {
        query._id = toObjectId(params.notificationId);
        result = await this.findOneAndUpdate(this.modelNotificationList,
          query,
          { $set: { status: STATUS.DELETED } },
          { multi: true, new: true }
        );
  
        if(result.isRead == false){
          await this.findOneAndUpdate(this.modelUser, {_id: tokenData.userId, notificationCount: { $gt: 0 }}, {$inc: {notificationCount:-1}})
        }
      }
      else{
        result = await this.updateMany(this.modelNotificationList, query, { $set: { status: STATUS.DELETED } }, { multi: true});
        await this.findOneAndUpdate(this.modelUser, {_id: tokenData.userId, notificationCount: { $gt: 0 }}, {notificationCount:0});
      }

      return true;
    } catch (error) {
      throw error;
    }
  }

  async notificationDetails(params: NotificationRequest.Read){
    try{
      return await this.findOne(this.modelNotification, {_id: params.notificationId}, {createdAt:0, updatedAt:0});
    }
    catch(error){
      throw error;
    }
  }
}

export const notificationDao = new NotificationDao();
