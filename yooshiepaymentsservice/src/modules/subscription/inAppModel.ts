"use strict";

const mongoose = require("mongoose");
import { DB_MODEL_REF } from "@config/constant";
import { Document, model, Model, Schema } from "mongoose";

export interface IInapp extends Document {
    feedId: string;
    reportedById: string;
    reason: string;
    other: string;
    status: string;
    created: number;
}

const inappSchema: Schema = new mongoose.Schema({
    payload: { type: Object },
    created: { type: Number, default: Date.now }
}, {
    versionKey: false,
    timestamps: true
});

// Export inapps
export const inapps: Model<IInapp> = model<IInapp>(DB_MODEL_REF.INAPP, inappSchema);
