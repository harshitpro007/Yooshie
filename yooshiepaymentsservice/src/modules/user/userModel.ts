"use strict";

import mongoose, { Document, model, Model, Schema } from "mongoose";

import {
	DB_MODEL_REF,
	GENDER,
	STATUS,
	USER_TYPE,
	VISIBILITY,
} from "@config/index";

export interface Category {
	_id: Schema.Types.ObjectId;
	name: string;
}

export interface IUser extends Document {
	_id: string;
	name?: string;
	email: string;
	salt: string;
	hash: string;
	gender?: string;
	profilePicture?: string;
	language?: string;
	countryCode?: string;
	mobileNo?: string;
	fullMobileNo?: string;
	isMobileVerified: boolean;
	location?: GeoLocation;
	status: string;
	created: number;
	platform: string;
	postCount: number;
	reportCount: number;
	arn: string;
	notificationCount: number;
	offlineStatus: boolean;
	subscriptionExpiryDate: number;
	refreshToken: string;

	category: Array<Category>;
	description: string;
	webLinks: Array<string>;
	isAlwaysOpen: boolean;
	startTime: number;
	endTime: number;
	days: Array<string>;
	isPersonalAccountSetup:boolean;
	isBusinessAccountSetup:boolean;

}

const geoSchema: Schema = new mongoose.Schema({
	type: { type: String, default: "Point" },
	address1: { type: String, required: false },
	address2: { type: String, required: false },
	coordinates: { type: [Number], index: "2dsphere", required: false }, // [longitude, latitude]
}, {
	_id: false
});

const featureSchema: Schema = new mongoose.Schema({
	conversationSummary: { type: Number, default: 0 },
	stickerGeneration: { type: Number, default: 0 },
	customGreetings: { type: Number, default: 0 },
	activateChatbot: { type: Number, default: 0 },
	rephrase: { type: Number, default: 0 },
	aiSuggestedResponse: { type: Number, default: 0 },
})

const userSchema: Schema = new mongoose.Schema({
	_id: { type: Schema.Types.ObjectId, required: true, auto: true },
	name: { type: String, trim: true, required: false },
	businessName: { type: String, trim: true, required: false },
	email: { type: String, trim: true, required: false },
	salt: { type: String, required: false },
	hash: { type: String, required: false },
	gender: {
		type: String,
		required: false,
		enum: Object.values(GENDER)
	},
	profilePicture: { type: String, required: false },
	language: { type: String, required: false },
	languageCode: { type: String, required: false },
	countryCode: { type: String, required: true },
	flagCode: { type: String, required: false },
	mobileNo: { type: String, required: true },
	fullMobileNo: { type: String, required: false },
	isMobileVerified: { type: Boolean, default: false },
	isProfileCompleted: { type: Boolean, default: false },
	location: geoSchema,
	about: { type: String, trim: true, required: false },
	userType: {
		type: String,
		default: USER_TYPE.USER,
		enum: Object.values(USER_TYPE)
	},
	pushNotificationStatus: { type: Boolean, default: true }, // for inapp notifications
	status: {
		type: String,
		enum: [STATUS.BLOCKED, STATUS.UN_BLOCKED, STATUS.DELETED],
		default: STATUS.UN_BLOCKED
	},
	visibility: {
		type: String,
		enum: Object.values(VISIBILITY),
		default: VISIBILITY.PRIVATE
	},
	selectedUsers: { type: [Schema.Types.ObjectId], default: [] },
	platform: { type: String, required: false },
	created: { type: Number, default: Date.now },
	lastSeen: { type: String, default: Date.now },
	blocked: { type: [Schema.Types.ObjectId], default: [] },
	offlineStatus: { type: Boolean, default: false },
	receipt: { type: String, required: false },
	subscriptionType: { type: String, required: false },
	isSubscribed: { type: Boolean, default: false },
	original_transaction_id: { type: String, required: false },
	subscriptionExpiryDate: { type: Number, required: false },
	refreshToken: { type: String, index: true },
	subscribedPlatform: { type: String, required: false },
	isBusinessAccountUpdated: { type: Boolean, default: false },
	isPersonalAccountUpdated: { type: Boolean, default: false },
	category: [{
		_id: { type: Schema.Types.ObjectId },
		name: { type: String }
	}],
	webLinks: { type: [String], default: [] },
	mediaLinks: {
		type: new mongoose.Schema(
			{
				fb: { type: String, trim: true, optional: true },
				insta: { type: String, trim: true, optional: true },
				youTube: { type: String, trim: true, optional: true },
				linkedin: { type: String, trim: true, optional: true },
			},
			{ _id: false } // Set _id to false to exclude _id from the mediaLinks
		),
	},
	isAlwaysOpen: { type: Boolean },
	startTime: { type: Number },
	endTime: { type: Number },
	qrCode: { type: String },
	days: { type: [String], default: [] },
	isGreetingMsgEnable: { type: Boolean, default: false },
	greetingMsg: { type: String, default: "" },
	isAwayMsgEnable: { type: Boolean, default: false },
	awayMsg: { type: String, default: "" },
	isContactSynced: { type: Boolean, default: false },
	awayOutside: {
		type: new mongoose.Schema(
			{
				startTime: { type: Number, default: 0 },
				endTime: { type: Number, default: 0 },
			},
			{ _id: false } // Set _id to false to exclude _id from the awayOutside
		),
	},
	isProductOrCollAdded: { type: Boolean, default: false },
	isUserDeleted: { type: Boolean, default: false },
	subscriptionFeature: featureSchema,
	isPersonalAccountSetup: { type: Boolean, default: false },
	isBusinessAccountSetup: { type: Boolean, default: false }


}, {
	versionKey: false,
	timestamps: true
});

userSchema.post("save", async function (doc) {
	setTimeout(() => {
	}, 10);
});



userSchema.post("findOneAndUpdate", function (doc) {

	setTimeout(() => {
	}, 10);
});


// Export user
export const users: Model<IUser> = model<IUser>(DB_MODEL_REF.USER, userSchema);