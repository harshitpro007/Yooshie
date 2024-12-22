import { REGEX, VALIDATION_CRITERIA, VALIDATION_MESSAGE, DEVICE_TYPE } from "@config/constant";
import { SERVER } from "@config/environment";
import Joi = require("joi");

export const login = Joi.object({
    email: Joi.string()
        .trim()
        .lowercase()
        // .email({ minDomainSegments: 2 })
        .regex(REGEX.EMAIL)
        .required(),
    password: Joi.string()
        .trim()
        .regex(REGEX.PASSWORD)
        .min(VALIDATION_CRITERIA.PASSWORD_MIN_LENGTH)
        .max(VALIDATION_CRITERIA.PASSWORD_MAX_LENGTH)
        .default(SERVER.DEFAULT_PASSWORD)
        .required()
        .messages({
            "string.pattern.base": VALIDATION_MESSAGE.password.pattern,
            "string.min": VALIDATION_MESSAGE.password.minlength,
            "string.max": VALIDATION_MESSAGE.password.maxlength,
            "string.empty": VALIDATION_MESSAGE.password.required,
            "any.required": VALIDATION_MESSAGE.password.required
        }),
    deviceId: Joi.string().trim().required(),
    platform: Joi.string().required().valid(DEVICE_TYPE.WEB),
    deviceToken: Joi.string().optional()
})

export const forgotPassword = Joi.object({
    email: Joi.string()
        .trim()
        .lowercase()
        // .email({ minDomainSegments: 2 })
        .regex(REGEX.EMAIL)
        .required()
        .messages({
            "string.pattern.base": VALIDATION_MESSAGE.email.pattern
        })
})

export const resetPassword = Joi.object({
    token: Joi.string()
        .required(),
    password: Joi.string()
        .trim()
        .regex(REGEX.PASSWORD)
        .min(VALIDATION_CRITERIA.PASSWORD_MIN_LENGTH)
        .max(VALIDATION_CRITERIA.PASSWORD_MAX_LENGTH)
        .default(SERVER.DEFAULT_PASSWORD)
        .required()
        .messages({
            "string.pattern.base": VALIDATION_MESSAGE.password.pattern,
            "string.min": VALIDATION_MESSAGE.password.minlength,
            "string.max": VALIDATION_MESSAGE.password.maxlength,
            "string.empty": VALIDATION_MESSAGE.password.required,
            "any.required": VALIDATION_MESSAGE.password.required
        })
})

export const changePassword = Joi.object({
    oldPassword: Joi.string()
        .trim()
        .min(VALIDATION_CRITERIA.PASSWORD_MIN_LENGTH)
        .max(VALIDATION_CRITERIA.PASSWORD_MAX_LENGTH)
        .default(SERVER.DEFAULT_PASSWORD)
        .required(),
    password: Joi.string()
        .trim()
        .regex(REGEX.PASSWORD)
        .min(VALIDATION_CRITERIA.PASSWORD_MIN_LENGTH)
        .max(VALIDATION_CRITERIA.PASSWORD_MAX_LENGTH)
        .default(SERVER.DEFAULT_PASSWORD)
        .required()
        .messages({
            "string.pattern.base": VALIDATION_MESSAGE.password.pattern,
            "string.min": VALIDATION_MESSAGE.password.minlength,
            "string.max": VALIDATION_MESSAGE.password.maxlength,
            "string.empty": VALIDATION_MESSAGE.password.required,
            "any.required": VALIDATION_MESSAGE.password.required
        })
})

export const editProfile = Joi.object({
    profilePicture: Joi.string().trim().optional().allow(""),
    name: Joi.string()
        .trim()
        .min(VALIDATION_CRITERIA.NAME_MIN_LENGTH)
        .optional(),
    countryCode: Joi.string().optional().allow(""),
    mobileNo: Joi.string()
        .trim()
        .regex(REGEX.MOBILE_NUMBER)
        .optional()
        .messages({
            "string.pattern.base": VALIDATION_MESSAGE.mobileNo.pattern,
        })
        .allow(""),
})

export const preSignedURL = Joi.object({
    filename: Joi.string().trim().required().description('FileName'),
    fileType: Joi.string().trim().required().description('File Type of filename'),
})