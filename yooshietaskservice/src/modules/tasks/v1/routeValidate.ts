import { REGEX, STATUS, VALIDATION_MESSAGE } from "@config/constant";
import Joi = require("joi");

export const task = Joi.object({
  id: Joi.string().trim().regex(REGEX.MONGO_ID).required(),
});

export const editTask = Joi.object({
  id: Joi.string().trim().regex(REGEX.MONGO_ID).required(),
  title: Joi.string().trim().optional(),
  description: Joi.string().trim().optional().allow(""),
  status: Joi.string().optional().valid(STATUS.COMPLETED),
  taskDate: Joi.number()
    .optional()
    .greater(Date.now())
    .messages({ "number.greater": VALIDATION_MESSAGE.date }),
  shareTaskUser: Joi.object({
    userName: Joi.string().optional(),
    userId: Joi.string().trim().regex(REGEX.MONGO_ID).optional(),
    email: Joi.string()
      .trim()
      .lowercase()
      // .email({ minDomainSegments: 2 })
      .regex(REGEX.EMAIL)
      .optional()
      .messages({
        "string.pattern.base": VALIDATION_MESSAGE.email.pattern,
      }),
    profilePicture: Joi.string().optional(),
  })
    .optional()
    .allow(""),
  isTaskShared: Joi.boolean().optional(),
});

export const addTask = Joi.object({
  userId: Joi.string().trim().regex(REGEX.MONGO_ID).required(),
  title: Joi.string().trim().required(),
  description: Joi.string().trim().optional().allow(""),
  taskDate: Joi.number()
    .required()
    .greater(Date.now())
    .messages({ "number.greater": VALIDATION_MESSAGE.date }),
  shareTaskUser: Joi.object({
    userName: Joi.string().optional(),
    userId: Joi.string().trim().regex(REGEX.MONGO_ID).required(),
    email: Joi.string()
      .trim()
      .lowercase()
      // .email({ minDomainSegments: 2 })
      .regex(REGEX.EMAIL)
      .optional()
      .messages({
        "string.pattern.base": VALIDATION_MESSAGE.email.pattern,
      }),
    profilePicture: Joi.string().optional(),
  }).optional(),
});

export const taskListing = Joi.object({
  pageNo: Joi.number().required().description("Page no"),
  limit: Joi.number().required().description("limit"),
  userId: Joi.string().trim().regex(REGEX.MONGO_ID).optional(),
  sortBy: Joi.string()
    .trim()
    .valid("created", "position", "updatedAt")
    .optional()
    .description("created, position, updatedAt"),
  sortOrder: Joi.number()
    .optional()
    .valid(1, -1)
    .description("1 for asc, -1 for desc"),
  status: Joi.string()
    .trim()
    .optional()
    .valid(STATUS.PENDING, STATUS.COMPLETED),
});

export const calender = Joi.object({
  userId: Joi.string().trim().regex(REGEX.MONGO_ID).optional(),
  startDate: Joi.number().required().description("from date in timestamp"),
  endDate: Joi.number().optional().description("to date"),
});
