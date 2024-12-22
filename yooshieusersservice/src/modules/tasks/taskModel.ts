"use strict";

const mongoose = require("mongoose");
import { Document, model, Model, Schema } from "mongoose";
import { DB_MODEL_REF, STATUS } from "@config/constant";

export interface ITask extends Document {
  title: string;
  description: string;
  taskDate: number;
  shareTaskUser: {};
  status: string;
  created: number;
}

const taskSchema: Schema = new mongoose.Schema(
  {
    _id: { type: Schema.Types.ObjectId, required: true, auto: true },
    title: { type: String, required: false },
    description: { type: String, required: false },
    taskDate: { type: Number, required: false },
    userId: { type: Schema.Types.ObjectId, required: false },
    isTaskShared: { type: Boolean, required: false, default: false},
    shareTaskUser: {
      userName: { type: String, required: false },
      userId: { type: Schema.Types.ObjectId, required: false },
      email: { type: String, required: false },
      profilePicture: { type: String, required: false }
    },
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

export const task: Model<ITask> = model<ITask>(DB_MODEL_REF.TASK, taskSchema);
