"use strict";

const mongoose = require("mongoose");
import { Document, model, Model, Schema } from "mongoose";

import {
  DB_MODEL_REF,
  GOAL_CATEGORY,
  STATUS,
  TIME_TYPE,
} from "@config/constant";

export interface IGoal extends Document {
  title: string;
  description: string;
  startDate: Number;
  endDate: Number;
  goalType: string;
  totalDaysToGoal: string;
  completedGoal: string;
  userId: string;
  category: string;
  status: string;
  created: number;
}

const goalSchema: Schema = new mongoose.Schema(
  {
    _id: { type: Schema.Types.ObjectId, required: true, auto: true },
    title: { type: String, required: false },
    goalType: {
      type: String,
      enum: [TIME_TYPE.WEEKLY, TIME_TYPE.MONTHLY, TIME_TYPE.YEARLY],
    },
    totalDaysToGoal: { type: Number, required: false },
    completedGoal: { type: Number, required: false }, //marked goal
    remainingDaysToGoal: { type: Number, required: false },
    startDate: { type: Number, required: false },
    endDate: { type: Number, required: false },
    description: { type: String, required: false },
    userId: { type: Schema.Types.ObjectId, required: false }, //this id for user who is creating task.

    category: {
      type: String,
      enum: Object.values(GOAL_CATEGORY),
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

export const goal: Model<IGoal> = model<IGoal>(DB_MODEL_REF.GOAL, goalSchema);
