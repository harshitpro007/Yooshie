import { REGEX, STATUS } from "@config/constant";
import Joi = require("joi");

export const addCalender = Joi.object({
  userId: Joi.string().trim().regex(REGEX.MONGO_ID).required(),
  source: Joi.string().trim().required().valid("GOOGLE", "APPLE"),
  events: Joi.array()
    .min(1)
    .required()
    .items(
      Joi.object({
        title: Joi.string().trim().required(),
        description: Joi.string().trim().optional().allow(""),
        eventDate: Joi.number().required(),
      })
    ),
});
