import type { Types } from "mongoose";

import { Notification } from "../models/Notification.ts";
import { AppError } from "../utils/AppError.ts";
import { NOTIFICATION_ERRORS } from "../constants/notification.constants.ts";

import type { Pagination } from "../utils/pagination.ts";
import type { User } from "../types/auth.types.ts";

const ACTOR_FIELDS = "name email avatarColor";
const ISSUE_FIELDS = "key";

// GET /notifications
export async function listNotifications(user: User, { limit, skip }: Pagination) {
  const filter = { userId: user._id };

  const [items, total] = await Promise.all([
    Notification.find(filter)
      .sort({ createdAt: -1, _id: -1 })
      .skip(skip)
      .limit(limit)
      .populate("actorId", ACTOR_FIELDS)
      .populate("issue", ISSUE_FIELDS),
    Notification.countDocuments(filter),
  ]);

  return { items, total };
}

// GET /notifications/unread-count
export function countUnread(user: User): Promise<number> {
  return Notification.countDocuments({ userId: user._id, read: false });
}

// PATCH /notifications/:id/read
export async function markAsRead(user: User, notificationId: Types.ObjectId | string) {
  const notification = await Notification.findOne({ _id: notificationId, userId: user._id });

  if (!notification) {
    throw new AppError(
      NOTIFICATION_ERRORS.NOT_FOUND.message,
      NOTIFICATION_ERRORS.NOT_FOUND.statusCode,
    );
  }

  if (!notification.read) {
    notification.read = true;
    await notification.save();
  }

  return notification;
}

// PATCH /notifications/read-all
export async function markAllAsRead(user: User): Promise<number> {
  const result = await Notification.updateMany(
    { userId: user._id, read: false },
    { $set: { read: true } },
  );

  return result.modifiedCount;
}
