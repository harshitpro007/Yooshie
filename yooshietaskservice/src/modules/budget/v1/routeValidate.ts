import { REGEX, STATUS, TIME_TYPE } from "@config/constant";
import Joi = require("joi");

export const budget = Joi.object({
  id: Joi.string().trim().regex(REGEX.MONGO_ID).required(),
});

export const editBudget = Joi.object({
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
  totalBudget: Joi.number().optional(),
  amountAdded: Joi.number().optional(),
  paymentLink: Joi.string().optional(),
  budgetType: Joi.string()
    .trim()
    .valid(...Object.values(TIME_TYPE))
    .optional(),
});

export const addBudget = Joi.object({
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
  totalBudget: Joi.number().required(),
  amountAdded: Joi.number().required(),
  paymentLink: Joi.string().required(),
  budgetType: Joi.string()
    .trim()
    .valid(...Object.values(TIME_TYPE))
    .required(),
});

export const budgetList = Joi.object({
  pageNo: Joi.number().required().description("Page no"),
  limit: Joi.number().required().description("limit"),
  userId: Joi.string().optional(),
  sortBy: Joi.string()
    .trim()
    .valid("created", "updatedAt")
    .optional()
    .description("created, updatedAt"),
  sortOrder: Joi.number()
    .optional()
    .valid(1, -1)
    .description("1 for asc, -1 for desc"),
  status: Joi.string()
    .trim()
    .optional()
    .valid(STATUS.PENDING, STATUS.COMPLETED),
});
