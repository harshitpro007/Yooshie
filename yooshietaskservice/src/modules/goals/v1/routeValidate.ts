import { GOAL_CATEGORY, REGEX, STATUS, TIME_TYPE } from "@config/constant";
import Joi = require("joi");

export const goal = Joi.object({
  id: Joi.string().trim().regex(REGEX.MONGO_ID).required(),
});

export const editGoal = Joi.object({
  id: Joi.string().trim().regex(REGEX.MONGO_ID).required(),
  title: Joi.string().trim().optional(),
  description: Joi.string().trim().optional().allow(""),
  status: Joi.string().optional().valid(STATUS.COMPLETED),
  startDate: Joi.number().optional().greater(Date.now()).messages({
    "number.greater": "Start date must be in the future.",
  }),
  endDate: Joi.number()
    .optional()
    .when("startDate", {
      is: Joi.exist(),
      then: Joi.number().greater(Joi.ref("startDate")).messages({
        "number.greater": "End date must be greater than start date.",
      }),
    }),
  totalDaysToGoal: Joi.number().optional(),
  completedGoal: Joi.number().optional(),
  goalType: Joi.string()
    .trim()
    .valid(...Object.values(TIME_TYPE))
    .optional(),
  category: Joi.string()
    .trim()
    .valid(...Object.values(GOAL_CATEGORY))
    .optional(),
});

export const addGoal = Joi.object({
  userId: Joi.string().trim().regex(REGEX.MONGO_ID).required(),
  title: Joi.string().trim().required(),
  description: Joi.string().trim().optional().allow(""),
  startDate: Joi.number().required().greater(Date.now()).messages({
    "number.greater": "Start date must be in the future.",
  }),
  endDate: Joi.number()
    .required()
    .when("startDate", {
      is: Joi.exist(),
      then: Joi.number().greater(Joi.ref("startDate")).messages({
        "number.greater": "End date must be greater than start date.",
      }),
    }),
  totalDaysToGoal: Joi.number().required(),
  completedGoal: Joi.number().required(),
  goalType: Joi.string()
    .trim()
    .valid(...Object.values(TIME_TYPE))
    .required(),
  category: Joi.string()
    .trim()
    .valid(...Object.values(GOAL_CATEGORY))
    .required(),
});

export const goalList = Joi.object({
  pageNo: Joi.number().required().description("Page no"),
  limit: Joi.number().required().description("limit"),
  userId: Joi.string().optional(),
  sortBy: Joi.string()
    .trim()
    .valid("created", "startDate", "endDate", "updatedAt")
    .optional()
    .description("created,updatedAt"),
  sortOrder: Joi.number()
    .optional()
    .valid(1, -1)
    .description("1 for asc, -1 for desc"),
  status: Joi.string()
    .trim()
    .optional()
    .valid(STATUS.PENDING, STATUS.COMPLETED),
});
