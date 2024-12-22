"use strict";

/**
 * v1 routes
 */

// admin routes
// category routes
// import { categoryRoute as categoryRouteV1 } from "@modules/category/v1/categoryRoute";
import { chatRoute as chatRouteV1 } from "@modules/chat/v1/chatRoute";
import { vonageRoute as vonageRouteV1 } from "@modules/vonage/route"


export const routes: any = [
	...chatRouteV1,
	...vonageRouteV1
	// ...categoryRouteV1,
];