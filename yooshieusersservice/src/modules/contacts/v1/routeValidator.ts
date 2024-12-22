import { REGEX, VALIDATION_MESSAGE } from "@config/constant";
import Joi = require("joi");


export const addContact = Joi.object({
    name: Joi.string().trim().required(),
    email: Joi.string()
    .trim()
    .lowercase()
    .regex(REGEX.EMAIL)
    .required()
    .messages({
      "string.pattern.base": VALIDATION_MESSAGE.email.pattern,
    }),
    countryCode: Joi.string().trim().required(),
    mobileNo: Joi.string().trim().regex(REGEX.MOBILE_NUMBER).required().messages({
    "string.pattern.base": VALIDATION_MESSAGE.mobileNo.pattern,
    }),
})

export const editContact = Joi.object({
    contactId: Joi.string().trim().regex(REGEX.MONGO_ID).required(),
    name: Joi.string().trim().optional(),
    email: Joi.string()
    .trim()
    .lowercase()
    .regex(REGEX.EMAIL)
    .optional()
    .messages({
      "string.pattern.base": VALIDATION_MESSAGE.email.pattern,
    }),
    countryCode: Joi.string().trim().optional(),
    mobileNo: Joi.string().trim().regex(REGEX.MOBILE_NUMBER).optional().messages({
    "string.pattern.base": VALIDATION_MESSAGE.mobileNo.pattern,
    }),
})

export const deleteContact = Joi.object({
    contactId: Joi.string().trim().regex(REGEX.MONGO_ID).required(),
})

export const contactListing = Joi.object({
    pageNo: Joi.number().required().description("Page no"),
    limit: Joi.number().required().description("limit"),
    userId: Joi.string().trim().regex(REGEX.MONGO_ID).optional(),
})