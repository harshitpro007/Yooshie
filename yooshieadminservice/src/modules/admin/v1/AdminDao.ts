"use strict";

import { BaseDao } from "@modules/baseDao/BaseDao";

import {
  STATUS,
  DB_MODEL_REF,
  GEN_STATUS,
  USER_TYPE,
  PAYMENT_STATUS,
} from "@config/constant";
import { escapeSpecialCharacter, toObjectId } from "@utils/appUtils";
import { redisClient } from "@lib/redis/RedisClient";
import { dashboardActivityDao } from "@modules/dashboardActivity/v1/dashboardActivityDao";

export class AdminDao extends BaseDao {
  private modelAdmin: any;
  private modelUser: any;
  private modelRole: any;
  private modelPayments: any;

  constructor() {
    super();
    this.modelAdmin = DB_MODEL_REF.ADMIN;
    this.modelUser = DB_MODEL_REF.USER;
    this.modelPayments = DB_MODEL_REF.USER_PAYMENTS;
  }

  /**
   * @function isEmailExists
   */
  async isEmailExists(params, userId?: string) {
    try {
      const query: any = {};
      query.email = params.email;
      if (userId) query._id = { $not: { $eq: userId } };
      query.status = {
        $in: [GEN_STATUS.UN_BLOCKED, GEN_STATUS.BLOCKED, GEN_STATUS.PENDING],
      };

      const projection = { updatedAt: 0, refreshToken: 0 };

      return await this.findOne(this.modelAdmin, query, projection);
    } catch (error) {
      console.log("Error", error);
      throw error;
    }
  }

  /**
   * @function findAdminById
   */
  async findAdminById(userId: string, project = {}) {
    try {
      const query: any = {};
      query._id = userId;
      query.status = { $ne: STATUS.DELETED };

      const projection = Object.values(project).length
        ? project
        : { createdAt: 0, updatedAt: 0 };

      return await this.findOne(this.modelAdmin, query, projection);
    } catch (error) {
      console.log("Error", error);
      throw error;
    }
  }

  /**
   * @function createAdmin
   */
  async createAdmin(params: AdminRequest.Create) {
    try {
      return await this.save(this.modelAdmin, params);
    } catch (error) {
      console.log("Error", error);
      throw error;
    }
  }

  /**
   * @function changePassword
   */
  async changePassword(params, userId?: string) {
    try {
      const query: any = {};
      if (userId) query._id = userId;
      if (params.email) query.email = params.email;

      const update = {};
      update["$set"] = {
        hash: params.hash,
      };

      return await this.updateOne(this.modelAdmin, query, update, {});
    } catch (error) {
      console.log("Error", error);
      throw error;
    }
  }

  /**
   * @function editProfile
   */
  async editProfile(params: AdminRequest.EditProfile, userId: string) {
    try {
      const query: any = {};
      query._id = userId;

      const update = {};
      update["$set"] = { ...params };
      const options = { new: true };

      return await this.findOneAndUpdate(
        this.modelAdmin,
        query,
        update,
        options
      );
    } catch (error) {
      console.log("Error", error);
      throw error;
    }
  }

  /**
   * @function addRoles
   */
  async addRoles(params) {
    try {
      return await this.save(this.modelRole, params);
    } catch (error) {
      console.log("Error", error);
      throw error;
    }
  }

  /**
   * @function roleList
   */
  async roleList(params: AdminRequest.RoleList) {
    try {
      const aggPipe = [];

      const match: any = {};
      match["userId"] = params.userId;
      if (params.status) {
        match.status = { $eq: params.status };
      } else match.status = { $ne: STATUS.DELETED };

      if (params.searchKey) {
        params.searchKey = escapeSpecialCharacter(params.searchKey);
        match.roles = { $regex: params.searchKey, $options: "-i" };
      }

      if (params.fromDate && !params.toDate)
        match.created = { $gte: params.fromDate };
      if (params.toDate && !params.fromDate)
        match.created = { $lte: params.toDate };
      if (params.fromDate && params.toDate)
        match.created = { $gte: params.fromDate, $lte: params.toDate };

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

      const options = { collation: true };

      let response = await this.dataPaginate(
        this.modelRole,
        aggPipe,
        params.limit,
        params.pageNo,
        options,
        false
      );
      return response;
    } catch (error) {
      console.log("Error", error);
      throw error;
    }
  }

  /**
   * @function updateStatus
   */
  async updateStatus(params) {
    try {
      const query = {
        _id: params.userId,
      };
      const update = {
        status: STATUS.UN_BLOCKED,
        reinvite: false,
      };
      return await this.updateMany(this.modelAdmin, query, update, {});
    } catch (error) {
      console.log("Error", error);
      throw error;
    }
  }

  async removeLoginHistory(params) {
    try {
      let model: any = DB_MODEL_REF.LOGIN_HISTORY;
      const query = {
        "userId._id": toObjectId(params.userId),
        isLogin: true,
      };
      const update: any = {};
      update["$set"] = { isLogin: false };
      const loginData = await this.find(model, query, { deviceId: 1 });
      await this.updateMany(model, query, update, {});

      console.log(
        "******************",
        Array.isArray(loginData),
        loginData.length > 0,
        "***********loginData**************",
        loginData
      );
      // Check if loginData is an array and has at least one item
      if (Array.isArray(loginData) && loginData.length > 0) {
        const firstLoginItem = loginData[0];
        await redisClient.deleteKey(
          `${params.userId}.${firstLoginItem.deviceId}`
        );
      } else {
        console.log("No login data found for the specified user.");
      }
    } catch (error) {
      console.log("Error", error);
      throw error;
    }
  }

  /**
   * @function isEmailExistsWithStatus
   */
  async isEmailExistsWithStatus(params, userId?: string) {
    try {
      const query: any = {};
      query._id = toObjectId(params.adminId);
      query.status = { $eq: GEN_STATUS.PENDING };

      const projection = { updatedAt: 0, refreshToken: 0 };

      return await this.findOne(this.modelAdmin, query, projection);
    } catch (error) {
      console.log("Error", error);
      throw error;
    }
  }

  async isAdminExist(adminId) {
    try {
      return await this.findOne(
        this.modelAdmin,
        { _id: toObjectId(adminId), status: STATUS.UN_BLOCKED },
        { _id: 1 }
      );
    } catch (error) {
      console.log("Error", error);
      throw error;
    }
  }

  // Get dashboard data
  async adminDashboard() {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Set to start of the day

      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

      // Aggregation pipeline for user (client) data
      const userAggPipe = [
        {
          $facet: {
            clientsRegisteredToday: [
              {
                $match: {
                  created: { $gte: today.getTime() },
                  status: { $ne: STATUS.DELETED  }, // Exclude users with status 'DELETED'
                },
              },
              {
                $count: "total",
              },
            ],
            clientsRegisteredMonthly: [
              {
                $match: {
                  created: { $gte: startOfMonth.getTime() },
                  status: { $ne: STATUS.DELETED  }, // Exclude users with status 'DELETED'
                },
              },
              {
                $count: "total",
              },
            ],
            totalClients: [
              {
                $match: {
                  status: { $ne: STATUS.DELETED  }, // Exclude users with status 'DELETED'
                },
              },
              {
                $count: "total",
              },
            ],
            totalAssignedClientsToday: [
              {
                $match: {
                  assistantId: { $ne: null }, // client has an assistant
                  created: { $gte: today.getTime() }, // Assigned today
                  status: { $ne: STATUS.DELETED  }, // Exclude users with status 'DELETED'
                },
              },
              {
                $count: "total",
              },
            ],
          },
        },
        {
          $project: {
            clientsRegisteredToday: {
              $arrayElemAt: ["$clientsRegisteredToday.total", 0],
            },
            clientsRegisteredMonthly: {
              $arrayElemAt: ["$clientsRegisteredMonthly.total", 0],
            },
            totalClients: { $arrayElemAt: ["$totalClients.total", 0] },
            totalAssignedClientsToday: {
              $arrayElemAt: ["$totalAssignedClientsToday.total", 0],
            },
          },
        },
      ];
      

      const userDashboardData = await this.aggregate(
        this.modelUser,
        userAggPipe
      );

      // Default values if no data is found
      const userResponseData = userDashboardData[0] || {
        clientsRegisteredToday: 0,
        clientsRegisteredMonthly: 0,
        totalClients: 0,
        totalAssignedClientsToday: 0,
      };

      // Aggregation pipeline for assistants data
      const assistantAggPipe = [
        {
          $facet: {
            totalAssistants: [
              {
                $match: {
                  userType: USER_TYPE.ASSISTANT, // Match only assistants
                  status: { $ne: STATUS.DELETED  }, // Exclude assistants with status 'DELETED'
                },
              },
              {
                $count: "total",
              },
            ],
            totalAssistantsAddedToday: [
              {
                $match: {
                  userType: USER_TYPE.ASSISTANT,
                  created: { $gte: today.getTime() }, // Added today
                  status: { $ne: STATUS.DELETED  }, // Exclude assistants with status 'DELETED'
                },
              },
              {
                $count: "total",
              },
            ],
          },
        },
        {
          $project: {
            totalAssistants: { $arrayElemAt: ["$totalAssistants.total", 0] },
            totalAssistantsAddedToday: {
              $arrayElemAt: ["$totalAssistantsAddedToday.total", 0],
            },
          },
        },
      ];
      

      const assistantDashboardData = await this.aggregate(
        this.modelAdmin,
        assistantAggPipe
      );

      // Fetch the most active user and assistant details
      const mostActiveUser = await dashboardActivityDao.findMostActiveUser();
      const mostActiveAssistant =
        await dashboardActivityDao.findMostActiveAssistant();

      // Default values if no data is found
      const assistantResponseData = assistantDashboardData[0] || {
        totalAssistants: 0,
        totalAssistantsAddedToday: 0,
      };

      const revenue = await this.calculateTotalRevenueAndChange();
      const topPlan = await this.adminDashboardTopPlans();

      // Combine responses
      const finalResponse = {
        clientsRegisteredToday: userResponseData.clientsRegisteredToday || 0,
        clientsRegisteredMonthly:
          userResponseData.clientsRegisteredMonthly || 0,
        totalClients: userResponseData.totalClients,
        totalAssignedClientsToday:
          userResponseData.totalAssignedClientsToday || 0,
        totalAssistants: assistantResponseData.totalAssistants,
        totalAssistantsAddedToday:
          assistantResponseData.totalAssistantsAddedToday || 0, // Assistants added today
        mostActiveUser: mostActiveUser?.name,
        mostActiveAssistant: mostActiveAssistant?.name,
        totalRevenue: revenue.totalRevenue || 0,
        revenueChange: revenue.percentageChange || 0,
        topPlan: topPlan?.name || "---",
      };

      console.log(finalResponse);
      return finalResponse;
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    }
  }

  // Get dashboard data chart
  async adminDashboardChart() {
    try {
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear();
      const currentMonth = currentDate.getMonth() + 1; // JavaScript months are 0-based, add 1 for readability
  
      // Calculate the starting date (12 months ago)
      const startDate = new Date(currentYear, currentMonth - 12, 1);
  
      // Aggregation pipeline to get the monthly count, excluding DELETED users
      const AggPipe = [
        {
          $match: {
            created: {
              $gte: startDate.getTime(),
              $lt: new Date(currentYear, currentMonth, 1).getTime(),
            },
            status: { $ne: STATUS.DELETED }, // Exclude users with status 'DELETED'
          },
        },
        {
          $group: {
            _id: {
              year: { $year: { $toDate: "$created" } },
              month: { $month: { $toDate: "$created" } },
            },
            count: { $sum: 1 },
          },
        },
        {
          $sort: { "_id.year": 1, "_id.month": 1 },
        },
      ];
  
      const result = await this.aggregate(this.modelUser, AggPipe);
  
      // Formatter for month names
      const monthFormatter = new Intl.DateTimeFormat("en", { month: "short" });
  
      // Initialize an array with 12 entries for the past 12 months
      const formattedResult = Array.from({ length: 12 }, (_, i) => {
        const date = new Date(currentYear, currentMonth - 12 + i);
        return {
          label: `${monthFormatter.format(date)} ${date.getFullYear()}`,
          value: 0,
        };
      });
  
      // Populate the formatted result array with actual counts
      result.forEach(({ _id, count }) => {
        const { year, month } = _id;
        // Find the index in the last 12 months array
        const dateIndex =
          (year - startDate.getFullYear()) * 12 +
          (month - 1) -
          startDate.getMonth();
        if (dateIndex >= 0 && dateIndex < 12) {
          formattedResult[dateIndex] = {
            label: `${monthFormatter.format(
              new Date(year, month - 1)
            )} ${year}`,
            value: count,
          };
        }
      });
  
      return formattedResult;
    } catch (error) {
      console.error("Error fetching monthly registrations:", error);
    }
  }
  

  async adminDashboardRevenueChart() {
    try {
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear();
      const currentMonth = currentDate.getMonth() + 1;

      // Calculate the starting date (12 months ago from today)
      const startDate = new Date(currentYear - 1, currentMonth, 1);

      // Get the monthly sum of revenue for the past 12 months
      const AggPipe = [
        {
          $match: {
            created: {
              $gte: startDate.getTime(),
              $lt: new Date(currentYear, currentMonth, 1).getTime(),
            },
          },
        },
        {
          $group: {
            _id: {
              year: { $year: { $toDate: "$created" } },
              month: { $month: { $toDate: "$created" } },
            },
            totalRevenue: { $sum: "$amount" }, // Sum up the 'amount' field
          },
        },
        {
          $sort: { "_id.year": 1, "_id.month": 1 },
        },
      ];

      const result = await this.aggregate(this.modelPayments, AggPipe);

      // Formatter for month names
      const monthFormatter = new Intl.DateTimeFormat("en", { month: "short" });

      // Initialize an array with 12 entries for month-wise data, starting from 12 months ago
      const formattedResult = Array.from({ length: 12 }, (_, i) => {
        const date = new Date(currentYear - 1, currentMonth + i);
        return {
          label: `${monthFormatter.format(date)} ${date.getFullYear()}`,
          value: 0,
        };
      });

      // Populate the formatted result array with actual revenue values from the aggregation result
      result.forEach(({ _id, totalRevenue }) => {
        const { year, month } = _id;
        const dateIndex =
          year === currentYear ? month - 1 : month + (12 - currentMonth) - 1;
        formattedResult[dateIndex] = {
          label: `${monthFormatter.format(new Date(year, month - 1))} ${year}`,
          value: totalRevenue,
        };
      });

      return formattedResult;
    } catch (error) {
      console.error("Error fetching monthly revenue:", error);
      throw error;
    }
  }

  async calculateTotalRevenueAndChange() {
    try {
      const startOfToday = new Date().setHours(0, 0, 0, 0);
      const startOfYesterday = new Date(startOfToday - 24 * 60 * 60 * 1000);

      // Fetch all-time total revenue
      const totalRevenueResult = await this.aggregate(this.modelPayments, [
        {
          $match: {
            paymentStatus: "success", // Consider only successful payments
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: "$amount" }, // Sum all payment amounts
          },
        },
      ]);

      // Fetch today's revenue
      const todayRevenueResult = await this.aggregate(this.modelPayments, [
        {
          $match: {
            transactionDate: { $gte: startOfToday }, // Payments from start of today
            paymentStatus: "success",
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: "$amount" },
          },
        },
      ]);

      // Fetch yesterday's revenue
      const yesterdayRevenueResult = await this.aggregate(this.modelPayments, [
        {
          $match: {
            transactionDate: { $gte: startOfYesterday, $lt: startOfToday }, // Payments only from yesterday
            paymentStatus: "success",
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: "$amount" },
          },
        },
      ]);

      // Extract values (handle cases where no results are found)
      const totalRevenue = totalRevenueResult[0]?.total || 0;
      const todayRevenue = todayRevenueResult[0]?.total || 0;
      const yesterdayRevenue = yesterdayRevenueResult[0]?.total || 0;

      // Calculate percentage change
      let percentageChange = 0;
      if (yesterdayRevenue !== 0) {
        percentageChange =
          ((todayRevenue - yesterdayRevenue) / yesterdayRevenue) * 100;
      } else if (todayRevenue > 0) {
        percentageChange = 100; // All growth if yesterday's revenue was zero
      }

      return {
        totalRevenue, // Cumulative revenue
        percentageChange: percentageChange.toFixed(2), // Daily change
      };
    } catch (error) {
      console.error("Error calculating revenue and change:", error);
      throw new Error("Failed to calculate total revenue and change");
    }
  }

  async adminDashboardTopPlans() {
    try {
      const aggPipe = [
        // Match condition to only consider relevant payments (optional, you can add filters here)
        {
          $match: {
            paymentStatus: { $eq: PAYMENT_STATUS.SUCCESS }, // Filter by completed payments
          },
        },
        // Group by subscriptionPlan and count occurrences of each plan
        {
          $group: {
            _id: "$subscriptionPlan", // Group by subscription plan name
            count: { $sum: 1 }, // Count how many times each subscription plan was purchased
          },
        },
        // Sort by count in descending order to get the most purchased plans first
        {
          $sort: { count: -1 },
        },
        // Project only the subscription plan name and count
        {
          $project: {
            _id: 0, // Remove the default _id
            name: "$_id", // Rename _id to name
            count: 1, // Include the count of purchases
          },
        },
        {
          $limit: 2,
        },
      ];

      // Execute the aggregation query
      const result = await this.aggregate(this.modelPayments, aggPipe);

      return result; // Return the most purchased subscription plans
    } catch (error) {
      console.error("Error fetching top purchased subscription plans:", error);
      throw error;
    }
  }
}

export const adminDao = new AdminDao();
