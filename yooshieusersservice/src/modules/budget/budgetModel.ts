"use strict";

const mongoose = require("mongoose");
import { Document, model, Model, Schema } from "mongoose";

import { DB_MODEL_REF, STATUS, TIME_TYPE } from "@config/constant";

export interface IBudget extends Document {
  title: string;
  description: string;
  startDate: number;
  endDate: number;
  budgetType: string;
  totalBudget: number;
  amountAdded: number;
  userId: string;
  status: string;
  paymentLink: string;
  created: number;
}

const budgetSchema: Schema = new mongoose.Schema(
  {
    _id: { type: Schema.Types.ObjectId, required: true, auto: true },
    title: { type: String, required: false },
    description: { type: String, required: false },
    budgetType: {
      type: String,
      enum: [TIME_TYPE.WEEKLY, TIME_TYPE.MONTHLY, TIME_TYPE.YEARLY],
    },

    startDate: { type: Number, required: false },
    endDate: { type: Number, required: false },
    userId: { type: Schema.Types.ObjectId, required: false }, //this id for user who is creating budget.

    totalBudget: { type: Number, required: false },
    amountAdded: { type: Number, required: false },
    paymentLink: { type: String, required: false },

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

export const budget: Model<IBudget> = model<IBudget>(
  DB_MODEL_REF.BUDGET,
  budgetSchema
);
