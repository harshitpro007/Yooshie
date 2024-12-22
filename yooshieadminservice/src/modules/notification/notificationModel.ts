"use strict";

import mongoose, { Document, model, Model, Schema } from "mongoose";
import { DB_MODEL_REF, STATUS, USER_TYPE } from "@config/index";

export interface INotification extends Document {
  _id: string;
  title: string;
  description: string;
  userType: string;
  status: string;
  created: number;
}

const notificationSchema: Schema = new mongoose.Schema({
  _id: { type: Schema.Types.ObjectId, required: true, auto: true },
  title: {type: String},
  description: {type:String},
  userType: {type:String, enum: [USER_TYPE.ASSISTANT, USER_TYPE.USER, USER_TYPE.ALL]},
  status: {
      type: String,
      enum: [STATUS.UN_BLOCKED, STATUS.BLOCKED, STATUS.DELETED],
      default: STATUS.UN_BLOCKED
  },
  created: { type: Number, default: Date.now }
}, {
    versionKey: false,
    timestamps: true
});

export const notifications: Model<INotification> = model<INotification>(DB_MODEL_REF.NOTIFICATION, notificationSchema);
