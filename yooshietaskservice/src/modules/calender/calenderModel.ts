"use strict";

const mongoose = require("mongoose");
import { Document, model, Model, Schema } from "mongoose";

import { CAL_TYPE, DB_MODEL_REF, STATUS } from "@config/constant";

export interface ICalender extends Document {
  userId: string;
  events: [];
  created: number;
}
const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  eventDate: { type: Number, required: true }, // Stored as a timestamp (milliseconds)
});

const calenderSchema: Schema = new mongoose.Schema(
  {
    _id: { type: Schema.Types.ObjectId, required: true, auto: true },
    userId: { type: Schema.Types.ObjectId, required: false }, //perticular user calender
    events: [eventSchema],
    source: { type: String, enum: [CAL_TYPE.GOOGLE, CAL_TYPE.APPLE] },
    created: { type: Number, default: Date.now },
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

export const calender: Model<ICalender> = model<ICalender>(
  DB_MODEL_REF.CALENDER,
  calenderSchema
);
