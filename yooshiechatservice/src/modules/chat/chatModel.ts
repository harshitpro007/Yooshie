"use strict";

const mongoose = require("mongoose");
import { Document, model, Model, Schema } from "mongoose";

import { DB_MODEL_REF, STATUS, CHAT_TYPE } from "@config/constant";

export interface UserLang {
  userId: Schema.Types.ObjectId;
  languageCode: string;
  userLang;
}
export interface Chats extends Document {
  type: string;
  members: Array<string>;
  lastMsgId: Schema.Types.ObjectId;
  status: string;
  created: number;
  userLang: UserLang;
  lastMsgCreated: number;
}

const chatSchema: Schema = new mongoose.Schema(
  {
    _id: { type: Schema.Types.ObjectId, required: true, auto: true },
    vonageConversationId: { type: String, required: false},
    vonageMembersId: {type: [String], default: []},
    vonageUsersId: {type: [String], default: []},
    type: {
      type: String,
      enum: [CHAT_TYPE.ONE_TO_ONE, CHAT_TYPE.GROUP],
      default: CHAT_TYPE.ONE_TO_ONE,
    },
    members: { type: [Schema.Types.ObjectId], default: [] },/*Active members*/
    overallMembers: {type: [Schema.Types.ObjectId], default: []}, /*Active as well as left/removed members from group*/
    lastMsgId: { type: Schema.Types.ObjectId },
    lastBlockedMsgId: { type: Schema.Types.ObjectId },
    lastMsgCreated: { type: Number },
    wallpaper: {
      type: [
        {
          _id: false,
          userId: Schema.Types.ObjectId,
          url: String,
        },
      ],
      default: [],
    },
    exitedBy: {
      type: [Schema.Types.ObjectId],
      default: [],
    } /*group case even after exit a member chat list shown*/,
    deletedBy: { type: [Schema.Types.ObjectId], default: [] },
    mutedBy: { type: [Schema.Types.ObjectId], default: [] },
    status: {
      type: String,
      enum: [STATUS.UN_BLOCKED, STATUS.DELETED, STATUS.BLOCKED],
      default: STATUS.UN_BLOCKED,
    },
    name: { type: String },
    description: { type: String },
    groupProfilePicture: { type: String },
    admins: { type: [Schema.Types.ObjectId], default: [] },
    createdBy: { type: Schema.Types.ObjectId },
    lastMsgIdByUsers: {
      type: [
        {
          _id: false,
          userId: Schema.Types.ObjectId,
          lastMsgId: Schema.Types.ObjectId,
        },
      ],
      default: [],
    },
    created: { type: Number, default: Date.now },
  },
  {
    versionKey: false,
    timestamps: true,
  }
);
chatSchema.index({ lastMsgId:-1, created: -1 });
chatSchema.index({ created: -1});
chatSchema.index({ type: -1});
chatSchema.index({ status: 1});

export const chats: Model<Chats> = model<Chats>(DB_MODEL_REF.CHATS, chatSchema);
