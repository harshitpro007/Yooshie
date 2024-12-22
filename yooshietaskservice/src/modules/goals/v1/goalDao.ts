"use strict";

import { BaseDao } from "@modules/baseDao/BaseDao";

import { DB_MODEL_REF, STATUS } from "@config/constant";
import { toObjectId } from "@utils/appUtils";

export class GoalDao extends BaseDao {
  private goalModel: any;
  constructor() {
    super();
    this.goalModel = DB_MODEL_REF.GOAL;
  }

  /**
   * @function deleteGoal
   */
  async deleteGoal(params: GoalRequest.Id) {
    try {
      const query: any = {};
      query._id = params.id;

      const update = {};
      update["$set"] = {
        status: STATUS.DELETED,
      };

      const options = { new: true };
      return await this.findOneAndUpdate("goal", query, update, options);
    } catch (error) {
      console.log("Error in goal", error);
      throw error;
    }
  }

  /**
   * @function goalDetails
   */
  async goalDetails(params: GoalRequest.Id, project = {}) {
    try {
      const query: any = {};
      query._id = toObjectId(params.id);
      query.status = { $ne: STATUS.DELETED };

      const projection = Object.values(project).length
        ? project
        : { createdAt: 0, updatedAt: 0 };

      return await this.findOne(this.goalModel, query, projection);
    } catch (error) {
      console.log("Error in goal", error);
      throw error;
    }
  }

  /**
   * @function editGoal

   */
  async editGoal(params: GoalRequest.Edit) {
    try {
      const query: any = {};

      const update = {};
      query._id = params.id;

      update["$set"] = params;
      const options = { new: true };

      return await this.findOneAndUpdate(
        this.goalModel,
        query,
        update,
        options
      );
    } catch (error) {
      console.log("Error in goal", error);
      throw error;
    }
  }

  /**
   * @function goalList
   */
  async goalList(params: any) {
    try {
      let { pageNo, limit, sortBy, sortOrder } = params;
      const aggPipe = [];
      const match: any = {};
      if (params.userId) match.userId = toObjectId(params.userId);
      if (params.status) {
        match.status = params.status;
      } else {
        match.status = { $ne: STATUS.DELETED };
      }
      aggPipe.push({ $match: match });

      // let sort = {};
      // params.sortBy && params.sortOrder
      //   ? (sort = { [params.sortBy]: params.sortOrder })
      //   : (sort = { created: -1 });

      // aggPipe.push({ $sort: sort });

      if (params.sortBy && params.sortOrder) {
        let sort = {};
        params.sortBy && params.sortOrder
          ? (sort = { [params.sortBy]: params.sortOrder })
          : (sort = { created: -1 });
        aggPipe.push({ $sort: sort });
      } else {
        // Define the current date for today goals
        const today = new Date();
        const startOfDay = new Date(today.setHours(0, 0, 0, 0)).getTime();
        const endOfDay = new Date(today.setHours(23, 59, 59, 999)).getTime();

        aggPipe.push({
          $addFields: {
            isTodayCompleted: {
              $cond: [
                {
                  $and: [
                    { $eq: ["$status", STATUS.COMPLETED] },
                    { $gte: ["$startDate", startOfDay] },
                    { $lte: ["$startDate", endOfDay] },
                  ],
                },
                1, // True
                0, // False
              ],
            },
            // Upcoming goasl (today or future)
            isUpcoming: {
              $cond: [
                {
                  $and: [
                    { $ne: ["$status", STATUS.COMPLETED] },
                    { $gte: ["$startDate", startOfDay] },
                  ],
                },
                1, //
                0,
              ],
            },
            isOlderCompleted: {
              $cond: [
                {
                  $and: [
                    { $eq: ["$status", STATUS.COMPLETED] }, // Completed
                    { $lt: ["$startDate", startOfDay] }, // Before today
                  ],
                },
                1,
                0,
              ],
            },
          },
        });

        aggPipe.push({
          $sort: {
            isTodayCompleted: -1, // Today's completed goals first
            isUpcoming: -1, // Today's and future upcoming goals next
            startDate: 1, // Upcoming goals sorted by nearest startDate
            isOlderCompleted: -1, // Older completed goals last
          },
        });
      }
      if (params.limit && params.pageNo) {
        const [skipStage, limitStage] = this.addSkipLimit(
          params.limit,
          params.pageNo
        );
        aggPipe.push(skipStage, limitStage);
      }

      const project = {
        id: 1,
        title: 1,
        description: 1,
        status: 1,
        userId: 1,
        created: 1,
        startDate: 1,
        endDate: 1,
        category: 1,
        goalType: 1,
        totalDaysToGoal: 1,
        completedGoal: 1,
        percentageCompleted: {
          $cond: {
            if: { $gt: ["$totalDaysToGoal", 0] },
            then: {
              $round: [
                {
                  $multiply: [
                    { $divide: ["$completedGoal", "$totalDaysToGoal"] },
                    100,
                  ],
                },
                2,
              ],
            },
            else: 0,
          },
        },
      };
      aggPipe.push({ $project: project });
      const completedGoalMatch = { ...match, status: STATUS.COMPLETED };
      const pendingGoalMatch = { ...match, status: STATUS.PENDING };

      const [goalList, completedCount, pendingCount, totalCount] =
        await Promise.all([
          this.dataPaginate(this.goalModel, aggPipe, limit, pageNo, {}, true),
          params.status == STATUS.COMPLETED
            ? this.count(this.goalModel, completedGoalMatch)
            : 0, // Completed goals count
          params.status == STATUS.PENDING
            ? this.count(this.goalModel, pendingGoalMatch)
            : 0, // Pending goals count
          this.count(this.goalModel, {
            userId: params.userId,
            status: { $ne: STATUS.DELETED },
          }), // Total goals count
        ]);
      goalList["completed"] = completedCount;
      goalList["pending"] = pendingCount;
      goalList["totalGoals"] = totalCount;
      return goalList;
    } catch (error) {
      console.log("Error in goal", error);
      throw error;
    }
  }
  /**
   * @function addGoal
   */
  async addGoal(params: GoalRequest.Add) {
    try {
      return await this.save(this.goalModel, params);
    } catch (error) {
      console.log("Error in goal", error);
      throw error;
    }
  }
}

export const goalDao = new GoalDao();
