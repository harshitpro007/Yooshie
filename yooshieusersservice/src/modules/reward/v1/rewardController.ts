"use strict";

import { MESSAGES } from "@config/constant";
import { rewardDaoV1 } from "@modules/reward/index";

export class RewardController {
  //   /**
  //    * @function handleLoginReward
  //    * Handles login reward (daily check-in).
  //    */
  //   async handleLoginReward(userId: string) {
  //     try {
  //       await rewardDaoV1.handleLogin(userId);
  //       return MESSAGES.SUCCESS.LOGIN_REWARD;
  //     } catch (error) {
  //       console.log("Error in handleLoginReward", error);
  //       throw error;
  //     }
  //   }

  /**
   * @function rewardHistory
   * Fetches all reward history for a user.
   */
  async rewardHistory(param) {
    try {
      let history;
      if (param.eventType == "PURCHASE_HISTORY") {
        history = await rewardDaoV1.getAllPurchaseHistory(param);
      } else {
        history = await rewardDaoV1.getAllRewardHistory(param);
      }
      return MESSAGES.SUCCESS.LIST(history);
    } catch (error) {
      console.log("Error in rewardHistory", error);
      throw error;
    }
  }

  /**
   * @function completeGoalReward
   * Handles goal completion rewards.
   */
  async completeGoalReward(
    tokenData: TokenData,
    payload: RewardRequest.CompleteGoal
  ) {
    try {
      const userId = payload?.userId ? payload.userId : tokenData.userId;
      await rewardDaoV1.completeGoal(userId, payload.goalId);
      return MESSAGES.SUCCESS.GOAL_REWARD;
    } catch (error) {
      console.log("Error in completeGoalReward", error);
      throw error;
    }
  }

  /**
   * @function completeTaskReward
   * Handles task completion rewards.
   */
  async completeTaskReward(
    tokenData: TokenData,
    payload: RewardRequest.CompleteTask
  ) {
    try {
      const userId = payload?.userId ? payload.userId : tokenData.userId;
      await rewardDaoV1.completeTaskReward(userId, payload.taskId);
      return MESSAGES.SUCCESS.TASK_REWARD;
    } catch (error) {
      console.log("Error in completeTaskReward", error);
      throw error;
    }
  }

  /**
   * @function budgetMetReward
   * Handles budget completion rewards.
   */
  async budgetMetReward(
    tokenData: TokenData,
    payload: RewardRequest.BudgetMet
  ) {
    try {
      const userId = payload?.userId ? payload.userId : tokenData.userId;
      await rewardDaoV1.budgetMet(userId, payload.budgetId);
      return MESSAGES.SUCCESS.BUDGET_REWARD;
    } catch (error) {
      console.log("Error in budgetMetReward", error);
      throw error;
    }
  }

  async purchaseGiftCard(
    tokenData: TokenData,
    payload: RewardRequest.purchaseGiftCard
  ) {
    try {
      const userId = payload?.userId ? payload.userId : tokenData.userId;
      const response: any = await rewardDaoV1.purchaseGiftCardWithValidation(
        userId,
        payload
      );
      if (response?.success || response?.error)
        throw MESSAGES.ERROR.PURCHASE_NOT_VALID;

      return MESSAGES.SUCCESS.PURCHASE_REWARD;
    } catch (error) {
      console.log("Error in Purchase reward", error);
      throw error;
    }
  }
}

export const rewardController = new RewardController();
