import {
  NOTIFICATION_TYPE,
  REGEX,
  USER_TYPE,
  VALIDATION_MESSAGE,
} from "@config/index";
import Joi = require("joi");

export const emailTemplate = Joi.object({
  type: Joi.string().trim().required(),
  email: Joi.string()
    .trim()
    .lowercase()
    // .email({ minDomainSegments: 2 })
    .regex(REGEX.EMAIL)
    .optional()
    .messages({
      "string.pattern.base": VALIDATION_MESSAGE.email.pattern,
    }),
  name: Joi.string().trim().optional(),
  link: Joi.string().trim().optional(),
  otp: Joi.string().trim().optional(),
  password: Joi.string().trim().optional(),
  assistantEmail: Joi.string().trim().optional(),
  mobileNo: Joi.string().trim().optional(),
  assistantName: Joi.string().trim().optional(),
});

export const sendNotification = Joi.object({
  notificationId: Joi.string().trim().regex(REGEX.MONGO_ID).optional(),
  receiverId: Joi.array().items().optional().description("Receiver ID"),
  type: Joi.string()
    .trim()
    .valid(...Object.values(NOTIFICATION_TYPE))
    .optional(),
  userType: Joi.string()
    .trim()
    .valid(...Object.values(USER_TYPE))
    .optional(),
  title: Joi.string().trim().optional().description("Notification Title"),
  body: Joi.string().trim().optional().description("Notificaion Body"),
  message: Joi.string().trim().optional().description("Notificaiton Message"),
  details: Joi.object().optional(),
});

export const sendMessage = Joi.object({
  fullMobileNo: Joi.string().trim().required(),
});

export const readNotification = Joi.object({
  notificationId: Joi.string().trim().regex(REGEX.MONGO_ID).optional(),
});

export const notificationDetails = Joi.object({
  notificationId: Joi.string().trim().regex(REGEX.MONGO_ID).required(),
});

export const notificationList = Joi.object({
  pageNo: Joi.number().required().description("Page no"),
  limit: Joi.number().required().description("limit"),
  searchKey: Joi.string().allow("").optional().description("Search by title"),
  sortBy: Joi.string()
    .trim()
    .valid("created")
    .optional()
    .description("Sort by created"),
  sortOrder: Joi.number()
    .valid(1, -1)
    .optional()
    .description("1 for asc, -1 for desc"),
  fromDate: Joi.number().optional().description("in timestamp"),
  toDate: Joi.number().optional().description("in timestamp"),
});
