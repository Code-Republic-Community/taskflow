import type { Request, RequestHandler } from "express";

import * as notificationService from "../services/notification.service.ts";
import { AppError } from "../utils/AppError.ts";
import { parsePagination } from "../utils/pagination.ts";
import { NOTIFICATION_ERRORS } from "../constants/notification.constants.ts";

import type { User } from "../types/auth.types.ts";
import type { NotificationIdParams } from "../routes/notification.schemas.ts";

// The check is still needed so TypeScript knows req.user is not undefined.
function getUser(req: Request): User {
  const user = req.user;
  if (!user) {
    throw new AppError(
      NOTIFICATION_ERRORS.NOT_AUTHENTICATED.message,
      NOTIFICATION_ERRORS.NOT_AUTHENTICATED.statusCode,
    );
  }
  return user;
}

export const listNotifications: RequestHandler = async (req, res) => {
  const user = getUser(req);
  const pagination = parsePagination(req.query);

  const { items, total } = await notificationService.listNotifications(user, pagination);

  res.status(200).json({
    data: items,
    meta: { page: pagination.page, limit: pagination.limit, total },
  });
};

export const getUnreadCount: RequestHandler = async (req, res) => {
  const user = getUser(req);
  const count = await notificationService.countUnread(user);

  res.status(200).json({ data: { count } });
};

export const markAsRead: RequestHandler = async (req, res) => {
  const user = getUser(req);
  const { id } = req.params as NotificationIdParams;
  const notification = await notificationService.markAsRead(user, id);

  res.status(200).json({ data: notification });
};

export const markAllAsRead: RequestHandler = async (req, res) => {
  const user = getUser(req);
  const updated = await notificationService.markAllAsRead(user);

  res.status(200).json({ data: { updated } });
};
