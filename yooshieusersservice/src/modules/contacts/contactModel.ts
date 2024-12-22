"use strict";

const mongoose = require("mongoose");
import { Document, model, Model, Schema } from "mongoose";
import { DB_MODEL_REF, STATUS } from "@config/constant";

export interface IContact extends Document {
  title: string;
  description: string;
  taskDate: number;
  shareTaskUser: {};
  status: string;
  created: number;
}

const contactSchema: Schema = new mongoose.Schema(
  {
    _id: { type: Schema.Types.ObjectId, required: true, auto: true },
    userId: { type: Schema.Types.ObjectId, required: true },
    name: { type: String, trim: true, required: false },
    email: { type: String, trim: true, required: true },
    countryCode: { type: String, required: true },
    mobileNo: { type: String, required: true },
    status: {
      type: String,
      enum: [STATUS.UN_BLOCKED, STATUS.BLOCKED, STATUS.DELETED],
      default: STATUS.UN_BLOCKED,
    },
    created: { type: Number, default: Date.now },
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

export const contacts: Model<IContact> = model<IContact>(DB_MODEL_REF.CONTACT, contactSchema);
