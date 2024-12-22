"use strict";

import mongoose, { Document, model, Model, Schema } from "mongoose";

import { DB_MODEL_REF, GENDER, STATUS, USER_TYPE } from "@config/index";

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

  inAppNotificationStatus: boolean;
  emailNotificationStatus: boolean;
}

const geoSchema: Schema = new mongoose.Schema(
  {
    type: { type: String, default: "Point" },
    address1: { type: String, required: false },
    address2: { type: String, required: false },
    coordinates: { type: [Number], index: "2dsphere", required: false }, // [longitude, latitude]
  },
  {
    _id: false,
  }
);

const userSchema: Schema = new mongoose.Schema(
  {
    _id: { type: Schema.Types.ObjectId, required: true, auto: true },
    name: { type: String, trim: true, required: false },
    email: { type: String, trim: true, required: false },
    firstName: { type: String, trim: true, required: false },
    lastName: { type: String, trim: true, required: false },
    salt: { type: String, required: false },
    hash: { type: String, required: false },
    gender: {
      type: String,
      required: false,
      enum: Object.values(GENDER),
    },
    profilePicture: { type: String, required: false },
    language: { type: String, required: false },
    countryCode: { type: String, required: true },
    flagCode: { type: String, required: false },
    mobileNo: { type: String, required: true },
    fullMobileNo: { type: String, required: false },
    isMobileVerified: { type: Boolean, default: false },
    isEmailVerified: { type: Boolean, default: false },
    isProfileCompleted: { type: Boolean, default: false },
    about: { type: String, trim: true, required: false },
    userType: {
      type: String,
      default: USER_TYPE.USER,
      enum: Object.values(USER_TYPE),
    },
    pushNotificationStatus: { type: Boolean, default: false }, // for push notifications
    inAppNotificationStatus: { type: Boolean, default: false }, // for inapp notifications
    emailNotificationStatus: { type: Boolean, default: false },

    status: {
      type: String,
      enum: [STATUS.BLOCKED, STATUS.UN_BLOCKED, STATUS.DELETED],
      default: STATUS.UN_BLOCKED,
    },

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
    occupation: { type: String },
    dob: { type: String },
    isUserDeleted: { type: Boolean, default: false },
    assistantId: { type: Schema.Types.ObjectId, required: false },
    assistantName: { type: String, required: false },
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

userSchema.post("save", async function (doc) {
  setTimeout(() => {}, 10);
});

userSchema.post("findOneAndUpdate", function (doc) {
  setTimeout(() => {}, 10);
});

// Export user
export const users: Model<IUser> = model<IUser>(DB_MODEL_REF.USER, userSchema);
