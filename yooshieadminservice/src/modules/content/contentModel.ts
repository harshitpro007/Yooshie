"use strict";

const mongoose = require("mongoose");
import { Document, model, Model, Schema } from "mongoose";

import { CONTENT_STATUS, CONTENT_TYPE, DB_MODEL_REF } from "@config/constant";

export interface IContent extends Document {
  data: string;
  type: string;
  question: string;
  answer: string;
  created: number;
  position: number;
  status: string;
}

const contentSchema: Schema = new mongoose.Schema(
  {
    data: { type: String, trim: true, required: false },
    type: {
      type: String,
      required: true,
      enum: Object.values(CONTENT_TYPE),
    },
    question: { type: String, required: false },
    answer: { type: String, required: false },
    created: { type: Number, default: Date.now },
    imageAndContent: [
      {
        title: { type: String },
        image: { type: String },
        description: { type: String },
        _id: { type: Schema.Types.ObjectId, auto: true },
      },
    ],
    status: {
      type: String,
      enum: Object.values(CONTENT_STATUS),
      required: true,
      default: CONTENT_STATUS.UN_BLOCKED, // set a default status
    },
  },
  {
    versionKey: false,
    timestamps: true,
  }
);
contentSchema.index({ question: 1 }, { sparse: true });

// Export content
export const contents: Model<IContent> = model<IContent>(
  DB_MODEL_REF.CONTENT,
  contentSchema
);
