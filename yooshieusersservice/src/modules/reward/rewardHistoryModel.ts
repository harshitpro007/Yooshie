"use strict";

const mongoose = require("mongoose");
import { Document, model, Model, Schema } from "mongoose";

import { DB_MODEL_REF } from "@config/constant";

export interface IReward extends Document {
  points: number;
  events: string;
  userId: string;
  created: number;
}

const rewardHistorySchema = new mongoose.Schema(
  {
    _id: { type: Schema.Types.ObjectId, required: true, auto: true },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    }, // Reference to the user
    event: { type: String, required: true }, // e.g., 'Task Completed', 'Gift Card Purchased'
    eventType: {
      type: String,
      required: true,
    }, // e.g., 'task', 'goal', 'purchase'
    points: { type: Number, required: true }, // Points earned or used
    date: { type: Date, default: Date.now }, // Date of the event
    created: { type: Number, default: Date.now }, // Timestamp for record creation
    image: {
      type: String,
      required: false,
    },
    // Fields specific to purchases
    purchaseDetails: {
      giftCardCode: { type: String }, // Code of the purchased gift card
      giftCardName: { type: String }, // Name of the gift card
      invoiceId: { type: String }, // Invoice ID for tracking
      actualMoneyUsed: { type: Number, default: 0 }, // Money spent in addition to points
    },
  },

  {
    versionKey: false,
    timestamps: true,
  }
);
rewardHistorySchema.index({ userId: 1, eventType: 1, created: -1, points: -1 });

export const reward_histories: Model<IReward> = model<IReward>(
  DB_MODEL_REF.REWARD_HISTORY,
  rewardHistorySchema
);
