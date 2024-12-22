"use strict";

const mongoose = require("mongoose");
import {
  DB_MODEL_REF,
  PAYMENT_STATUS,
  SUBSCRIPTION_STATUS,
  SUB_TYPE,
} from "@config/constant";
import { Document, model, Model, Schema } from "mongoose";

export interface IUserPayment extends Document {
  userId?: string;
  name?: string;
  mobileNo?: string;
  paymentStatus?: string;
  status?: string;
  transactionId?: string;
  transactionDate?: number;
  cardDetails?: string;
  subscriptionId?: string;
  subscriptionStatus?: string;
  startDate?: number;
  productId?: string;
  priceId?: string;
  created?: number;
  subscriptionPlan?: string;
  amount?: number;
  paymentIntent?: string;
  chargeId?: string;
  brand?: string;
  country?: string;
  expMonth?: string;
  expYear?: string;
  lastFourDigit?: string;
  type?: string;
  deviceId?: string;
  cancelledOn?: number;
  upgradeOn?: number;
}

const userPaymentSchema: Schema = new mongoose.Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: DB_MODEL_REF.USER,
      required: false,
    },
    name: {
      type: String,
      required: false,
    },
    mobileNo: {
      type: String,
      required: false,
    },
    type: {
      type: String,
      required: false,
      enum: Object.values(SUB_TYPE),
    },
    paymentStatus: {
      type: String,
      required: false,
      enum: Object.values(PAYMENT_STATUS),
    },
    transactionId: {
      type: String,
      required: false,
    },
    transactionDate: {
      type: Number,
      required: false,
    },

    subscriptionId: {
      type: String,
      required: false,
    },

    subscriptionPlan: {
      type: String,
      required: false,
    },
    amount: {
      type: Number,
      required: false,
    },

    deviceId: {
      type: String,
      required: false,
    },
    created: { type: Number, default: Date.now },
    subscriptionStatus: {
      type: String,
      required: false,
      enum: Object.values(SUBSCRIPTION_STATUS),
    },
    cancelledOn: { type: Number, required: false },
    startDate: { type: Number, required: false },
    upgradeOn: { type: Number, required: false },
    renewOn: { type: Number, required: false },
    endDate: { type: Number, required: false },
    benefits: { type: Number, required: false },
    title: { type: String, required: false },
    image: { type: String, required: false },
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

userPaymentSchema.index({ status: 1 });

// Export payments schema user_payments
export const payments: Model<IUserPayment> = model<IUserPayment>(
  DB_MODEL_REF.USER_PAYMENTS,
  userPaymentSchema
);
