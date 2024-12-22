"use strict";

import { BaseDao } from "@modules/baseDao/BaseDao";

import {
  DB_MODEL_REF,
  GEN_STATUS,
  MAX_DAILY_POINTS,
  REWARD_EVENTS,
  REWARD_MSG,
  STATUS,
} from "@config/constant";
import { getDateWithoutTime, isObjectId, toObjectId } from "@utils/appUtils";
const axios = require("axios");

export class RewardDao extends BaseDao {
  private rewardModel: any;
  private budgetModel: any;
  private goalModel: any;
  private taskModel: any;
  private rewardHistoryModel: any;

  constructor() {
    super();
    this.rewardModel = DB_MODEL_REF.REWARD;
    this.budgetModel = DB_MODEL_REF.BUDGET;
    this.goalModel = DB_MODEL_REF.GOAL;
    this.taskModel = DB_MODEL_REF.TASK;
    this.rewardHistoryModel = DB_MODEL_REF.REWARD_HISTORY;
  }

  /**
   * @function handleLogin
   */
  async handleLogin(userId) {
    try {
      const reward = await this.findOne(this.rewardModel, { userId });
      const today = new Date().setHours(0, 0, 0, 0);

      // Check if the user has already logged in today
      if (reward.lastLoginDate && reward.lastLoginDate === today) {
        return; // Already logged in today, no reward
      }

      // Update login date and streak
      let loginStreak = reward?.loginStreak ? reward.loginStreak + 1 : 1;
      let lastLoginDate = today;

      // Award 1 coin for login
      await this.updateRewardPoints(
        userId,
        1,
        REWARD_MSG.Daily_Check_In,
        REWARD_EVENTS.LOGIN
      );

      // Check if login streak reaches 7 days
      if (reward.loginStreak % 7 === 0) {
        await this.updateRewardPoints(
          userId,
          1,
          REWARD_MSG.Weekly_Login_Streak,
          REWARD_EVENTS.LOGIN
        ); // 1 extra coin for weekly streak
      }

      await this.updateOne(
        this.rewardModel,
        { userId },
        { loginStreak, lastLoginDate },
        {}
      );
    } catch (error) {
      console.log("Error in goal", error);
      throw error;
    }
  }

  async updateRewardPoints(userId, points, eventDescription, eventType) {
    try {
      let reward = await this.findOne(this.rewardModel, { userId });
      const today = getDateWithoutTime(Date.now()); // Get today's date without time

      // If no reward record exists, create a new one with initial values
      if (!reward) {
        reward = {
          userId,
          totalPoints: 0,
          dailyPoints: 0,
          goalsCompletedOnTime: 0,
          tasksCompletedOnTime: 0,
          loginStreak: 0,
          lastLoginDate: null,
          milestones: [],
          lastUpdated: today, // Last updated is set to today's date
        };
        await this.save(this.rewardModel, reward);
      }

      // Reset daily points if the day has changed
      if (reward.lastUpdated !== today) {
        reward.dailyPoints = 0;
        reward.lastUpdated = today;
      }

      // Check if adding the points would exceed the daily cap
      if (reward.dailyPoints + points > MAX_DAILY_POINTS) {
        const remainingPoints = MAX_DAILY_POINTS - reward.dailyPoints;
        reward.totalPoints += remainingPoints;
        reward.dailyPoints = MAX_DAILY_POINTS;
      } else {
        reward.totalPoints += points;
        reward.dailyPoints += points;
      }

      // Update the existing reward record
      await this.updateOne(this.rewardModel, { userId }, reward, {});
      // Log the reward event in the separate RewardHistory collection
      const historyEntry = {
        userId,
        event: eventDescription,
        points,
        date: new Date(),
        eventType,
      };
      await await this.save(this.rewardHistoryModel, historyEntry); // Save reward history entry

      // Update the user model with the new totalPoints
      await this.updateOne(
        "users",
        { _id: toObjectId(userId) },
        {
          $inc: { totalPoints: points },
        },
        {}
      );
    } catch (error) {
      console.log("Error in reward", error);
      throw error;
    }
  }

  async addMilestone(userId, milestoneType, points) {
    try {
      const reward = await this.findOne(this.rewardModel, { userId });
      const milestone = {
        type: milestoneType,
        points: points,
        achievedAt: new Date(),
      };

      reward.milestones.push(milestone);
      reward.totalPoints += points; // Add milestone points
      await this.updateOne(this.rewardModel, { userId }, reward, {});

      // Log the milestone completion in the RewardHistory schema
      const historyEntry = {
        userId,
        event: `Milestone Achieved: ${milestoneType}`, // Description of the milestone
        points,
        date: new Date(),
      };
      await await this.save(this.rewardHistoryModel, historyEntry); // Save reward history entry

      // Update the user model with the new totalPoints
      await this.updateOne(
        "users",
        { _id: toObjectId(userId) },
        {
          $inc: { totalPoints: points },
        },
        {}
      );
    } catch (error) {
      throw error;
    }
  }

  async budgetMet(userId, budgetId) {
    try {
      const budget = await this.findOne(this.budgetModel, { _id: budgetId });
      // const reward = await this.findOne(this.rewardModel, { userId });

      if (!budget) {
        return; // Budget doesn't exist
      }

      const now = Date.now();

      // Check if the budget is met on or before the end date and the amount added is sufficient
      if (now <= budget.endDate && budget.amountAdded >= budget.totalBudget) {
        // Award 2 coins for successfully meeting the budget on time
        await this.updateRewardPoints(
          userId,
          2,
          REWARD_MSG.Budget_Successfully_Met,
          REWARD_EVENTS.BUDGET
        );
      }
    } catch (error) {
      throw error;
    }
    // await this.save(this.rewardModel, reward); // Save the updated reward points
  }

  async completeGoal(userId, goalId) {
    try {
      const goal = await this.findOne(this.goalModel, { _id: goalId });
      let reward = await this.findOne(this.rewardModel, { userId });

      if (!goal) {
        return; // Goal doesn't exist
      }

      const now = Date.now();

      const today = getDateWithoutTime(now); // Today's date without time
      const goalEndDate = getDateWithoutTime(goal.endDate); // Goal's end date without

      // Track the number of goals completed on time for milestone
      let goalsCompletedOnTime = reward?.goalsCompletedOnTime
        ? reward.goalsCompletedOnTime + 1
        : 1;

      // Check if the goal was completed before the end date
      if (goal.status === GEN_STATUS.COMPLETED && today < goalEndDate) {
        // Award 3 coins for completing the goal before the due date (early completion)
        await this.updateRewardPoints(
          userId,
          3,
          REWARD_MSG.Complete_a_Goal_Early,
          REWARD_EVENTS.GOAL
        );

        // Track the number of goals completed early for milestone
      }
      // Check if the goal was completed exactly on time (by the due date)
      else if (goal.status === GEN_STATUS.COMPLETED && today === goalEndDate) {
        // Award 2 coins for completing the goal on time (on the due date)
        await this.updateRewardPoints(
          userId,
          2,
          REWARD_MSG.Goal_Completion_On_Time,
          REWARD_EVENTS.GOAL
        );
      }

      // Check if the user has hit a milestone (e.g., completing 10 goals)
      if (goalsCompletedOnTime % 10 === 0) {
        await this.addMilestone(userId, "goalMilestone", 4); // 4 coins for completing 10 goals on time
      }
      await this.updateOne(
        this.rewardModel,
        { userId },
        { goalsCompletedOnTime },
        {}
      ); // updated reward points and milestones
    } catch (error) {
      throw error;
    }
  }

  completeTaskReward = async (userId, taskId) => {
    try {
      const task = await this.findOne(this.taskModel, { _id: taskId });
      const reward = await this.findOne(this.rewardModel, { userId });

      if (!task) {
        return; // Task doesn't exist
      }
      // Track the number of tasks completed on time for milestone
      let tasksCompletedOnTime = reward?.tasksCompletedOnTime
        ? reward.tasksCompletedOnTime + 1
        : 1;
      const now = Date.now();

      const today = getDateWithoutTime(now); // Today's date without time
      const taskDate = getDateWithoutTime(task.taskDate); // Goal's end date without

      // Check if the task was completed on or before the taskDate
      if (task.status === GEN_STATUS.COMPLETED && today <= taskDate) {
        // Award 1 coin for completing the task on time
        await this.updateRewardPoints(
          userId,
          1,
          REWARD_MSG.Task_Completion_On_Time,
          REWARD_EVENTS.TASK
        );

        // Check if the user has hit a milestone (e.g., completing 5 tasks)
        if (tasksCompletedOnTime % 5 === 0) {
          await this.addMilestone(userId, "taskMilestone", 2); // 2 coins for completing 5 tasks on time
        }
      }

      await this.updateOne(
        this.rewardModel,
        { userId },
        { tasksCompletedOnTime },
        {}
      );
    } catch (error) {
      throw error;
    }
  };

  // Fetch all reward history entries for the user.
  async getAllRewardHistory(params) {
    try {
      let { pageNo, limit, searchKey, sortBy, sortOrder } = params;

      const match = {
        userId: toObjectId(params.userId), // Match the userId
        eventType: { $ne: REWARD_EVENTS.PURCHASE },
      };

      // Build the aggregation pipeline for reward history
      const aggPipe = [];
      aggPipe.push({ $match: match });

      // Sorting logic
      let sort = {};
      sortBy && sortOrder
        ? (sort = { [sortBy]: sortOrder })
        : (sort = { created: -1 });
      aggPipe.push({ $sort: sort });

      // Add pagination if limit and pageNo are provided
      if (params.limit && params.pageNo) {
        const [skipStage, limitStage] = this.addSkipLimit(
          params.limit,
          params.pageNo
        );
        aggPipe.push(skipStage, limitStage);
      }

      const totalPointsEarnedPipeline = [
        {
          $match: {
            userId: toObjectId(params.userId),
            eventType: { $ne: REWARD_EVENTS.PURCHASE },
          },
        },
        { $group: { _id: "$userId", totalPoints: { $sum: "$points" } } },
        { $project: { _id: 0, totalPoints: 1 } }, // Project only totalPoints
      ];

      // Build the pipeline to calculate total points spent on purchases
      const totalPointsSpentPipeline = [
        {
          $match: {
            userId: toObjectId(params.userId),
            eventType: REWARD_EVENTS.PURCHASE,
          },
        },
        { $group: { _id: "$userId", totalPointsSpent: { $sum: "$points" } } },
        { $project: { _id: 0, totalPointsSpent: 1 } },
      ];

      // Execute both operations concurrently
      const [rewardHistory, totalPointsEarnedResult, totalPointsSpentResult] =
        await Promise.all([
          this.dataPaginate(
            this.rewardHistoryModel,
            aggPipe,
            limit,
            pageNo,
            {},
            true
          ),
          this.aggregate(this.rewardHistoryModel, totalPointsEarnedPipeline),
          this.aggregate(this.rewardHistoryModel, totalPointsSpentPipeline),
        ]);

      // Calculate the total points by subtracting points spent on purchases from points earned
      const totalPointsEarned = totalPointsEarnedResult.length
        ? totalPointsEarnedResult[0].totalPoints
        : 0;

      const totalPointsSpent = totalPointsSpentResult.length
        ? totalPointsSpentResult[0].totalPointsSpent
        : 0;

      const totalPoints = totalPointsEarned - totalPointsSpent;

      rewardHistory["totalPoints"] = totalPoints;

      this.findOneAndUpdate(
        "users",
        {
          _id: toObjectId(params.userId),
        },
        {
          $set: {
            totalPoints: rewardHistory["totalPoints"],
          },
        }
      );

      return rewardHistory;
    } catch (error) {
      throw error;
    }
  }

  async getAllPurchaseHistory(params) {
    try {
      let { pageNo, limit, sortBy, sortOrder } = params;

      // Match condition for purchases
      const match = {
        userId: toObjectId(params.userId), // Match the userId
        eventType: REWARD_EVENTS.PURCHASE, // Only include purchase events
      };

      // Aggregation pipeline for fetching purchase history
      const aggPipe = [];
      aggPipe.push({ $match: match });

      // Sorting logic
      let sort = {};
      sortBy && sortOrder
        ? (sort = { [sortBy]: sortOrder })
        : (sort = { created: -1 });
      aggPipe.push({ $sort: sort });

      // Add pagination if limit and pageNo are provided
      if (params.limit && params.pageNo) {
        const [skipStage, limitStage] = this.addSkipLimit(
          params.limit,
          params.pageNo
        );
        aggPipe.push(skipStage, limitStage);
      }

      // // Build the pipeline to calculate total points and money spent
      // const totalSummaryPipeline = [
      //   {
      //     $match: {
      //       userId: toObjectId(params.userId), // Match the userId
      //       eventType: { $ne: REWARD_EVENTS.PURCHASE },
      //     },
      //   },
      //   {
      //     $group: {
      //       _id: null,
      //       totalPoints: { $sum: "$points" },
      //     },
      //   },
      //   {
      //     $project: {
      //       _id: 0,
      //       totalPoints: 1,
      //       totalMoneySpent: 1,
      //     },
      //   },
      // ];

      const totalPointsEarnedPipeline = [
        {
          $match: {
            userId: toObjectId(params.userId),
            eventType: { $ne: REWARD_EVENTS.PURCHASE },
          },
        },
        { $group: { _id: "$userId", totalPoints: { $sum: "$points" } } },
        { $project: { _id: 0, totalPoints: 1 } }, // Project only totalPoints
      ];

      // Build the pipeline to calculate total points spent on purchases
      const totalPointsSpentPipeline = [
        {
          $match: {
            userId: toObjectId(params.userId),
            eventType: REWARD_EVENTS.PURCHASE,
          },
        },
        { $group: { _id: "$userId", totalPointsSpent: { $sum: "$points" } } },
        { $project: { _id: 0, totalPointsSpent: 1 } },
      ];

      // Execute both operations concurrently
      const [purchaseHistory, totalPointsEarnedResult, totalPointsSpentResult] =
        await Promise.all([
          this.dataPaginate(
            this.rewardHistoryModel,
            aggPipe,
            limit,
            pageNo,
            {},
            true
          ),
          this.aggregate(this.rewardHistoryModel, totalPointsEarnedPipeline),
          this.aggregate(this.rewardHistoryModel, totalPointsSpentPipeline),
        ]);

      // Calculate the total points by subtracting points spent on purchases from points earned
      const totalPointsEarned = totalPointsEarnedResult.length
        ? totalPointsEarnedResult[0].totalPoints
        : 0;

      const totalPointsSpent = totalPointsSpentResult.length
        ? totalPointsSpentResult[0].totalPointsSpent
        : 0;

      const totalPoints = totalPointsEarned - totalPointsSpent;

      purchaseHistory["totalPoints"] = totalPoints;

      return purchaseHistory;
    } catch (error) {
      throw error;
    }
  }

  async purchaseGiftCardWithValidation(userId, purchaseDetails) {
    const TREMENDOUS_API_KEY =
      "TEST_x25oBpN1J--akW0Bb_9rJ4bmeBC2jj6Ab19m4C8ssy6";
    const TREMENDOUS_API_URL =
      "https://testflight.tremendous.com/api/v2/orders";
    // const POINT_CONVERSION_RATE = 0.25; // 1 point = $0.25

    const {
      giftCardCode,
      giftCardName,
      pointsUsed,
      totalPoints,
      image,
      actualMoneyUsed = 0,
    } = purchaseDetails;

    try {
      // Validate required fields
      if (!userId || !giftCardCode || !giftCardName || !pointsUsed) {
        throw new Error("Missing required fields for the purchase.");
      }
      if (totalPoints < pointsUsed) {
        throw new Error("Insufficient points for the purchase.");
      }

      const user = await this.findOne(
        "users",
        { _id: userId },
        { totalPoints: 1, email: 1, name: 1, created: 1 }
      );

      // Step 1: Check if user has passed 6 months from their created timestamp
      // const userCreatedDate = new Date(user.created); // user's creation timestamp
      // const currentDate = new Date();
      // const sixMonthsAgo = new Date(
      //   currentDate.setMonth(currentDate.getMonth() - 6)
      // ); // Date 6 months ago

      // if (userCreatedDate > sixMonthsAgo) {
      //   return false;
      // }
      // Step 3: Make a Tremendous API call to purchase the gift card
      const tremendousPayload = {
        payment: {
          funding_source_id: "F0W1C7DRQOWB",
        },
        external_id: `purchase-${Date.now()}`,
        reward: {
          // campaign_id: "your-campaign-id",
          products: [giftCardCode],
          value: {
            denomination: actualMoneyUsed,
            currency_code: "USD",
          },
          recipient: {
            name: user.name,
            email: user.email,
          },
          delivery: {
            method: "EMAIL",
            meta: {
              sender_name: "yooshie",
            },
          },
        },
      };

      const tremendousResponse = await axios.post(
        TREMENDOUS_API_URL,
        tremendousPayload,
        {
          headers: {
            Authorization: `Bearer ${TREMENDOUS_API_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (tremendousResponse.status !== 200 || !tremendousResponse) {
        return false;
      }

      const tremendousData = tremendousResponse.data;

      // Step 4: Deduct coins from the user's balance
      const remainingCoins = user?.totalPoints - pointsUsed;

      if (remainingCoins > 0) {
        await this.findOneAndUpdate(
          "users",
          {
            _id: toObjectId(userId),
          },
          {
            $set: {
              totalPoints: remainingCoins,
            },
          }
        );
      }

      // Step 5: Save the purchase details to the database
      const rewardData = {
        userId: userId,
        event: giftCardName,
        eventType: REWARD_EVENTS.PURCHASE,
        points: pointsUsed,
        date: new Date(),
        created: Date.now(),
        image: image,
        purchaseDetails: {
          giftCardCode,
          giftCardName,
          invoiceId: tremendousData.order.external_id,
          actualMoneyUsed,
        },
      };

      await this.save(this.rewardHistoryModel, rewardData); // Save reward history entry

      return true;
    } catch (error) {
      return {
        success: false,
        message: "Error purchasing gift card.",
        error: error.message,
      };
    }
  }
}

export const rewardDao = new RewardDao();
