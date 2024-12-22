"use strict";

import * as _ from "lodash";

import { BaseDao } from "@modules/baseDao/BaseDao";
import { STATUS, DB_MODEL_REF, MESSAGES } from "@config/constant";

import {createObjectCsvWriter} from "csv-writer"
import { imageUtil } from "@lib/ImageUtil";
import { SERVER } from "@config/index";

export class UserDao extends BaseDao {

	private modelUser: any;
	private modelAdmin: any;
	constructor(){
		super();
		this.modelUser = DB_MODEL_REF.USER;
		this.modelAdmin = DB_MODEL_REF.ADMIN;
	}

	/**
	 * @function isEmailExists
	 */
	async isEmailExists(params, userId?: string) {
		try {
			const query: any = {};
			query.email = params.email;
			if (userId) query._id = { "$not": { "$eq": userId } };
			query.status = { "$ne": STATUS.DELETED };

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
			if (userId) query._id = { "$not": { "$eq": userId } };
			query.status = { "$ne": STATUS.DELETED };

			const projection = { _id: 1, fullMobileNo:1, isMobileVerified: 1 };

			return await this.findOne(this.modelUser, query, projection);
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @function signUp
	 */
	async signUp(params: UserRequest.SignUp, session?) {
		try {
			return await this.save(this.modelUser, params, { session });
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
			query.status = { "$ne": STATUS.DELETED };

			const projection = (Object.values(project).length) ? project : { createdAt: 0, updatedAt: 0 };

			const user = await this.findOne(this.modelUser, query, projection);
			const admin = await this.findOne(this.modelAdmin, query, projection);
			return user || admin;
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @function changePassword   
	 */
	async changePassword(params: UserRequest.ChangeForgotPassword) {
		try {
			const query: any = {};
			query.email = params.email;

			const update = {};
			update["$set"] = {
				hash: params.hash
			};

			return await this.updateOne(this.modelUser, query, update, {});
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
				status: params.status,
			};
			const options = { new: true };

			return await this.findOneAndUpdate(this.modelUser, query, update, options);
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

			return await this.findOneAndUpdate(this.modelUser, query, update, options);
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

			return await this.findOneAndUpdate(this.modelUser, query, update, options);
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
				{ id: '_id', title: '_id' },
				{ id: 'name', title: 'name' },
				{ id: 'fullMobileNo', title: 'fullMobileNo' },
				{ id: 'createdAt', title: 'createdAt' },
				{ id: 'language', title: 'language' },
				{ id: 'status', title: 'status' },
				{ id: 'isMigratedUser', title: 'isMigratedUser'}
			],
		});

	
		try {
			await csvWriter.writeRecords(data);
			return await imageUtil.uploadSingleMediaToS3(fileName);
		} catch (error) {
			console.error('Error writing CSV:', error);
		}
	}
}

export const userDao = new UserDao();