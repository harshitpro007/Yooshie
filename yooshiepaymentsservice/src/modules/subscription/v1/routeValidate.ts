import { REGEX } from "@config/constant";
import Joi = require("joi");

export const verifyIosToken = Joi.object({
    receipt: Joi.string().trim().required(),
    deviceId: Joi.string().trim(),
});

export const verifyAndroidToken = Joi.object({
    receipt: Joi.string().trim().required(),
    basePlanId: Joi.string().trim().required(),
    subscriptionId: Joi.string().trim().required(),
    deviceId: Joi.string().trim(),
})

export const subscriptionHistory = Joi.object({
    pageNo: Joi.number().required().description("Page no"),
    limit: Joi.number().required().description("limit"),
    userId: Joi.string().trim().regex(REGEX.MONGO_ID).required().description("user id"),
});

export const subscribedUserListing = Joi.object({
    match: Joi.string().trim().required(),
})