"use strict";

const mongoose = require("mongoose");
import { Document, model, Model, Schema } from "mongoose";

import { DB_MODEL_REF, STATUS } from "@config/constant";

export interface IReminder extends Document {
  title: string;
  description: string;
  reminderDate: number;
  status: string;
  created: number;
}

const reminderSchema: Schema = new mongoose.Schema(
  {
    _id: { type: Schema.Types.ObjectId, required: true, auto: true },
    title: { type: String, required: false },
    description: { type: String, required: false },
    reminderDate: { type: Number, required: false },
    userId: { type: Schema.Types.ObjectId, required: false }, //this id for user who is creating reminder.

    status: {
      type: String,
      enum: [STATUS.PENDING, STATUS.COMPLETED, STATUS.DELETED],
      default: STATUS.PENDING,
    },
    created: { type: Number, default: Date.now },
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

export const reminder: Model<IReminder> = model<IReminder>(
  DB_MODEL_REF.REMINDER,
  reminderSchema
);
