import { DB_MODEL_REF } from '@config/constant';
import mongoose, { Schema, Document } from 'mongoose';

interface IMessage extends Document {
  conversationId: string; // Reference to Conversation ID
  senderId: String; // Member ID of the sender
  message: string; // Message text
  members: Array<string>;
  users: Array<string>;
  type: string; // Type of message (e.g., 'text')
  timestamp: Date; // Timestamp of the message
}

const MessageSchema: Schema = new Schema(
  {
    conversationId: { type: String, required: true, index: true }, // Reference to Conversation
    senderId: { type: String, required: true }, // ID of the message sender
    members: { type: [String], default: [] },
    message: { type: String, required: true },
    users: { type: [String], default: [] },
    type: { type: String, required: true, default: 'text' }, // Default type is text
    created: { type: Number, default: Date.now }, // Default timestamp is now
  },
  {
    versionKey: false,
    timestamps: true, // Automatically adds `createdAt` and `updatedAt`
  }
);

export const events = mongoose.model<IMessage>(DB_MODEL_REF.EVENTS, MessageSchema);
