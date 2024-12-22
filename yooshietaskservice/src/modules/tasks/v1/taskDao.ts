"use strict";

import { BaseDao } from "@modules/baseDao/BaseDao";

import { DB_MODEL_REF, STATUS } from "@config/constant";
import { toObjectId } from "@utils/appUtils";
import { calenderDao } from "@modules/calender/v1/calenderDao";

export class TaskDao extends BaseDao {
  private taskModel: any;
  constructor() {
    super();
    this.taskModel = DB_MODEL_REF.TASK;
  }

  /**
   * @function deleteTask
   */
  async deleteTask(params: TaskRequest.Id) {
    try {
      const query: any = {};
      query._id = params.id;

      const update = {};
      update["$set"] = {
        status: STATUS.DELETED,
      };
      const options = { new: true };
      return await this.findOneAndUpdate(
        this.taskModel,
        query,
        update,
        options
      );
    } catch (error) {
      console.log("Error in task", error);
      throw error;
    }
  }

  /**
   * @function taskDetails
   */
  async taskDetails(params: TaskRequest.Id) {
    try {
      const query: any = {};
      query._id = toObjectId(params.id);
      query.status = { $ne: STATUS.DELETED };

      const projection = {
        _id: 1,
        title: 1,
        description: 1,
        isTaskShared: 1,
        shareTaskUser: 1,
        status: 1,
        userId: 1,
        created: 1,
        taskDate: 1,
      };

      return await this.findOne(this.taskModel, query, projection);
    } catch (error) {
      console.log("Error in task", error);
      throw error;
    }
  }

  /**
   * @function editTask

   */
  async editTask(params: TaskRequest.Edit, taskDetails: any) {
    try {
      const query: any = {};
      const update: any = {};
      query._id = params.id;

      update["$set"] = { ...params };

      // Handle task sharing logic
      if (taskDetails.isTaskShared === true && params.shareTaskUser) {
        update["$set"].shareTaskUser = params.shareTaskUser;
      }

      if (taskDetails.isTaskShared === true && params.isTaskShared === false) {
        update["$unset"] = { shareTaskUser: 1 };
        update["$set"].isTaskShared = false;
      }
      const options = { new: true };
      return await this.findOneAndUpdate(
        this.taskModel,
        query,
        update,
        options
      );
    } catch (error) {
      console.log("Error in task", error);
      throw error;
    }
  }

  /**
   * @function taskList
   */
  async taskList(params: TaskRequest.taskListing) {
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
        shareTaskUser: 1,
        status: 1,
        userId: 1,
        created: 1,
        taskDate: 1,
      };
      aggPipe.push({ $project: project });

      // await this.dataPaginate(this.taskModel, aggPipe, limit, pageNo, {}, true);

      const completedTaskMatch = { ...match, status: STATUS.COMPLETED };
      const pendingTaskMatch = { ...match, status: STATUS.PENDING };

      const [taskList, completedCount, pendingCount, totalCount] =
        await Promise.all([
          this.dataPaginate(this.taskModel, aggPipe, limit, pageNo, {}, true),
          params.status == STATUS.COMPLETED
            ? this.count(this.taskModel, completedTaskMatch)
            : 0, // Completed tasks count
          params.status == STATUS.PENDING
            ? this.count(this.taskModel, pendingTaskMatch)
            : 0, // Pending tasks count
          this.count(this.taskModel, {
            userId: params.userId,
            status: { $ne: STATUS.DELETED },
          }), // Total tasks count
        ]);
      taskList["completed"] = completedCount;
      taskList["pending"] = pendingCount;
      taskList["totalTask"] = totalCount;

      return taskList;
    } catch (error) {
      console.log("Error in task", error);
      throw error;
    }
  }

  /**
   * @function addTask
   */
  async addTask(params: TaskRequest.Add) {
    try {
      return await this.save(this.taskModel, params);
    } catch (error) {
      console.log("Error in task", error);
      throw error;
    }
  }

  getCalendarData = async (userId, params, external?: boolean) => {
    try {
      const { startDate, endDate } = params;

      const tasksQuery = {
        userId: toObjectId(userId),
        status: { $ne: STATUS.DELETED },
        taskDate: {
          $gte: startDate,
          ...(endDate && { $lte: endDate }), // Add $lte condition only if endDate is provided
        },
      };

      // Create the base query for reminders
      const remindersQuery = {
        userId: toObjectId(userId),
        status: { $ne: STATUS.DELETED },
        reminderDate: {
          $gte: startDate,
          ...(endDate && { $lte: endDate }), // Add $lte condition only if endDate is provided
        },
      };

      // Run both tasks and reminders queries in parallel
      const [tasks, reminders, calendar] = await Promise.all([
        this.find("task", tasksQuery, {
          _id: 1,
          title: 1,
          description: 1,
          status: 1,
          userId: 1,
          taskDate: 1,
          shareTaskUser: 1,
          created: 1,
        }),
        this.find("reminder", remindersQuery, {
          _id: 1,
          title: 1,
          description: 1,
          reminderDate: 1,
          status: 1,
          userId: 1,
          created: 1,
        }),
        external ? calenderDao.getCalendarEvents(userId) : null,
      ]);

      // Return the combined result
      return {
        tasks,
        reminders,
        calendar,
      };
    } catch (error) {
      console.error("Error fetching calendar data: ", error);
      throw error;
    }
  };

  async getCalenderDates(userId, params) {
    try {
      const query1 = {
        userId: toObjectId(userId),
        status: { $ne: STATUS.DELETED },
        taskDate: {
          $gte: params.startDate,
          ...(params.endDate && { $lte: params.endDate }),
        },
      };
      const query2 = {
        userId: toObjectId(userId),
        status: { $ne: STATUS.DELETED },
        reminderDate: {
          $gte: params.startDate,
          ...(params.endDate && { $lte: params.endDate }),
        },
      };
      const [tasks, reminders] = await Promise.all([
        this.find("task", query1, {
          _id: 0,
          date: "$taskDate",
        }),
        this.find("reminder", query2, {
          _id: 0,
          date: "$reminderDate",
        }),
      ]);
      const data = [...tasks, ...reminders];
      console.log(tasks, reminders);
      return data;
    } catch (error) {
      throw error;
    }
  }

  async getUpcomingTasksAndReminders(assistantId) {
    try {
      const now = new Date().setHours(0, 0, 0, 0); // Start of today in milliseconds
      const fiveDaysFromNow = now + 5 * 24 * 60 * 60 * 1000;

      const taskPipeline = [
        {
          $match: {
            taskDate: { $gte: now, $lte: fiveDaysFromNow },
            status: STATUS.PENDING, // Filter only tasks with "PENDING" status
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "userId",
            foreignField: "_id",
            as: "user",
          },
        },
        {
          $unwind: {
            path: "$user",
            preserveNullAndEmptyArrays: false, // Only include tasks with matching users
          },
        },
        {
          $match: {
            "user.assistantId": toObjectId(assistantId), // Filter by assistantId
          },
        },
        {
          $group: {
            _id: "$userId",
            count: { $sum: 1 },
            latestTaskDate: { $min: "$taskDate" }, // Track the earliest task date
            user: { $first: "$user" }, // Capture the first user object
          },
        },
        {
          $project: {
            _id: "$user._id",
            count: 1,
            latestTaskDate: 1,
            username: "$user.name",
          },
        },
        {
          $sort: {
            latestTaskDate: 1,
          },
        },
      ];

      const reminderPipeline = [
        {
          $match: {
            reminderDate: { $gte: now, $lte: fiveDaysFromNow },
            status: STATUS.PENDING, // Filter only tasks with "PENDING" status
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "userId",
            foreignField: "_id",
            as: "user",
          },
        },
        {
          $unwind: "$user",
        },
        {
          $match: {
            "user.assistantId": toObjectId(assistantId), // Filter by assistantId
          },
        },
        {
          $group: {
            _id: "$userId",
            count: { $sum: 1 },
            latestReminderDate: { $min: "$reminderDate" }, // Track the earliest task date
            user: { $first: "$user" }, // Capture user data directly
          },
        },
        {
          $project: {
            _id: "$user._id",
            username: "$user.name",
            count: 1,
            latestReminderDate: 1,
          },
        },
        {
          $sort: {
            latestReminderDate: 1,
          },
        },
      ];

      const [tasks, reminders] = await Promise.all([
        this.aggregate(this.taskModel, taskPipeline),
        this.aggregate("reminder", reminderPipeline),
      ]);

      return { tasks, reminders };
    } catch (error) {
      throw error;
    }
  }
}

export const taskDao = new TaskDao();
