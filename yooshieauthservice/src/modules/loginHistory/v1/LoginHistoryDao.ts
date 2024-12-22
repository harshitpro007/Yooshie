"use strict";
import * as _ from "lodash";

import { BaseDao } from "@modules/baseDao/BaseDao";
import { DB_MODEL_REF } from "@config/index";
export class LoginHistoryDao extends BaseDao {

	private modelLoginHistory;

	constructor(){
		super();
		this.modelLoginHistory = DB_MODEL_REF.LOGIN_HISTORY;
	}

	/**
	 * @function findDeviceLastLogin
	 */
	async findDeviceLastLogin(params) {
		try {
			const query: any = {};
			query["userId._id"] = params.userId;
			if (params.deviceId) query.deviceId = params.deviceId;
			query.isLogin = false;

			const projection = { lastLogin: 1 };
			const sort = { created: -1 };

			const response = await this.findOne(this.modelLoginHistory, query, projection, {}, sort);
			return response ? response.lastLogin : "";
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @function createUserLoginHistory
	 */
	async createUserLoginHistory(params, session?) {
		try {
			const loginHistory: LoginHistoryRequest = {
				"userId": {
					"_id": params.userId || params["_id"],
					"isApproved": params?.isApproved,
					"name": params?.name,
					"email": params.email,
					"countryCode": params?.countryCode,
					"mobileNo": params?.mobileNo,
					"pushNotificationStatus": params.pushNotificationStatus ? params.pushNotificationStatus : false,
					"groupaNotificationStatus": params.groupaNotificationStatus ? params.pushNotificationStatus : false,
					"userType": params.userType,
					"status": params.status
				},
				"deviceId": params.deviceId,
				"remoteAddress": params.remoteAddress,
				"platform": params.platform,
				"deviceToken": params.deviceToken,
				"salt": params.salt,
				"lastLogin": Date.now(),
				"location": (params?.location && params?.location["status"]) === "success" ? params.location : {}
			};
			if (params?.location && params?.location["status"]) loginHistory.timezone = params?.location["timezone"];
			return await this.save(this.modelLoginHistory, loginHistory, { session });
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @function removeDeviceById
	 */
	async removeDeviceById(params) {
		try {
			const query: any = {};
			query["userId._id"] = params.userId;
			if (params.deviceId) query.deviceId = params.deviceId;
			query.isLogin = true;

			const update = {};
			update["$set"] = {
				"isLogin": false
			};
			update["$unset"] = { deviceToken: "" };

			const options = { multi: true };
			
			return await this.updateMany(this.modelLoginHistory, query, update, options);

		} catch (error) {
			throw error;
		}
	}

	/**
	 * @function findDeviceById
	 */
	async findDeviceById(params) {
		try {
			const query: any = {};
			query.deviceId = params.deviceId;
			query["userId._id"] = params.userId;
			if (params.salt) query.salt = params.salt;
			query.isLogin = true;

			const projection = { salt: 1, lastLogin: 1, deviceId: 1, platform: 1 };

			return await this.findOne(this.modelLoginHistory, query, projection);
		} catch (error) {
			throw error;
		}
	}
}

export const loginHistoryDao = new LoginHistoryDao();