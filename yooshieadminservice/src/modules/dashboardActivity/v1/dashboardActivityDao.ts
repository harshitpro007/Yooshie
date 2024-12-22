"use strict";

import { BaseDao } from "@modules/baseDao/BaseDao";

import { DASH_ACTIVITY, DB_MODEL_REF } from "@config/constant";
import { escapeSpecialCharacter } from "@utils/appUtils";

export class DashboardActivityDao extends BaseDao {
  private dashboardActivity: any;
  private user: any;
  private admin: any;

  constructor() {
    super();
    this.dashboardActivity = DB_MODEL_REF.DASHBOARD_ACTIVITY;
    this.user = DB_MODEL_REF.USER;
    this.admin = DB_MODEL_REF.ADMIN;
  }

  /**
   * @function logUserActivity
   */
  async logUserActivity(userId, actionType) {
    try {
      const points = 1; // Each action gives 1 point

      // Increment action count and points for this user and action type
      await this.updateOne(
        this.dashboardActivity,
        { userId: userId, actionType: actionType },
        { $inc: { actionCount: 1 } }, // Increment action count
        { upsert: true } // Create the log if it doesn't exist
      );

      // Update total points for the user
      await this.updateOne(
        this.dashboardActivity,
        { userId: userId, actionType: DASH_ACTIVITY.TOTAL_POINTS }, // Find the user's total points record
        { $inc: { points: points } }, // Increment total points
        { upsert: true } // Create if it doesn't exist
      );
    } catch (error) {
      console.log("Error in dasboard activity", error);
      throw error;
    }
  }

  /**
   * @function logAssistantActivity
   */
  async logAssistantActivity(assistantId, actionType) {
    try {
      const points = 1; // Each action gives 1 point

      // Increment action count and points for this user and action type
      await this.updateOne(
        this.dashboardActivity,
        { assistantId: assistantId, actionType: actionType },
        { $inc: { actionCount: 1 } }, // Increment action count
        { upsert: true } // Create the log if it doesn't exist
      );

      // Update total points for the user
      await this.updateOne(
        this.dashboardActivity,
        { assistantId: assistantId, actionType: DASH_ACTIVITY.TOTAL_POINTS }, // Find the user's total points record
        { $inc: { points: points } }, // Increment total points
        { upsert: true } // Create if it doesn't exist
      );
    } catch (error) {
      console.log("Error in dasboard activity", error);
      throw error;
    }
  }

  async findMostActiveUser() {
    try {
      const mostActiveUser = await this.findOne(
        this.dashboardActivity,
        { actionType: DASH_ACTIVITY.TOTAL_POINTS, userId: { $exists: true } },
        { userId: 1 },
        {},
        { points: -1 }
      );

      if (mostActiveUser) {
        // Fetch the user details by ID to get the name
        const userData = await this.findOne(
          this.user,
          { _id: mostActiveUser.userId },
          { name: 1 }
        );
        return {
          name: userData ? userData.name : null,
        };
      }
      return null;
    } catch (error) {
      console.error("Error fetching most active user:", error);
      return null;
    }
  }

  // Helper function to find the most active assistant
  async findMostActiveAssistant() {
    try {
      const mostActiveAssistant = await this.findOne(
        this.dashboardActivity,
        {
          actionType: DASH_ACTIVITY.TOTAL_POINTS,
          assistantId: { $exists: true },
        },
        { assistantId: 1, actionCount: 1 },
        {},
        { points: -1 }
      );

      if (mostActiveAssistant) {
        // Fetch the user details by ID to get the name
        const assistantData = await this.findOne(
          this.admin,
          { _id: mostActiveAssistant.assistantId },
          { name: 1 }
        );
        return {
          name: assistantData ? assistantData.name : null,
        };
      }
      return null;
    } catch (error) {
      console.error("Error fetching most active assistant:", error);
      return null;
    }
  }
}

export const dashboardActivityDao = new DashboardActivityDao();
