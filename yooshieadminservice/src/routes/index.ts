"use strict";

/**
 * v1 routes
 */

// admin routes
import { adminRoute as adminRouteV1 } from "@modules/admin/v1/adminRoute";

import { assistantRoute as assistantRouteV1 } from "@modules/assistant/v1/assistantRoute";

import { contentRoute as contentRouteV1 } from "@modules/content/v1/contentRoute";

import { userRoute as userRouteV1 } from "@modules/user/v1/UserRoute";

import { notificationRoute as notificationRouteV1 } from "@modules/notification/v1/notificationRoute";

import { dashboardRoute as dashboardRouteV1 } from "@modules/dashboardActivity/v1/dashboardActivityRoute";

export const routes: any = [
  ...adminRouteV1,
  ...contentRouteV1,
  ...assistantRouteV1,
  ...userRouteV1,
  ...notificationRouteV1,
  ...dashboardRouteV1,
];
