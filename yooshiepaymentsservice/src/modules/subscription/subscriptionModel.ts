"use strict";

const mongoose = require("mongoose");
import { DB_MODEL_REF, SUBSCRIPTION_STATUS, SUB_TYPE } from "@config/constant";
import { Document, model, Model, Schema } from "mongoose";


export interface IUserSubscription extends Document {
    userId?: string;
    name?: string;
    mobileNo?: string;
    subscriptionType?: string;
    orderId?: string;
    autoRenewing?: boolean,
    startDate?: number;
    endDate?: number;
    isActive?: boolean;
    isCancelled?: boolean;
    receiptToken?: string;
    productId?: string;
    transactionId?: string;
    original_transactionId?: string;
    amount?: number;
    platform?: string;
    subscriptionStatus?: string;
    cancelledOn?: number;
}

const userSubscriptionSchema: Schema = new mongoose.Schema({
    userId: { type: Schema.Types.ObjectId, ref: DB_MODEL_REF.USER, required: false },
    name: {type: String, required: false},
    mobileNo: { type: String, required: false },
    subscriptionType: { type: String, required: false, index: true },
    orderId: { type: String, required: false, index: true },
    autoRenewing: { type: Boolean, required: false, default: true },
    startDate: { type: Number, required: false },
    endDate: { type: Number, required: false },
    isActive: { type: Boolean, required: false, default: true, index: true },
    isCancelled: { type: Boolean, required: false, default: false },
    receiptToken: { type: String, require: false },
    productId: { type: String, required: false },
    transactionId: { type: String, required: false },
    original_transactionId: { type: String, required: false },
    amount: { type: Number, required: false },
    platform: { type: String, required: false, enum: Object.values(SUB_TYPE) },
    subscriptionStatus: {
        type: String, required: false,
        enum: Object.values(SUBSCRIPTION_STATUS)
    },
    cancelledOn: {type: Number, required: false},
    created: { type: Number, default: Date.now },
}, {
    versionKey: false,
    timestamps: true
});

userSubscriptionSchema.index({ type: 1 });
// Export subscriptions schema
export const subscriptions: Model<IUserSubscription> = model<IUserSubscription>(DB_MODEL_REF.SUBSCRIPTIONS, userSubscriptionSchema);
