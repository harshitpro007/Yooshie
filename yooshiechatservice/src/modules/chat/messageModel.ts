"use strict";

const mongoose = require("mongoose");
import { Document, model, Model, Schema } from "mongoose";

import { DB_MODEL_REF, STATUS, CHAT_TYPE, MESSAGE_TYPE } from "@config/constant";

export interface UserLang {
  userId: Schema.Types.ObjectId;
  languageCode: string;
}

export interface Message extends Document {
  type: string,
  senderId: Schema.Types.ObjectId;
  members: Array<string>;
  chatId: Schema.Types.ObjectId,
  message: string;
  mediaUrl: string;
  messageType: string;
  translatedMessages: Object;
  isRead: Array<string>;
  status: string;
  langCodes: Array<string>;
  userLang: UserLang;
  created: number;
}

var messageSchema = new Schema({
  _id: { type: Schema.Types.ObjectId, required: true, auto: true },
  type: {
    type: String,
    enum: [CHAT_TYPE.ONE_TO_ONE, CHAT_TYPE.GROUP],
    default: CHAT_TYPE.ONE_TO_ONE
  },
  senderId: { type: Schema.Types.ObjectId },
  members: { type: [Schema.Types.ObjectId], default: [] },
  deletedBy: { type: [Schema.Types.ObjectId], default: [] },
  chatId: { type: Schema.Types.ObjectId, required: true }, 
  messageId: {type: Schema.Types.ObjectId}, //replied messageId
  vonageConversationId: { type: String, required: false },
  vonageMembersId: { type: [String], default: [] },
  vonageUsersId: { type: [String], default: [] },
  message: { type: String },
  thumbnailUrl: { type: String },
  size: { type: String },
  location: {
    lat: { type: Number },
    long: { type: Number }
  },
  imageRatio: {type: Number},
  localUrl: {type: String},
  messageType: {
    type: String,
    enum: [
      MESSAGE_TYPE.TEXT,
      MESSAGE_TYPE.IMAGE,
      MESSAGE_TYPE.AUDIO,
      MESSAGE_TYPE.DOCS,
      MESSAGE_TYPE.VIDEO,
      MESSAGE_TYPE.VOICE,
      MESSAGE_TYPE.LINK,
      MESSAGE_TYPE.LOCATION,
      MESSAGE_TYPE.HEADING,
      MESSAGE_TYPE.STICKER,
    ]
  },
  isRead: {
    type: [Schema.Types.ObjectId], default: []
  },
  isDelivered: {
    type: [Schema.Types.ObjectId], default: []
  },
  status: {
    type: String,
    enum: [
      STATUS.ACTIVE, STATUS.DELETED, STATUS.FORWARDED,
      STATUS.REPLIED
    ],
    default: STATUS.ACTIVE
  },
  reaction: {
    type: [{
      userId: Schema.Types.ObjectId,
      reaction: String
    }],
    default: []
  },
  taggedUser: { type: [Schema.Types.ObjectId], default: [] },
  blockedMessage: {type: Boolean, default: false},
  created: { type: Number, default: Date.now },
}, {
  versionKey: false,
  timestamps: true
});
messageSchema.index({ created: -1 });
messageSchema.index({ chatId: 1 });
messageSchema.index({ type: -1 });
messageSchema.index({ status: 1 });

export const messages: Model<Message> = model<Message>(DB_MODEL_REF.MESSAGES, messageSchema);

