import { z } from "zod";
import { NOTIFICATION_ERRORS } from "../constants/notification.constants.ts";

export const notificationIdParamsSchema = z.object({
  id: z.string().regex(/^[0-9a-fA-F]{24}$/, NOTIFICATION_ERRORS.INVALID_ID.message),
});

export const listNotificationsQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().optional(),
});

export type NotificationIdParams = z.infer<typeof notificationIdParamsSchema>;
