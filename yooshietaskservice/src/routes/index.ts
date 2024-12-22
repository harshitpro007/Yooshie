"use strict";

/**
 * v1 routes
 */

import { taskRoute as taskRouteV1 } from "@modules/tasks/v1/taskRoute";
import { reminderRoute as reminderRouteV1 } from "@modules/reminder/v1/reminderRoute";
import { goalRoute as goalRouteV1 } from "@modules/goals/v1/goalRoute";
import { budgetRoute as budgetRouteV1 } from "@modules/budget/v1/budgetRoute";
import { calendarRoute as calendarRouteV1 } from "@modules/calender/v1/calenderRoute";

export const routes: any = [
  ...taskRouteV1,
  ...reminderRouteV1,
  ...goalRouteV1,
  ...budgetRouteV1,
  ...calendarRouteV1,
];
