"use strict";

import { BaseDao } from "@modules/baseDao/BaseDao";
import { STATUS, DB_MODEL_REF, CAL_TYPE } from "@config/constant";

import { createObjectCsvWriter } from "csv-writer";
import { imageUtil } from "@lib/ImageUtil";
import { SERVER } from "@config/index";
import { toObjectId } from "@utils/appUtils";

export class UserDao extends BaseDao {
  private modelUser: any;
  private modelLoginHistory: any;
  private adminModel: any;
  constructor() {
    super();
    this.modelUser = DB_MODEL_REF.USER;
    this.modelLoginHistory = DB_MODEL_REF.LOGIN_HISTORY;
    this.adminModel = DB_MODEL_REF.ADMIN;
  }

  /**
   * @function isEmailExists
   */
  async isEmailExists(params, userId?: string) {
    try {
      const query: any = {};
      query.email = params.email;
      if (userId) query._id = { $not: { $eq: userId } };
      query.status = { $ne: STATUS.DELETED };

      const projection = { updatedAt: 0 };

      return await this.findOne(this.modelUser, query, projection);
    } catch (error) {
      throw error;
    }
  }

  /**
   * @function isMobileExists
   */
  async isMobileExists(params, userId?: string) {
    try {
      const query: any = {};
      query.countryCode = params.countryCode;
      query.mobileNo = params.mobileNo;
      if (userId) query._id = { $not: { $eq: userId } };
      query.status = { $ne: STATUS.DELETED };

      const projection = { updatedAt: 0 };

      return await this.findOne(this.modelUser, query, projection);
    } catch (error) {
      throw error;
    }
  }

  /**
   * @function findUserById
   */
  async findUserById(userId: string, project = {}) {
    try {
      const query: any = {};
      query._id = userId;
      query.status = { $ne: STATUS.DELETED };

      const projection = Object.values(project).length
        ? project
        : { createdAt: 0, updatedAt: 0 };

      let result = await this.findOne(this.modelUser, query, projection);
      const loginHistory = await this.findOne(
        this.modelLoginHistory,
        { "userId._id": userId },
        { timezone: 1, created: 1 },
        { sort: { created: -1 } }
      );
      result.timezone = loginHistory?.timezone;
      result.userId = result._id;
      return result;
    } catch (error) {
      throw error;
    }
  }

  /**
   * @function signUp
   */
  async signUp(params: UserRequest.loginSignUp, session?) {
    try {
      return await this.save(this.modelUser, params, { session });
    } catch (error) {
      throw error;
    }
  }

  /**
   * @function blockUnblock
   */
  async blockUnblock(params: BlockRequest) {
    try {
      const query: any = {};
      query._id = params.userId;

      const update = {};
      update["$set"] = {
        status: params.type,
      };

      const options = { new: true };
      return await this.findOneAndUpdate(
        this.modelUser,
        query,
        update,
        options
      );
    } catch (error) {
      throw error;
    }
  }

  /**
   * @function verifyUser
   */
  async verifyUser(params: UserRequest.VerifyUser) {
    try {
      const query: any = {};
      query._id = params.userId;

      const update = {};
      update["$set"] = params;
      const options = { new: true };

      return await this.findOneAndUpdate(
        this.modelUser,
        query,
        update,
        options
      );
    } catch (error) {
      throw error;
    }
  }

  /**
   * @function editProfile
   */
  async editProfile(params, userId: string, profileSteps?: string[]) {
    try {
      const query: any = {};
      query._id = userId;

      const update = {};
      if (Object.values(params).length) update["$set"] = params;
      const options = { new: true };

      return await this.findOneAndUpdate(
        this.modelUser,
        query,
        update,
        options
      );
    } catch (error) {
      throw error;
    }
  }

  /**
   * @function exportToCSV
   * @description This function export the data into csv file
   */
  async exportToCSV(data: any[], fileName: string) {
    const csvWriter = createObjectCsvWriter({
      path: `${SERVER.UPLOAD_DIR}` + fileName,
      header: [
        { id: "_id", title: "_id" },
        { id: "name", title: "name" },
        { id: "fullMobileNo", title: "fullMobileNo" },
        { id: "createdAt", title: "createdAt" },
        { id: "language", title: "language" },
        { id: "status", title: "status" },
        { id: "isMigratedUser", title: "isMigratedUser" },
      ],
    });

    try {
      await csvWriter.writeRecords(data);
      return await imageUtil.uploadSingleMediaToS3(fileName);
    } catch (error) {
      console.error("Error writing CSV:", error);
    }
  }

  /**
   * @function userListing
   * @description get the listing of users
   */
  async userListing(params: ListingRequest) {
    try {
      let { pageNo, limit, searchKey, sortBy, sortOrder } = params;
      const aggPipe = [];

      const match: any = {};
      match.status = { $ne: STATUS.DELETED };

      if (params.isSharedTask) {
        match.isProfileCompleted = true;
        if (params.userId) {
          match._id = { $ne: toObjectId(params.userId) };
        }
      }

      if (searchKey) {
        match["$or"] = [
          { name: { $regex: new RegExp(searchKey, "i") } },
          { mobileNo: { $regex: new RegExp(searchKey, "i") } },
          { email: { $regex: new RegExp(searchKey, "i") } },
          { clientId: { $regex: new RegExp(searchKey, "i") } },
        ];
      }

      aggPipe.push({ $match: match });

      let sort: any = {};
      sortBy && sortOrder
        ? (sort = { [sortBy]: sortOrder })
        : (sort = { created: -1 });
      aggPipe.push({ $sort: sort });

      if (params.limit && params.pageNo) {
        const [skipStage, limitStage] = this.addSkipLimit(
          params.limit,
          params.pageNo
        );
        aggPipe.push(skipStage, limitStage);
      }

      if (params.isSharedTask) {
        let project: any = {
          _id: 1,
          name: 1,
          email: 1,
          profilePicture: 1,
        };
        aggPipe.push({ $project: project });
      } else {
        let project: any = {
          _id: 1,
          name: 1,
          email: 1,
          status: 1,
          created: 1,
          profilePicture: 1,
          userType: 1,
          mobileNo: 1,
          countryCode: 1,
          assistantName: 1,
          assistantId: 1,
          assistantProfilePicture: 1,
          assistantAssignedDate: 1,
          subscriptionType: 1,
          clientId: 1,
          isSubscribed: 1,
        };
        aggPipe.push({ $project: project });
      }

      return await this.dataPaginate(
        this.modelUser,
        aggPipe,
        limit,
        pageNo,
        {},
        true
      );
    } catch (error) {
      throw error;
    }
  }

  /**
   * @function assistantUserListing
   * @description get the listing of particular assistant users
   */
  async assistantUserListing(params: ListingRequest, assistantId: string) {
    try {
      let { pageNo, limit, searchKey, sortBy, sortOrder } = params;
      const aggPipe = [];

      const match: any = {};
      match.assistantId = toObjectId(assistantId);
      match.status = { $ne: STATUS.DELETED };

      if (searchKey) {
        match["$or"] = [
          { name: { $regex: new RegExp(searchKey, "i") } },
          { mobileNo: { $regex: new RegExp(searchKey, "i") } },
          { email: { $regex: new RegExp(searchKey, "i") } },
          { clientId: { $regex: new RegExp(searchKey, "i") } },
        ];
      }

      aggPipe.push({ $match: match });

      let sort: any = {};
      sortBy && sortOrder
        ? (sort = { [sortBy]: sortOrder })
        : (sort = { created: -1 });
      aggPipe.push({ $sort: sort });

      if (params.limit && params.pageNo) {
        const [skipStage, limitStage] = this.addSkipLimit(
          params.limit,
          params.pageNo
        );
        aggPipe.push(skipStage, limitStage);
      }

      let project: any = {
        _id: 1,
        name: 1,
        email: 1,
        status: 1,
        created: 1,
        userType: 1,
        mobileNo: 1,
        countryCode: 1,
        profilePicture: 1,
        subscriptionType: 1,
        assistantAssignedDate: 1,
        clientId: 1,
      };
      aggPipe.push({ $project: project });

      return await this.dataPaginate(
        this.modelUser,
        aggPipe,
        limit,
        pageNo,
        {},
        true
      );
    } catch (error) {
      throw error;
    }
  }
  /**
   * @function deleteUser
   */
  async deleteUser(params: UserRequest.blockDeleteUser) {
    try {
      let query: any = {};
      let update: any = {};
      query._id = params.userId;
      update.status = params.type;
      update.deleteTime = Date.now();
      const result = await this.findOneAndUpdate("users", query, update, {
        new: true,
      });
      if (result?.assistantId && params.type === STATUS.DELETED) {
        await this.findOneAndUpdate(
          this.adminModel,
          { _id: result.assistantId },
          { $inc: { assignedClientCount: -1 } }
        );
      }
      return result;
    } catch (error) {
      throw error;
    }
  }

  /**
	 * @function editProfileSetting
	 * @description this function will update the user profile
	 */
	async editProfileSetting(params:UserRequest.EditProfileSetting, tokenData:TokenData){
		try{
			const query: any = {};
			const model: any = DB_MODEL_REF.USER
			const modelLogin: any = DB_MODEL_REF.LOGIN_HISTORY
			query._id = toObjectId(tokenData.userId.toString());

			const update = {};
			if (Object.values(params).length) update["$set"] = params;
			const options = { new: true };
			
			if(typeof params.pushNotificationStatus === 'boolean'){
				
				const query1 = {
					"userId._id":toObjectId(tokenData.userId.toString()),
					isLogin: true
				}
				const update1 = {
					$set: { "userId.pushNotificationStatus": params.pushNotificationStatus },
				  };

				console.log(update1,'*********************');
				await this.updateMany(modelLogin,query1,update1,{})
			}
      if(typeof params.inAppNotificationStatus === 'boolean'){
				
				const query1 = {
					"userId._id":toObjectId(tokenData.userId.toString()),
					isLogin: true
				}
				const update1 = {
					$set: { "userId.pushNotificationStatus": params.inAppNotificationStatus },
				  };

				console.log(update1,'*********************');
				await this.updateMany(modelLogin,query1,update1,{})
			}
			return await this.findOneAndUpdate(model, query, update, options);
		}catch(error){
			throw error
		}
	}

  async eventsCount(userId) {
    try {
      const [events, eventsApple] = await Promise.all([
        this.findOne(
          "calender",
          {
            userId: userId,
            source: CAL_TYPE.GOOGLE,
          },
          { events: 1 }
        ),
        this.findOne(
          "calender",
          {
            userId: userId,
            source: CAL_TYPE.APPLE,
          },
          { events: 1 }
        ),
      ]);
      return { events, eventsApple };
    } catch (error) {
      throw error;
    }
  }

  async generateNextClientDetails() {
    // Find the highest `clientNumber` in the database

    const lastClient = await this.findOne(
      this.modelUser,
      { clientNumber: { $exists: true, $ne: null } },
      { clientNumber: 1 },
      {},
      { clientNumber: -1 }
    );

    // Determine the next clientNumber
    const nextClientNumber = lastClient ? lastClient.clientNumber + 1 : 1;

    // Generate the clientId using the next clientNumber
    const nextClientId = `u-ys${nextClientNumber}`;

    return { clientId: nextClientId, clientNumber: nextClientNumber };
  }
}

export const userDao = new UserDao();
