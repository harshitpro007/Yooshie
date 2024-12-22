declare namespace RewardRequest {
  /**
   * @interface CompleteGoal
   * Request payload for completing a goal.
   */
  export interface CompleteGoal {
    goalId: string; // The ID of the goal being completed.
    userId?: string;
  }

  /**
   * @interface CompleteTask
   * Request payload for completing a task.
   */
  export interface CompleteTask {
    taskId: string; // The ID of the task being completed.
    userId?: string;
  }

  /**
   * @interface BudgetMet
   * Request payload for marking a budget as met.
   */
  export interface BudgetMet {
    budgetId: string; // The ID of the budget being completed.
    userId?: string;
  }

  /**
   * @interface RewardHistory
   * Request payload for fetching reward history.
   */
  export interface RewardHistory {
    userId?: string; // Optional userId to fetch specific user's reward history.
  }

  /**
   * @interface Pagination
   * For handling pagination in reward history or lists.
   */
  export interface Pagination {
    pageNo?: number; // Page number for pagination.
    limit?: number; // Number of items per page.
  }

  export interface purchaseGiftCard {
    userId: string;
    giftCardCode: string;
    giftCardName: string;
    pointsUsed: number;
    totalPoints: number;
    actualMoneyUsed: number;
    image: string;
  }
}
