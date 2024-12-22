import { DB_MODEL_REF } from '@config/constant';
import mongoose, { Schema, Document } from 'mongoose';

interface IConversation extends Document {
  conversationId: string; // Vonage conversation ID
  groupName: string; // Name of the group
  members:Array<string>; // List of member IDs
  users: Array<string>;
  createdAt: Date; // Timestamp of creation
  updatedAt: Date; // Timestamp of last update
}

const ConversationSchema: Schema = new mongoose.Schema(
  {
    conversationId: { type: String, required: true, unique: true },
    groupName: { type: String, required: true },
    members: { type: [String], default: [] }, // Store member IDs as strings
    created: { type: Number, default: Date.now },
    users: { type: [String], default: [] },
  },
  {
    versionKey: false,
    timestamps: true, // Automatically adds `createdAt` and `updatedAt`
  }
);

export const conversations = mongoose.model<IConversation>(DB_MODEL_REF.CONVERSATION, ConversationSchema);
