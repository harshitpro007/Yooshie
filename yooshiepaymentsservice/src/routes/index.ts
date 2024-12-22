"use strict";

/**
 * v1 routes
 */

// admin routes
import { subscriptionRoute as subscriptionRouteV1 } from "@modules/subscription/v1/subscriptionRoute";
// category routes




export const routes: any = [

	...subscriptionRouteV1,
];