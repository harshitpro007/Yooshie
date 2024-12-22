"use strict";

import { BaseDao } from "@modules/baseDao/BaseDao";
import { STATUS, DB_MODEL_REF } from "@config/constant";

export class UserDao extends BaseDao {

	private modelUser: any;
	constructor(){
		super();
		this.modelUser = DB_MODEL_REF.USER;
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
			console.log("Error", error)
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
			console.log("Error", error)
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

			return await this.findOne(this.modelUser, query, projection);
		} catch (error) {
			console.log("Error", error)
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
			console.log("Error", error)
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
			console.log("Error", error)
			throw error;
		}
	}
}

export const userDao = new UserDao();