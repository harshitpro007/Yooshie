"use strict";

import mongoose, { Document, model, Model, Schema } from "mongoose";

import { 
	USER_TYPE,
	DB_MODEL_REF,
	DEVICE_TYPE,
	STATUS,
	timeZones, } from "@config/index";

export interface ILoginHistory extends Document {
	userId: {
		_id: Schema.Types.ObjectId;
		isApproved?: boolean;
		name?: string;
		firstName?: string;
		lastName?: string;
		email: string;
		pushNotificationStatus?: boolean;
		groupaNotificationStatus?: boolean;
		userType: string;
		status: string;
		arn?: string;
		VOIParn?: string;
	};
	salt: string;
	isLogin: boolean;
	lastLogin?: number;
	deviceId: string;
	remoteAddress: string;
	platform: string;
	deviceToken?: string;
	location: any;
	timezone: string;
	created: number;
	voipToken?: string;
}

const loginHistorySchema: Schema = new mongoose.Schema({
	_id: { type: Schema.Types.ObjectId, required: true, auto: true },
	userId: {
		_id: {
			type: Schema.Types.ObjectId,
			required: true
		},
		isApproved: { type: Boolean, required: false },
		name: { type: String, trim: true, required: false },
		firstName: { type: String, trim: true, required: false },
		lastName: { type: String, trim: true, required: false },
		email: { type: String, trim: true, required: false },
		pushNotificationStatus: { type: Boolean, required: false, default: true },
		groupaNotificationStatus: { type: Boolean, required: false, default: true },
		userType: {
			type: String,
			required: false,
			enum: [USER_TYPE.ADMIN, USER_TYPE.SUB_ADMIN]
		},
		status: {
			type: String,
			required: true,
			enum: [STATUS.BLOCKED, STATUS.UN_BLOCKED, STATUS.DELETED]
		},
		arn: {type: String, required: false},
		VOIParn: {type: String, required: false},

	},
	salt: { type: String, required: true },
	isLogin: { type: Boolean, default: true },
	lastLogin: { type: Number, required: false },
	deviceId: { type: String, required: true },
	remoteAddress: { type: String, required: true },
	platform: {
		type: String,
		required: true,
		enum: [DEVICE_TYPE.ANDROID, DEVICE_TYPE.IOS, DEVICE_TYPE.WEB]
	},
	deviceToken: { type: String, required: false },
	location: {},
	timezone: { type: String, default: timeZones[0] },
	created: { type: Number, default: Date.now },
	voipToken: { type: String, required: false },

}, {
	versionKey: false,
	timestamps: true
});

loginHistorySchema.index({ "userId._id": 1 });
loginHistorySchema.index({ isLogin: 1 });
loginHistorySchema.index({ created: -1 });

/**
 * @description it is not in camelCase b/c mongoose gives that same as of our collections names
 */
export const login_histories: Model<ILoginHistory> = model<ILoginHistory>(DB_MODEL_REF.LOGIN_HISTORY, loginHistorySchema);