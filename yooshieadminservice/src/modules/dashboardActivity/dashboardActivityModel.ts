"use strict";

import mongoose, { Document, model, Model, Schema } from "mongoose";

import { DB_MODEL_REF } from "@config/constant";

export interface IDashboardActivity extends Document {
  userId: string;
  assistantId: string;
  actionType: string;
  actionCount?: number;
  points: number;
  created: number;
}

const dashboardActivitySchema: Schema = new mongoose.Schema(
  {
    _id: { type: Schema.Types.ObjectId, required: true, auto: true },
    userId: {
      type: Schema.Types.ObjectId,
    },
    assistantId: { type: Schema.Types.ObjectId },
    actionType: { type: String }, // e.g., 'taskCreated', 'goalUpdated', 'totalPoints'
    actionCount: { type: Number, default: 0 }, // Count of how many times this action was performed
    points: { type: Number, default: 0 }, // Points for this action type
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

dashboardActivitySchema.index({ actionType: 1 });
dashboardActivitySchema.index({ created: -1 });

/**
 * @description it is not in camelCase b/c mongoose gives that same as of our collections names
 */
export const dashboard_activity: Model<IDashboardActivity> =
  model<IDashboardActivity>(
    DB_MODEL_REF.DASHBOARD_ACTIVITY,
    dashboardActivitySchema
  );
