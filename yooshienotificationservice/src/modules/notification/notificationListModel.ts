"use strict";

import mongoose, { Document, model, Model, Schema } from "mongoose";
import { DB_MODEL_REF, NOTIFICATION_TYPE, STATUS, USER_TYPE } from "@config/index";

export interface INotification extends Document {
    _id: string;
    title: string;
    description: string;
    platform: string;
    userId: string;
    notificationId: string;
    isRead: boolean;
    status: string;
    created: number;
}

const notificationSchema: Schema = new mongoose.Schema({
    _id: { type: Schema.Types.ObjectId, required: true, auto: true },
    senderId: {
		type: Schema.Types.ObjectId,
		required: false
	},
	receiverId: {
		type: Schema.Types.ObjectId,
        required: false
	},
	type: { type: String, required: false, enum: [...Object.values(NOTIFICATION_TYPE)]},
	message: { type: String, required: true },
	title: { type: String, required: true },
	details: {type: Object, required: false},
	isRead: { type: Boolean, default: false },
	status: {
		type: String,
		required: false,
		enum: [STATUS.UN_BLOCKED,STATUS.DELETED,STATUS.BLOCKED],
		default: STATUS.UN_BLOCKED
	},
	created: { type: Number, default: Date.now }
}, {
    versionKey: false,
    timestamps: true
});

export const notification_lists: Model<INotification> = model<INotification>(DB_MODEL_REF.NOTIFICATION_LIST, notificationSchema);
