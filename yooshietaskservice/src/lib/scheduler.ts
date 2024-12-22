"use strict";

import * as cron from "node-schedule";
import { logger } from "@lib/logger";
import { task } from "@modules/tasks/taskModel";
import { goal } from "@modules/goals/goallModel";
import { reminder } from "@modules/reminder/reminderModel";
import { budget } from "@modules/budget/budgetModel";
import { users } from "@modules/user/userModel";
import { DB_MODEL_REF, NOTIFICATION_TYPE, USER_TYPE } from "@config/constant";
import { SERVER } from "@config/environment";
import { axiosService } from "./axiosService";
import { baseDao } from "@modules/baseDao";

// Helper function to get the start and end of the day
const getStartAndEndOfDay = (
  date: Date
): { startOfDay: Date; endOfDay: Date } => {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  return { startOfDay, endOfDay };
};

// Helper function to fetch items based on model, date field, and status
const fetchItems = async (
  model: any,
  dateField: string,
  startOfDay: Date,
  endOfDay: Date,
  status: string
) => {
  try {
    return await model.find({
      [dateField]: { $gte: startOfDay, $lte: endOfDay },
      status: status,
    });
  } catch (error) {
    logger.error(
      `Error fetching ${status} items for model ${model.modelName}:`,
      error
    );
    throw error;
  }
};

// Reusable function to send notifications for a list of items
const sendNotifications = async (items: any[], type: string) => {
  const userModel:any = DB_MODEL_REF.USER;
  const batchSize = 10; // Adjust batch size as needed
  const chunkedItems = chunkArray(items, batchSize); // Split items into smaller batches

  for (const batch of chunkedItems) {
    const promises = batch.map(async (item) => {
      try {
        const userId = item.userId;
        if (userId) {
          const userDetails = await baseDao.findOne(userModel, {_id: userId}, {name:1, assistantId:1});
          const sendNotificationData = {
            type: type,
            receiverId: [userId],
            userType: USER_TYPE.USER,
            details: {
              senderId: "",
              title: item.title,
              itemId: item._id,
              type: type,
            },
          };

          // Send notification asynchronously
          await axiosService.post({
            url:
              process.env.NOTIFICATION_APP_URL + SERVER.SEND_NOTIFICATION_CRON,
            body: sendNotificationData,
          });

          if(userDetails.assistantId){
            const sendNotificationData = {
              type: type,
              receiverId: [userDetails.assistantId],
              userType: USER_TYPE.ASSISTANT,
              details: {
                senderId: "",
                title: item.title,
                clientName: userDetails.name,
                itemId: item._id,
                type: type,
              },
            };
  
            // Send notification asynchronously
            await axiosService.post({
              url:
                process.env.NOTIFICATION_APP_URL + SERVER.SEND_NOTIFICATION_CRON,
              body: sendNotificationData,
            });
          }

          logger.info(`Notification sent to user: ${userId} for ${type}`);
        }
      } catch (error) {
        logger.error("Error sending notification", error);
      }
    });

    // Wait for all notifications in this batch to complete before moving to the next batch
    await Promise.all(promises);
  }
};

const chunkArray = (array: any[], size: number) => {
  const result = [];
  for (let i = 0; i < array.length; i += size) {
    result.push(array.slice(i, i + size));
  }
  return result;
};

// Consolidated SchedulerController class
class SchedulerController {
  private models = {
    tasks: { model: task, dateField: "taskDate" },
    goals: { model: goal, dateField: "endDate" },
    reminders: { model: reminder, dateField: "reminderDate" },
    budgets: { model: budget, dateField: "endDate" },
  };

  // Method to handle all notifications in one job
  public async notifyItemsForTheDay() {
    try {
      logger.info("Starting daily notification checks...");

      const today = new Date();
      const { startOfDay, endOfDay } = getStartAndEndOfDay(today);

      // Calculate yesterday's date and get start and end
      const yesterday = new Date(today);
      yesterday.setDate(today.getDate() - 1); // Set to the previous day
      const { startOfDay: startOfYesterday, endOfDay: endOfYesterday } =
        getStartAndEndOfDay(yesterday);

      // Calculate tomorrow's date and get start and end
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1); // Set to the next day
      const { startOfDay: startOfTomorrow, endOfDay: endOfTomorrow } =
        getStartAndEndOfDay(tomorrow);

      // Loop through models (tasks, goals, reminders, budgets)
      for (const [type, { model, dateField }] of Object.entries(this.models)) {
        logger.info(
          `Checking ${type} for today, overdue, and upcoming notifications...`
        );

        // Fetch overdue items (items with end date less than yesterday)
        const overdueItems = await fetchItems(
          model,
          dateField,
          startOfYesterday,
          endOfYesterday,
          "PENDING"
        );

        // Fetch upcoming items (items with end date after tomorrow)
        const upcomingItems = await fetchItems(
          model,
          dateField,
          startOfTomorrow,
          endOfTomorrow,
          "PENDING"
        );

        // Fetch today's items
        const todayItems = await fetchItems(
          model,
          dateField,
          startOfDay,
          endOfDay,
          "PENDING"
        );

        // Send notifications for each group
        await sendNotifications(overdueItems, `OVERDUE_${type.toUpperCase()}`);
        await sendNotifications(
          upcomingItems,
          `UPCOMING_${type.toUpperCase()}`
        );
        await sendNotifications(todayItems, `TODAY_${type.toUpperCase()}`);
      }

      logger.info("Daily notification checks completed.");
    } catch (error) {
      logger.error("Error in daily notification checks:", error);
    }
  }

  // Initialize cron job to run the function once per day
  public init() {
    logger.info("Initializing daily notification cron job...");

    // cron.scheduleJob("* * * * *", () => this.notifyItemsForTheDay()); // Runs every minute

    // Schedule a single cron job to run once per day at midnight
    cron.scheduleJob("0 11 * * *", () => this.notifyItemsForTheDay()); // Runs every day at midnight (00:00)

    logger.info("Cron job initialized successfully.");
  }
}

export const schedulerController = new SchedulerController();
