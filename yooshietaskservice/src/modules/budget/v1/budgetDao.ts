"use strict";

import { BaseDao } from "@modules/baseDao/BaseDao";

import { DB_MODEL_REF, STATUS } from "@config/constant";
import { toObjectId } from "@utils/appUtils";

export class BudgetDao extends BaseDao {
  private budgetModel: any;
  constructor() {
    super();
    this.budgetModel = DB_MODEL_REF.BUDGET;
  }

  /**
   * @function deleteBudget
   */
  async deleteBudget(params: BudgetRequest.Id) {
    try {
      const query: any = {};
      query._id = params.id;

      const update = {};
      update["$set"] = {
        status: STATUS.DELETED,
      };

      return await this.updateOne(this.budgetModel, query, update, {});
    } catch (error) {
      console.log("Error in budget", error);
      throw error;
    }
  }

  /**
   * @function budgetDetails
   */
  async budgetDetails(params: BudgetRequest.Id, project = {}) {
    try {
      const query: any = {};
      query._id = toObjectId(params.id);
      query.status = { $ne: STATUS.DELETED };

      const projection = Object.values(project).length
        ? project
        : { createdAt: 0, updatedAt: 0 };

      return await this.findOne(this.budgetModel, query, projection);
    } catch (error) {
      console.log("Error in budget", error);
      throw error;
    }
  }

  /**
   * @function editBudget

   */
  async editBudget(params: BudgetRequest.Edit) {
    try {
      const query: any = {};

      const update = {};
      query._id = params.id;

      update["$set"] = params;
      // Create If not exist.
      const options = { new: true };
      return await this.findOneAndUpdate(
        this.budgetModel,
        query,
        update,
        options
      );
    } catch (error) {
      console.log("Error in budget", error);
      throw error;
    }
  }

  /**
   * @function budgetList
   */
  async budgetList(params: any) {
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
        // Add custom sorting fields for conditions
        const today = new Date();
        const startOfDay = new Date().setHours(0, 0, 0, 0);
        const endOfDay = new Date().setHours(23, 59, 59, 999);

        aggPipe.push({
          $addFields: {
            isTodayCompleted: {
              $cond: [
                {
                  $and: [
                    { $eq: ["$status", STATUS.COMPLETED] },
                    { $gte: [{ $toLong: "$updatedAt" }, startOfDay] },
                    { $lte: [{ $toLong: "$updatedAt" }, endOfDay] },
                  ],
                },
                1, // True
                0, // False
              ],
            },
            isUpcoming: {
              $cond: [
                {
                  $and: [
                    { $ne: ["$status", STATUS.COMPLETED] },
                    { $gte: [{ $toLong: "$startDate" }, startOfDay] },
                  ],
                },
                1,
                0,
              ],
            },
            isOlderCompleted: {
              $cond: [
                {
                  $and: [
                    { $eq: ["$status", STATUS.COMPLETED] },
                    { $lt: [{ $toLong: "$updatedAt" }, startOfDay] },
                  ],
                },
                1,
                0,
              ],
            },
          },
        });
        // Apply custom sorting
        aggPipe.push({
          $sort: {
            isTodayCompleted: -1, // Highest priority for today's completed
            isUpcoming: -1, // Next priority for upcoming tasks
            startDate: 1, // Upcoming tasks by nearest start date
            isOlderCompleted: -1, // Older completed last
            updatedAt: -1, // Order today's completed by most recent update
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
        paymentLink: 1,
        budgetType: 1,
        amountAdded: 1,
        totalBudget: 1,
        updatedAt: 1,
        percentageCompleted: {
          $cond: {
            if: { $gt: ["$totalBudget", 0] },
            then: {
              $round: [
                {
                  $multiply: [
                    { $divide: ["$amountAdded", "$totalBudget"] },
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
      const completedBudgetMatch = { ...match, status: STATUS.COMPLETED };
      const pendingBudgetMatch = { ...match, status: STATUS.PENDING };

      const [budgetList, completedCount, pendingCount, totalCount] =
        await Promise.all([
          this.dataPaginate(this.budgetModel, aggPipe, limit, pageNo, {}, true),
          params.status == STATUS.COMPLETED
            ? this.count(this.budgetModel, completedBudgetMatch)
            : 0, // Completed  count
          params.status == STATUS.PENDING
            ? this.count(this.budgetModel, pendingBudgetMatch)
            : 0, // Pending  count
          this.count(this.budgetModel, {
            userId: params.userId,
            status: { $ne: STATUS.DELETED },
          }), // Total  count
        ]);
      budgetList["completed"] = completedCount;
      budgetList["pending"] = pendingCount;
      budgetList["totalBudgets"] = totalCount;
      return budgetList;
    } catch (error) {
      console.log("Error in budget", error);
      throw error;
    }
  }

  /**
   * @function addBudget
   */
  async addBudget(params: BudgetRequest.Add) {
    try {
      return await this.save(this.budgetModel, params);
    } catch (error) {
      console.log("Error in budget", error);
      throw error;
    }
  }
}

export const budgetDao = new BudgetDao();
