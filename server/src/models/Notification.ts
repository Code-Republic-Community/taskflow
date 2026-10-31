import { Schema, model, type InferSchemaType } from "mongoose";
import { NOTIFICATION_TYPES } from "./constants.ts";

// TODO(TF-11): I added this temporary copy so TF-11 work could continue without waiting for TF-10.
const notificationSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    actorId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, enum: NOTIFICATION_TYPES, required: true },
    issue: { type: Schema.Types.ObjectId, ref: "Issue", required: true },
    message: { type: String, required: true, trim: true },
    read: { type: Boolean, default: false },
  },
  { timestamps: true, strict: "throw" },
);

notificationSchema.index({ userId: 1, read: 1, createdAt: -1 });

export type NotificationDoc = InferSchemaType<typeof notificationSchema>;

export const Notification = model("Notification", notificationSchema);
