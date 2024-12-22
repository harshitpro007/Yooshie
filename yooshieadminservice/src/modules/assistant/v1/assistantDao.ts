"use strict";

import * as _ from "lodash";
import { BaseDao } from "@modules/baseDao/BaseDao";

import {
  CLIENT_LIMIT,
  DB_MODEL_REF,
  GEN_STATUS,
  MAIL_TYPE,
  SERVER,
  STATUS,
  USER_TYPE,
} from "@config/index";
import * as mongoose from "mongoose";
import { escapeSpecialCharacter, toObjectId } from "@utils/appUtils";
import { axiosService } from "@lib/axiosService";
export class AssistantDao extends BaseDao {
  private modelAdmin: any;
  private modelUser: any;
  constructor() {
    super();
    this.modelAdmin = DB_MODEL_REF.ADMIN;
    this.modelUser = DB_MODEL_REF.USER;
  }

  /**
   * @function createAssistant
   */
  async createAssistant(params: AssistantRequest.CreateAssistant) {
    try {
      return await this.save(this.modelAdmin, params);
    } catch (error) {
      console.log("Error", error);
      throw error;
    }
  }

  /**
   * @function editAssistant
   * @author yash sharma
   */
  async editAssistant(params: AssistantRequest.EditAssistant) {
    try {
      const query: any = {
        _id: new mongoose.Types.ObjectId(params.assistantId),
      };
      const update: any = { $set: params };
      const options = {};
      return await this.updateOne(this.modelAdmin, query, update, options);
    } catch (error) {
      console.log("Error", error);
      throw error;
    }
  }

  /**
   * @function blockUnblockAssistant
   */
  async blockUnblockAssistant(params: AssistantRequest.BlockAssistant) {
    try {
      const query: any = {};
      query._id = new mongoose.Types.ObjectId(params.assistantId);
      query.status = { $ne: STATUS.DELETED };
      const update = {};
      update["$set"] = {
        status: params.status,
      };
      const options: any = {};
      return await this.updateOne(this.modelAdmin, query, update, options);
    } catch (error) {
      console.log("Error", error);
      throw error;
    }
  }

  /**
   * @function deleteAssistant
   */
  async deleteAssistant(params: AssistantRequest.AssistantId) {
    try {
      const query: any = {};
      query._id = new mongoose.Types.ObjectId(params.assistantId);
      const update = {};
      update["$set"] = {
        status: STATUS.DELETED,
      };
      const options: any = {};
      return await this.updateOne(this.modelAdmin, query, update, options);
    } catch (error) {
      console.log("Error", error);
      throw error;
    }
  }

  /**
   * @function AssistantList
   */
  async assistantList(
    params: AssistantRequest.AssistantList,
    tokenData: TokenData
  ) {
    try {
      let { pageNo, limit, searchKey, sortBy, sortOrder, status } = params;
      const aggPipe = [];

      const match: any = {};
      match.userType = { $ne: USER_TYPE.ADMIN };
      // match._id = {"$ne": toObjectId(tokenData.userId)}
      match.status = { $ne: STATUS.DELETED };
      if (status) {
        match.status = { $in: status };
      }
      if (params.fromDate && !params.toDate)
        match.created = { $gte: params.fromDate };
      if (params.toDate && !params.fromDate)
        match.created = { $lte: params.toDate };
      if (params.fromDate && params.toDate)
        match.created = { $gte: params.fromDate, $lte: params.toDate };

      if (searchKey) {
        searchKey = escapeSpecialCharacter(params.searchKey);
        match["$or"] = [
          { empId: { $regex: searchKey, $options: "i" } },
          { name: { $regex: searchKey, $options: "i" } },
          { mobileNo: { $regex: searchKey, $options: "i" } },
          { email: { $regex: searchKey, $options: "i" } },
        ];
      }

      aggPipe.push({ $match: match });

      let sort: any = {};
      sortBy && sortOrder
        ? (sort = { [sortBy]: sortOrder })
        : (sort = { created: -1 });
      aggPipe.push({ $sort: sort });

      if (!params.isExport) {
        if (params.limit && params.pageNo) {
          const [skipStage, limitStage] = this.addSkipLimit(
            params.limit,
            params.pageNo
          );
          aggPipe.push(skipStage, limitStage);
        }
      }

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
        assignedClientCount: 1,
        createdAt: 1,
        empId: 1,
      };
      aggPipe.push({ $project: project });

      return await this.dataPaginate(
        this.modelAdmin,
        aggPipe,
        limit,
        pageNo,
        {},
        true
      );
    } catch (error) {
      console.log("Error", error);
      throw error;
    }
  }

  /**
   * @function findAssistantById
   */
  async findAssistantById(params: UserId) {
    try {
      const query: any = {};
      query._id = new mongoose.Types.ObjectId(params.userId);
      query.status = {
        $in: [GEN_STATUS.UN_BLOCKED, GEN_STATUS.BLOCKED, GEN_STATUS.PENDING],
      };
      query.userType = { $eq: USER_TYPE.ASSISTANT };

      const projection = { updatedAt: 0 };
      const options: any = { lean: true };

      return await this.findOne(this.modelAdmin, query, projection, options);
    } catch (error) {
      console.log("Error", error);
      throw error;
    }
  }

  /**
   * @function AssistantDetails
   */
  async assistantDetails(params: AssistantRequest.AssistantId) {
    try {
      const query: any = {};
      query._id = new mongoose.Types.ObjectId(params.assistantId);
      query.userType = { $eq: USER_TYPE.ASSISTANT };

      const projection = {
        _id: 1,
        name: 1,
        empId: 1,
        email: 1,
        status: 1,
        createdAt: 1,
        updatedAt: 1,
        mobileNo: 1,
        countryCode: 1,
        fullMobileNo: 1,
        permission: 1,
        profilePicture: 1,
        assignedClientCount: 1,
      };
      const options: any = { lean: true };

      return await this.findOne(this.modelAdmin, query, projection, options);
    } catch (error) {
      console.log("Error", error);
      throw error;
    }
  }

  async assignedAutomaticAssistant(userId: string) {
    try {
      const pipeline = [
        {
          $match: {
            userType: USER_TYPE.ASSISTANT,
            status: STATUS.UN_BLOCKED,
            assignedClientCount: { $lt: CLIENT_LIMIT.MAX },
          },
        },
        {
          $sample: { size: 1 },
        },
      ];
      const assistantResult = await this.aggregate(this.modelAdmin, pipeline);
      if (assistantResult?.length > 0) {
        const assistant = assistantResult[0];
        const [userData, assistantData] = await Promise.all([
          this.findOneAndUpdate(this.modelUser, { _id: userId }, { assistantId: assistant._id, assistantName: assistant.name, assistantProfilePicture: assistant.profilePicture, isAssistantAssigned: true, assistantAssignedDate: Date.now()}, {new: true}),
          this.findOneAndUpdate(this.modelAdmin, { _id: assistant._id }, { $inc: { assignedClientCount: 1 } })
        ]);
        const mailData = {
					type: MAIL_TYPE.ASSIGN_NEW_ASSISTANT,
					email: userData.email,
					name: userData.name,
          assistantEmail: assistantResult[0].email,
          assistantName: assistantResult[0].name,
          mobileNo: assistantResult[0].fullMobileNo
				}
			  axiosService.postData({ "url": process.env.NOTIFICATION_APP_URL + SERVER.SEND_MAIL, "body": mailData });
      }
      return true;
    } catch (error) {
      console.log("Error", error);
      throw error;
    }
  }

  async assignedManualAssistant(params: AssistantRequest.assignedAssistant) {
    try {
      const [currentAssistantDetails, userDetails] = await Promise.all([
        this.findOne(this.modelAdmin, { _id: params.assistantId }, { _id: 1, name: 1, profilePicture: 1, email: 1, fullMobileNo: 1 }),
        this.findOne(this.modelUser, { _id: params.userId }, { assistantId: 1 })
      ]);
  
      if (!currentAssistantDetails) return false;
  
      const lastAssistantId = userDetails.assistantId;
      
      // Only decrement the previous assistant's client count if there is one
      if (lastAssistantId) {
        await this.findOneAndUpdate(this.modelAdmin, { _id: lastAssistantId }, { $inc: { assignedClientCount: -1 } });
      }
  
      // Update user with new assistant and increment the new assistant's client count
      await Promise.all([
        this.findOneAndUpdate(
          this.modelUser,
          { _id: params.userId },
          {
            assistantId: currentAssistantDetails._id,
            assistantName: currentAssistantDetails.name,
            assistantProfilePicture: currentAssistantDetails.profilePicture,
            isAssistantAssigned: true,
            assistantAssignedDate: Date.now()
          }
        ),
        this.findOneAndUpdate(
          this.modelAdmin,
          { _id: currentAssistantDetails._id },
          { $inc: { assignedClientCount: 1 } }
        )
      ]);
      
      const mailData = {
        type: MAIL_TYPE.ASSIGN_NEW_ASSISTANT,
        email: userDetails.email,
        name: userDetails.name,
        assistantEmail: currentAssistantDetails.email,
        assistantName: currentAssistantDetails.name,
        mobileNo: currentAssistantDetails.fullMobileNo
      }
      axiosService.postData({ "url": process.env.NOTIFICATION_APP_URL + SERVER.SEND_MAIL, "body": mailData });
      return true;
    } catch (error) {
      console.error("Error", error);
      throw error;
    }
  }

  async genrateAssistantId() {
    try {
    let  lastAssistant=  await this.aggregate(this.modelAdmin, [
        { 
          $match: { userType: USER_TYPE.ASSISTANT, empId: { $regex: '^ys[0-9]+$' } } // Ensure empId starts with 'ys' and followed by digits
        },
        { 
          $addFields: { empIdNumber: { $toInt: { $substr: ["$empId", 2, -1] } } }  // Extract numeric part of empId
        },
        { 
          $sort: { empIdNumber: -1 }  // Sort based on numeric part in descending order
        },
        { 
          $limit: 1  // Get the last one
        }
      ]);
  
      // Extract the numeric part and increment it
      let empIdNumber = lastAssistant.length > 0 && lastAssistant[0].empIdNumber
      ? lastAssistant[0].empIdNumber + 1
      : 1;
  
      return`ys${empIdNumber}`;
    } catch (error) {
      console.error("Error", error);
      throw error;
    }
  }
  
  /**
	 * @function editProfileSetting
	 * @description this function will update the user profile
	 */
	async editProfileSetting(params:AssistantRequest.EditProfileSetting, tokenData:TokenData){
		try{
			const query: any = {};
			const model: any = DB_MODEL_REF.USER
			query._id = toObjectId(tokenData.userId.toString());

			const update = {};
			if (Object.values(params).length) update["$set"] = params;
			const options = { new: true };
			
			return await this.findOneAndUpdate(model, query, update, options);
		}catch(error){
			throw error
		}
	}
  
}

export const assistantDao = new AssistantDao();
