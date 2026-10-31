import { Router } from "express";

import { requireAuth } from "../middlewares/requireAuth.ts";
import { validate } from "../middlewares/validate.ts";
import {
  getUnreadCount,
  listNotifications,
  markAllAsRead,
  markAsRead,
} from "../controllers/notification.controller.ts";
import {
  listNotificationsQuerySchema,
  notificationIdParamsSchema,
} from "./notification.schemas.ts";

export const notificationRoutes = Router();

notificationRoutes.use(requireAuth);

notificationRoutes.get("/", validate({ query: listNotificationsQuerySchema }), listNotifications);
notificationRoutes.get("/unread-count", getUnreadCount);
notificationRoutes.patch("/read-all", markAllAsRead);
notificationRoutes.patch("/:id/read", validate({ params: notificationIdParamsSchema }), markAsRead);
