"use strict";

/**
 * v1 routes
 */

// notification routes
import { notificationRoute as notificationRouteV1 } from "@modules/notification/v1/notificationRoute";

export const routes: any = [
	...notificationRouteV1,
];