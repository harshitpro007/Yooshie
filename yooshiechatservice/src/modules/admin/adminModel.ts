"use strict";

import mongoose, { Document, model, Model, Schema } from "mongoose";

import { encryptHashPassword, genRandomString } from "@utils/appUtils";
import { DB_MODEL_REF, STATUS, USER_TYPE, SERVER, GEN_STATUS } from "@config/index";

export interface IAdmin extends Document {
	_id: string;
	profilePicture?: string;
	name: string;
	email: string;
	salt: string;
	hash: string;
	userType: string;
	webToken: string;
	status: string;
	created: number;
	forgotToken: string;
	roleId: string;
	addedBy: string;
	refreshToken: string;
	reinvite:boolean;
	isProfileCompleted:boolean;
}

const adminSchema: Schema = new mongoose.Schema({
	_id: { type: Schema.Types.ObjectId, required: true, auto: true },
	profilePicture: { type: String, required: false },
	name: { type: String, required: false },
	email: { type: String, trim: true, lowercase: true, required: true },
	salt: { type: String, required: false },
	hash: { type: String, required: false },
	userType: {
		type: String,
		enum: [USER_TYPE.ADMIN, USER_TYPE.SUB_ADMIN],
		default: USER_TYPE.ADMIN
	},
	status: {
		type: String,
		enum: Object.values(GEN_STATUS),
		default: GEN_STATUS.PENDING
	},
	created: { type: Number, default: Date.now },
	roleId: {
		type: Schema.Types.ObjectId,
		ref: DB_MODEL_REF.ROLE,
		index: true,
	},
	addedBy: { type: Schema.Types.ObjectId, required: false },
	vonageUserId: { type: String, required: false }
}, {
	versionKey: false,
	timestamps: true
});

// Load password virtually
adminSchema.virtual("password")
	.get(function () {
		return this._password;
	})
	.set(function (password) {
		this._password = password;
		const salt = this.salt = genRandomString(SERVER.SALT_ROUNDS);
		this.hash = encryptHashPassword(password, salt);
	});

// adminSchema.index()

// Export admin
export const admins: Model<IAdmin> = model<IAdmin>(DB_MODEL_REF.ADMIN, adminSchema);  
