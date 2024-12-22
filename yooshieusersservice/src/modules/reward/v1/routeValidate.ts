import { REGEX } from "@config/constant";
import Joi = require("joi");

// Validator for fetching reward history (No payload needed, only headers for authentication)
export const rewardHistory = Joi.object({
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
  eventType: Joi.string()
    .valid("REWARD_HISTORY", "PURCHASE_HISTORY")
    .trim()
    .optional(),
  userId: Joi.string().trim().regex(REGEX.MONGO_ID).optional(),
});

// Validator for completing a goal
export const completeGoal = Joi.object({
  goalId: Joi.string().trim().regex(REGEX.MONGO_ID).required(), // Valid MongoDB ObjectId for goal
  userId: Joi.string().trim().regex(REGEX.MONGO_ID).optional(),
});

// Validator for completing a task
export const completeTask = Joi.object({
  taskId: Joi.string().trim().regex(REGEX.MONGO_ID).required(), // Valid MongoDB ObjectId for task
  userId: Joi.string().trim().regex(REGEX.MONGO_ID).optional(),
});

// Validator for meeting a budget
export const budgetMet = Joi.object({
  budgetId: Joi.string().trim().regex(REGEX.MONGO_ID).required(), // Valid MongoDB ObjectId for budget
  userId: Joi.string().trim().regex(REGEX.MONGO_ID).optional(),
});

export const purchaseGiftCard = Joi.object({
  userId: Joi.string().trim().regex(REGEX.MONGO_ID).optional(), // Valid MongoDB ObjectId for user

  giftCardCode: Joi.string().trim().required(), // Gift card code is required

  image: Joi.string().trim().required(), // Gift card code is required

  giftCardName: Joi.string().trim().required(), // Gift card name is required

  totalPoints: Joi.number().integer().min(0).required(), // Total points (non-negative integer) are required

  pointsUsed: Joi.number().integer().min(0).required(), // Total points (non-negative integer) are required

  actualMoneyUsed: Joi.number().positive().required(), // Positive actual price in USD is required
});
