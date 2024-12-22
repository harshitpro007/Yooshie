import Joi = require("joi");
import { REGEX, USER_TYPE } from "../../../config/constant";

export const createNotification = Joi.object({
    title: Joi.string().required(),
    description: Joi.string().required(),
    userType: Joi.string().required().valid(USER_TYPE.ASSISTANT, USER_TYPE.ALL, USER_TYPE.USER),
})

export const notificationListing = Joi.object({
    pageNo: Joi.number().required().description("Page no"),
    limit: Joi.number().required().description("limit"),
    searchKey: Joi.string().allow("").optional().description("Search by title"),
    sortBy: Joi.string().trim().valid("created").optional().description("Sort by created"),
    sortOrder: Joi.number().valid(1, -1).optional().description("1 for asc, -1 for desc"),
})

export const deleteNotification = Joi.object({
    notificationId:Joi.string().regex(REGEX.MONGO_ID).trim().required(),
})

export const editNotification = Joi.object({
    title: Joi.string().optional(),
    description: Joi.string().optional(),
    userType: Joi.string().optional().valid(USER_TYPE.ASSISTANT, USER_TYPE.ALL, USER_TYPE.USER),
    notificationId:Joi.string().regex(REGEX.MONGO_ID).trim().required(),
})