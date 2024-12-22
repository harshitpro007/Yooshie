import {
  GOAL_CATEGORY,
  GOAL_TYPE,
  REGEX,
  STATUS,
  TIME_TYPE,
  VALIDATION_MESSAGE,
} from "@config/index";
import Joi = require("joi");

export const userListing = Joi.object({
  pageNo: Joi.number().min(1).required(),
  limit: Joi.number().min(1).required(),
  searchKey: Joi.string()
    .allow("")
    .optional()
    .description("Search by name, email"),
  sortBy: Joi.string()
    .trim()
    .valid("created")
    .optional()
    .description("Sort by created"),
  sortOrder: Joi.number()
    .valid(1, -1)
    .optional()
    .description("1 for asc, -1 for desc"),

  assistantId: Joi.string().trim().regex(REGEX.MONGO_ID).optional(),
  isSharedTask: Joi.boolean().optional(),
  userId: Joi.string().trim().regex(REGEX.MONGO_ID).optional(),
});

export const userDetail = Joi.object({
  userId: Joi.string().trim().regex(REGEX.MONGO_ID).required(),
});

export const taskList = Joi.object({
  pageNo: Joi.number().required().description("Page no"),
  limit: Joi.number().required().description("limit"),
  userId: Joi.string().trim().regex(REGEX.MONGO_ID).required(),
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

export const getTask = Joi.object({
  id: Joi.string().trim().regex(REGEX.MONGO_ID).required(),
});

export const AddTask = Joi.object({
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

export const GoalListing = Joi.object({
  pageNo: Joi.number().required().description("Page no"),
  limit: Joi.number().required().description("limit"),
  userId: Joi.string().trim().regex(REGEX.MONGO_ID).required(),
  sortBy: Joi.string()
    .trim()
    .valid("created", "updatedAt")
    .optional()
    .description("created,updatedAt"),
  sortOrder: Joi.number()
    .optional()
    .valid(1, -1)
    .description("1 for asc, -1 for desc"),
  status: Joi.string()
    .trim()
    .optional()
    .valid(STATUS.PENDING, STATUS.COMPLETED),
});

export const addGoal = Joi.object({
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
  totalDaysToGoal: Joi.number().required(),
  completedGoal: Joi.number().required(),
  goalType: Joi.string()
    .trim()
    .valid(...Object.values(GOAL_TYPE))
    .required(),
  category: Joi.string()
    .trim()
    .valid(...Object.values(GOAL_CATEGORY))
    .required(),
});

export const editGoal = Joi.object({
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
  totalDaysToGoal: Joi.number().optional(),
  completedGoal: Joi.number().optional(),
  goalType: Joi.string()
    .trim()
    .valid(...Object.values(GOAL_TYPE))
    .optional(),
  category: Joi.string()
    .trim()
    .valid(...Object.values(GOAL_CATEGORY))
    .optional(),
});

export const goalDetails = Joi.object({
  id: Joi.string().trim().regex(REGEX.MONGO_ID).required(),
});

export const addReminder = Joi.object({
  userId: Joi.string().trim().regex(REGEX.MONGO_ID).required(),
  title: Joi.string().trim().required(),
  description: Joi.string().trim().optional().allow(""),
  reminderDate: Joi.number().required(),
});

export const editReminder = Joi.object({
  id: Joi.string().trim().regex(REGEX.MONGO_ID).required(),
  title: Joi.string().trim().optional(),
  description: Joi.string().trim().optional().allow(""),
  status: Joi.string().optional().valid(STATUS.COMPLETED),
  reminderDate: Joi.number().optional(),
});

export const ReminderListing = Joi.object({
  pageNo: Joi.number().required().description("Page no"),
  limit: Joi.number().required().description("limit"),
  userId: Joi.string().trim().regex(REGEX.MONGO_ID).required(),
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

export const BudgetListing = Joi.object({
  pageNo: Joi.number().required().description("Page no"),
  limit: Joi.number().required().description("limit"),
  userId: Joi.string().trim().regex(REGEX.MONGO_ID).required(),
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

export const budgetDetails = Joi.object({
  id: Joi.string().trim().regex(REGEX.MONGO_ID).required(),
});
