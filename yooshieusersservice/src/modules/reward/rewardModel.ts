"use strict";

const mongoose = require("mongoose");
import { Document, model, Model, Schema } from "mongoose";

import { DB_MODEL_REF } from "@config/constant";

export interface IReward extends Document {
  totalPoints: number;
  dailyPoints: number;
  lastUpdated: string;
  goalsCompletedOnTime: Number;
  loginStreak: string;
  tasksCompletedOnTime: number;
  lastLoginDate: string;
  userId: string;
  milestones: string;
  created: number;
}

const rewardSchema: Schema = new mongoose.Schema(
  {
    _id: { type: Schema.Types.ObjectId, required: true, auto: true },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    }, // Reference to the user
    totalPoints: { type: Number, default: 0 }, // Total reward points earned
    dailyPoints: { type: Number, default: 0 }, // Points earned today
    lastUpdated: { type: Number, default: Date.now }, // To reset daily points
    goalsCompletedOnTime: { type: Number, default: 0 }, // Track goals completed on time
    tasksCompletedOnTime: { type: Number, default: 0 }, // Track tasks completed on time
    loginStreak: { type: Number, default: 0 }, // Number of consecutive daily logins
    lastLoginDate: { type: Number }, // Track last login date for streak calculation
    milestones: {
      // Milestone achievements (e.g., completing 5 tasks on time)
      type: [
        new mongoose.Schema({
          type: { type: String, required: true }, // e.g., 'taskMilestone', 'goalMilestone'
          points: { type: Number, required: true }, // Points awarded for the milestone
          achievedAt: { type: Date, required: true }, // Date when milestone was achieved
        }),
      ],
      default: [], // List of milestones achieved
    },
    created: { type: Number, default: Date.now },
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

export const reward: Model<IReward> = model<IReward>(
  DB_MODEL_REF.REWARD,
  rewardSchema
);
