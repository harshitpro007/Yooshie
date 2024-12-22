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
			query.status = { "$ne": STATUS.DELETED };

			const projection = (Object.values(project).length) ? project : { createdAt: 0, updatedAt: 0 };

			return await this.findOne(this.modelUser, query, projection);
		} catch (error) {
			throw error;
		}
	}
}

export const userDao = new UserDao();