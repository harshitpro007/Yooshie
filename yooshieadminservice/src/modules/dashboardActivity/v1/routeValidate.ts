import { REGEX } from "@config/constant";
import Joi = require("joi");

export const AddDashboardLog = Joi.object({
  userId: Joi.string().trim().regex(REGEX.MONGO_ID).optional(),
  assistantId: Joi.string().trim().optional(),
  actionType: Joi.string().trim().optional(),
  userType: Joi.number().optional(),
});
