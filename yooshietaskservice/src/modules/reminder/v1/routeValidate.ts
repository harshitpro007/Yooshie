import { REGEX, STATUS } from "@config/constant";
import Joi = require("joi");

export const reminder = Joi.object({
    id: Joi.string().trim().regex(REGEX.MONGO_ID).required(),
})

export const editReminder = Joi.object({
    id: Joi.string().trim().regex(REGEX.MONGO_ID).required(),
    title: Joi.string().trim().optional(),
    description: Joi.string().trim().optional().allow(""),
    status: Joi.string().optional().valid(STATUS.COMPLETED),
    reminderDate: Joi.number().optional(),
})

export const addReminder = Joi.object({
    userId: Joi.string().trim().regex(REGEX.MONGO_ID).required(),
    title: Joi.string().trim().required(),
    description: Joi.string().trim().optional().allow(""),
    reminderDate: Joi.number().required(),
})

export const reminderListing = Joi.object({
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
    status: Joi.string().trim().optional().valid(STATUS.PENDING, STATUS.COMPLETED),
})