import { CONTENT_STATUS, CONTENT_TYPE, REGEX, THEME } from "@config/constant";
import Joi = require("joi");

export const contentDetails = Joi.object({
  type: Joi.string()
    .trim()
    .valid(...Object.values(CONTENT_TYPE).filter((v) => v !== CONTENT_TYPE.FAQ))
    .required(),
});

export const getContent = Joi.object({
  type: Joi.string()
    .trim()
    .valid(...Object.values(CONTENT_TYPE).filter((v) => v !== CONTENT_TYPE.FAQ))
    .required(),
  theme: Joi.string()
    .trim()
    .optional()
    .valid(THEME.DARK, THEME.LIGHT)
    .description("DARK or LIGHT"),
});

export const editContent = Joi.object({
  data: Joi.string().trim().optional(),
  type: Joi.string()
    .trim()
    .valid(...Object.values(CONTENT_TYPE).filter((v) => v !== CONTENT_TYPE.FAQ))
    .required(),
  imageAndContent: Joi.array().optional(),
  messageType: Joi.string()
    .optional()
    .valid("ADD", "EDIT")
    .description("add, edit"),
});

export const viewContent = Joi.object({
  type: Joi.string()
    .trim()
    .valid(...Object.values(CONTENT_TYPE))
    .required(),
});

export const addFaq = Joi.object({
  // position: Joi.number().required(),
  question: Joi.string().trim().required(),
  answer: Joi.string().trim().required(),
});

export const faqList = Joi.object({
  pageNo: Joi.number().required().description("Page no"),
  limit: Joi.number().required().description("limit"),
  sortBy: Joi.string()
    .trim()
    .valid("created", "position")
    .optional()
    .description("created, position"),
  sortOrder: Joi.number()
    .optional()
    .valid(1, -1)
    .description("1 for asc, -1 for desc"),
  status: Joi.string()
    .trim()
    .valid(CONTENT_STATUS.UN_BLOCKED, CONTENT_STATUS.BLOCKED)
    .optional(),
  searchKey: Joi.string().optional().description("Search by question"),
});

export const faqDetails = Joi.object({
  pageNo: Joi.number().required().description("Page no"),
  limit: Joi.number().required().description("limit"),
  status: Joi.string().trim().valid(CONTENT_STATUS.UN_BLOCKED).optional(),
  theme: Joi.string()
    .trim()
    .required()
    .valid(THEME.DARK, THEME.LIGHT)
    .description("DARK or LIGHT"),
});

export const editFaq = Joi.object({
  faqId: Joi.string().trim().regex(REGEX.MONGO_ID).required(),
  // position: Joi.number().optional(),
  question: Joi.string().trim().optional(),
  answer: Joi.string().trim().optional(),
  status: Joi.string()
    .trim()
    .valid(CONTENT_STATUS.UN_BLOCKED, CONTENT_STATUS.BLOCKED)
    .required(),
});

export const faq = Joi.object({
  faqId: Joi.string().trim().regex(REGEX.MONGO_ID).required(),
});
