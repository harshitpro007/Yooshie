"use strict";

import mongoose, { Document, model, Model, Schema } from "mongoose";

import {
  DB_MODEL_REF,
  STATUS,
  USER_TYPE,
  SERVER,
  GEN_STATUS,
  MODULES,
} from "@config/index";

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
  reinvite: boolean;
  isProfileCompleted: boolean;
}

let permission = new Schema(
  {
    module: { type: String, required: true, enum: Object.values(MODULES) },
    view: { type: Boolean, default: false },
    addAndEdit: { type: Boolean, default: false },
		blockAndUnblock: { type: Boolean, default: false },
    delete: { type: Boolean, default: false },
  },
  {
    _id: false,
  }
);

const adminSchema: Schema = new mongoose.Schema(
  {
    _id: { type: Schema.Types.ObjectId, required: true, auto: true },
    profilePicture: { type: String, required: false },
    name: { type: String, required: false },
    email: { type: String, trim: true, lowercase: true, required: true },
    salt: { type: String, required: false },
    hash: { type: String, required: false },
    userType: {
      type: String,
      enum: [USER_TYPE.ADMIN, USER_TYPE.ASSISTANT],
      default: USER_TYPE.ADMIN,
    },
    status: {
      type: String,
      enum: Object.values(GEN_STATUS),
      default: GEN_STATUS.PENDING,
    },
    permission: [permission],

    countryCode: { type: String, required: false },
    mobileNo: { type: String, required: false },
    fullMobileNo: { type: String, required: false },
    assignedClientCount: {type: Number, required: false, default: 0},
    created: { type: Number, default: Date.now },
    addedBy: { type: Schema.Types.ObjectId, required: false },
  },
  {
    versionKey: false,
    timestamps: true,
  }
);


// Export admin
export const admins: Model<IAdmin> = model<IAdmin>(DB_MODEL_REF.ADMIN, adminSchema);
