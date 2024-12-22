import { MESSAGE_TYPE, REGEX, STATUS } from "@config/constant";
import Joi = require("joi");

export const chatListing = Joi.object({
    pageNo: Joi.number().optional().description("Page no"),
    limit: Joi.number().optional().description("limit"),
    searchKey: Joi.string().optional().description("Search by message"),
    sortBy: Joi.string().trim().valid("created").optional().description("created"),
    sortOrder: Joi.number().optional().valid(1, -1).description("1 for asc, -1 for desc"),
    status: Joi.string()
        .trim()
        .optional()
        .valid(STATUS.ACTIVE, STATUS.ARCHIVED)
        .default(STATUS.ACTIVE)
});

export const messageListing = Joi.object({
    chatId: Joi.string().trim().required().regex(REGEX.MONGO_ID),
    pageNo: Joi.number().required().description("Page no"),
    limit: Joi.number().required().description("limit"),
    searchKey: Joi.string().optional().description("Search by message")
});

export const chatProfile = Joi.object({
    contactUserId: Joi.string().trim().regex(REGEX.MONGO_ID).required(),
    pageNo: Joi.number().optional().description("Page no").default(1),
    limit: Joi.number().optional().description("limit").default(10),
    sortBy: Joi.string().trim().valid("created").optional().description("created"),
    sortOrder: Joi.number().optional().valid(1, -1).description("1 for asc, -1 for desc").default(-1),
    type: Joi.string()
        .trim()
        .optional()
        .valid(MESSAGE_TYPE.MEDIA, MESSAGE_TYPE.LINK, MESSAGE_TYPE.DOCS)
        .default(MESSAGE_TYPE.MEDIA)
});

export const groupDetails = Joi.object({
    groupId: Joi.string().trim().regex(REGEX.MONGO_ID).required()
});

export const payload = Joi.object();