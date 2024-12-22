"use strict";

import { BaseDao } from "@modules/baseDao/BaseDao";

import { DB_MODEL_REF, STATUS } from "@config/constant";
import { toObjectId } from "@utils/appUtils";

export class ReminderDao extends BaseDao {
  private reminderModel: any;
  constructor() {
    super();
    this.reminderModel = DB_MODEL_REF.REMINDER;
  }

  /**
   * @function deleteReminder
   */
  async deleteReminder(params: ReminderRequest.Id) {
    try {
      const query: any = {};
      query._id = params.id;

      const update = {};
      update["$set"] = {
        status: STATUS.DELETED,
      };
      const options = { new: true };
      return await this.findOneAndUpdate(
        this.reminderModel,
        query,
        update,
        options
      );
    } catch (error) {
      console.log("Error in reminder", error);
      throw error;
    }
  }

  /**
   * @function ReminderDetails
   */
  async reminderDetails(params: ReminderRequest.Id) {
    try {
      const query: any = {};
      query._id = toObjectId(params.id);
      query.status = { $ne: STATUS.DELETED };

      const projection = { createdAt: 0, updatedAt: 0 };

      return await this.findOne(this.reminderModel, query, projection);
    } catch (error) {
      console.log("Error in reminder", error);
      throw error;
    }
  }

  /**
   * @function editReminder

   */
  async editReminder(params: ReminderRequest.Edit) {
    try {
      const query: any = {};

      const update = {};
      query._id = params.id;

      update["$set"] = params;
      // Create If not exist.
      const options = { new: true };
      return await this.findOneAndUpdate(
        this.reminderModel,
        query,
        update,
        options
      );
    } catch (error) {
      console.log("Error in reminder", error);
      throw error;
    }
  }

  /**
   * @function reminderList
   */
  async reminderList(params: any) {
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

      let sort = {};
      params.sortBy && params.sortOrder
        ? (sort = { [params.sortBy]: params.sortOrder })
        : (sort = { created: -1 });
      aggPipe.push({ $sort: sort });

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
        reminderDate: 1,
      };
      aggPipe.push({ $project: project });

      const completedReminderMatch = { ...match, status: STATUS.COMPLETED };
      const pendingReminderMatch = { ...match, status: STATUS.PENDING };

      const [reminerList, completedCount, pendingCount, totalCount] =
        await Promise.all([
          this.dataPaginate(
            this.reminderModel,
            aggPipe,
            limit,
            pageNo,
            {},
            true
          ),
          params.status == STATUS.COMPLETED
            ? this.count(this.reminderModel, completedReminderMatch)
            : 0, // Completed  count
          params.status == STATUS.PENDING
            ? this.count(this.reminderModel, pendingReminderMatch)
            : 0, // Pending  count
          this.count(this.reminderModel, {
            userId: params.userId,
            status: { $ne: STATUS.DELETED },
          }), // Total  count
        ]);
      reminerList["completed"] = completedCount;
      reminerList["pending"] = pendingCount;
      reminerList["totalReminders"] = totalCount;
      return reminerList;
    } catch (error) {
      console.log("Error in reminder", error);
      throw error;
    }
  }
  /**
   * @function addReminder
   */
  async addReminder(params: ReminderRequest.Add) {
    try {
      return await this.save(this.reminderModel, params);
    } catch (error) {
      console.log("Error in reminder", error);
      throw error;
    }
  }
}

export const reminderDao = new ReminderDao();
