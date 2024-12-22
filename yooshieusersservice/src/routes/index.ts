"use strict";

/**
 * v1 routes
 */

// admin routes
import { userRoute as userRouteV1 } from "@modules/user/v1/UserRoute";

import { rewardRoute as rewardRouteV1 } from "@modules/reward/v1/rewardRoute";

import { contactRoute as contactRouteV1 } from "@modules/contacts/v1/contactRoutes";

export const routes: any = [...userRouteV1, ...rewardRouteV1, ...contactRouteV1];
