"use strict";

import { BaseDao } from "@modules/baseDao/BaseDao";

import { STATUS, DB_MODEL_REF, GEN_STATUS } from "@config/constant";
import { toObjectId } from "@utils/appUtils";

export class AdminDao extends BaseDao {
	
	private modelAdmin:any;

	constructor(){
		super();
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
			query.status = { "$in": [GEN_STATUS.UN_BLOCKED,GEN_STATUS.BLOCKED,GEN_STATUS.PENDING] };

			const projection = { updatedAt: 0, refreshToken: 0 };

			return await this.findOne(this.modelAdmin, query, projection);
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @function findAdminById
	 */
	async findAdminById(userId: string, project = {}) {
		try {
			const query: any = {};
			query._id = userId;
			query.status = { "$in": [GEN_STATUS.UN_BLOCKED,GEN_STATUS.BLOCKED] };

			const projection = (Object.values(project).length) ? project : { createdAt: 0, updatedAt: 0 };

			return await this.findOne(this.modelAdmin, query, projection);
		} catch (error) {
			throw error;
		}
	}

	async isAdminExist(adminId){
		try {
			return await this.findOne(this.modelAdmin,{_id:toObjectId(adminId),status:STATUS.UN_BLOCKED},{_id:1})
		} catch (error) {
			throw error
		}
	}

	


}

export const adminDao = new AdminDao();