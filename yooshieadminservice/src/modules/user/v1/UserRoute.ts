"use strict";
import {
    SERVER,
    SWAGGER_DEFAULT_RESPONSE_MESSAGES,
} from "@config/index";
import { authorizationHeaderObj } from "@utils/validator";
import { ResponseHandler } from "@utils/ResponseHandler";
import { addBudget, addGoal, addReminder, AddTask, budgetDetails, BudgetListing, editBudget, editGoal, editReminder, editTask, getTask, goalDetails, GoalListing, ReminderListing, taskList, userDetail, userListing } from "./routeValidate";
import { failActionFunction } from "@utils/appUtils";
import { userControllerV1 } from "..";
import { ResponseToolkit } from "@hapi/hapi";
let responseHandler = new ResponseHandler();

export const userRoute = [
    {
        method: "GET",
        path: `${SERVER.API_BASE_URL}/v1/admin/user-listing`,
        handler: async (request, h) => {
            try {
                const tokenData = request.auth?.credentials;
                let query: ListingRequest = request.query;
                let result = await userControllerV1.userListing(query,tokenData);
                return responseHandler.sendSuccess(h, result);
            } catch (error) {
                return responseHandler.sendError(request, error);
            }
        },
        config: {
            tags: ["api", "user"],
            description: "User List for admin",
            auth: {
                strategies: ["AdminAuth"],
            },
            validate: {
                headers: authorizationHeaderObj,
                query: userListing,
                failAction: failActionFunction,
            },
            plugins: {
                "hapi-swagger": {
                    responseMessages: SWAGGER_DEFAULT_RESPONSE_MESSAGES,
                },
            },
        },
    },
    {
        method: "GET",
        path: `${SERVER.API_BASE_URL}/v1/admin/user-details`,
        handler: async (request, h) => {
            try {
                const tokenData = request.auth?.credentials;
                let query: UserId = request.query;
                let result = await userControllerV1.getUserDetails(query,tokenData);
                return responseHandler.sendSuccess(h, result);
            } catch (error) {
                return responseHandler.sendError(request, error);
            }
        },
        config: {
            tags: ["api", "user"],
            description: "User Details",
            auth: {
                strategies: ["AdminAuth"],
            },
            validate: {
                headers: authorizationHeaderObj,
                query: userDetail,
                failAction: failActionFunction,
            },
            plugins: {
                "hapi-swagger": {
                    responseMessages: SWAGGER_DEFAULT_RESPONSE_MESSAGES,
                },
            },
        },
    },
    {
        method: "GET",
        path: `${SERVER.API_BASE_URL}/v1/admin/task-listing`,
        handler: async (request, h) => {
            try {
                const tokenData = request.auth?.credentials;
                let query: UserRequest.TaskListing = request.query;
                let result = await userControllerV1.getUserTaskListing(query,tokenData);
                return responseHandler.sendSuccess(h, result);
            } catch (error) {
                return responseHandler.sendError(request, error);
            }
        },
        config: {
            tags: ["api", "task"],
            description: "Get the list of user task",
            auth: {
                strategies: ["AdminAuth"],
            },
            validate: {
                headers: authorizationHeaderObj,
                query: taskList,
                failAction: failActionFunction,
            },
            plugins: {
                "hapi-swagger": {
                    responseMessages: SWAGGER_DEFAULT_RESPONSE_MESSAGES,
                },
            },
        },
    },
    {
        method: "PUT",
        path: `${SERVER.API_BASE_URL}/v1/admin/editTask`,
        handler: async (request: Request | any, h: ResponseToolkit) => {
            try {
                const tokenData = request.auth?.credentials;
                const payload: UserRequest.EditTask = request.payload;
                const result = await userControllerV1.editTask(payload,tokenData);
                return responseHandler.sendSuccess(h, result);
            } catch (error) {
                return responseHandler.sendError(request, error);
            }
        },
        config: {
            tags: ["api", "task"],
            description: "Update task",
            auth: {
                strategies: ["AdminAuth"],
            },
            validate: {
                headers: authorizationHeaderObj,
                payload: editTask,
                failAction: failActionFunction,
            },
            plugins: {
                "hapi-swagger": {
                    responseMessages: SWAGGER_DEFAULT_RESPONSE_MESSAGES,
                },
            },
        },
    },
    {
        method: "GET",
        path: `${SERVER.API_BASE_URL}/v1/admin/task-details`,
        handler: async (request, h) => {
            try {
                const tokenData = request.auth?.credentials;
                let query: UserRequest.Id = request.query;
                let result = await userControllerV1.getUserTaskDetails(query,tokenData);
                return responseHandler.sendSuccess(h, result);
            } catch (error) {
                return responseHandler.sendError(request, error);
            }
        },
        config: {
            tags: ["api", "task"],
            description: "get task Details",
            auth: {
                strategies: ["AdminAuth"],
            },
            validate: {
                headers: authorizationHeaderObj,
                query: getTask,
                failAction: failActionFunction,
            },
            plugins: {
                "hapi-swagger": {
                    responseMessages: SWAGGER_DEFAULT_RESPONSE_MESSAGES,
                },
            },
        },
    },
    {
        method: "POST",
        path: `${SERVER.API_BASE_URL}/v1/admin/addTask`,
        handler: async (request: Request | any, h: ResponseToolkit) => {
            try {
                const tokenData = request.auth?.credentials;
                const payload: UserRequest.AddTask = request.payload;
                const result = await userControllerV1.addTask(payload, tokenData);
                return responseHandler.sendSuccess(h, result);
            } catch (error) {
                return responseHandler.sendError(request, error);
            }
        },
        config: {
            tags: ["api", "task"],
            description: "Add Task",
            auth: {
                strategies: ["AdminAuth"],
            },
            validate: {
                headers: authorizationHeaderObj,
                payload: AddTask,
                failAction: failActionFunction,
            },
            plugins: {
                "hapi-swagger": {
                    responseMessages: SWAGGER_DEFAULT_RESPONSE_MESSAGES,
                },
            },
        },
    },
    {
        method: "DELETE",
        path: `${SERVER.API_BASE_URL}/v1/admin/deleteTask`,
        handler: async (request: Request | any, h: ResponseToolkit) => {
            try {
                const tokenData = request.auth?.credentials;
                const query: UserRequest.Id = request.query;
                const result = await userControllerV1.deleteTask(query, tokenData);
                return responseHandler.sendSuccess(h, result);
            } catch (error) {
                return responseHandler.sendError(request, error);
            }
        },
        config: {
            tags: ["api", "task"],
            description: "delte Task",
            auth: {
                strategies: ["AdminAuth"],
            },
            validate: {
                headers: authorizationHeaderObj,
                query: getTask,
                failAction: failActionFunction,
            },
            plugins: {
                "hapi-swagger": {
                    responseMessages: SWAGGER_DEFAULT_RESPONSE_MESSAGES,
                },
            },
        },
    },
    {
        method: "GET",
        path: `${SERVER.API_BASE_URL}/v1/admin/goal-listing`,
        handler: async (request, h) => {
            try {
                const tokenData = request.auth?.credentials;
                let query: UserRequest.TaskListing = request.query;
                let result = await userControllerV1.getUserGoalListing(query,tokenData);
                return responseHandler.sendSuccess(h, result);
            } catch (error) {
                return responseHandler.sendError(request, error);
            }
        },
        config: {
            tags: ["api", "goal"],
            description: "Get the list of user goals",
            auth: {
                strategies: ["AdminAuth"],
            },
            validate: {
                headers: authorizationHeaderObj,
                query: GoalListing,
                failAction: failActionFunction,
            },
            plugins: {
                "hapi-swagger": {
                    responseMessages: SWAGGER_DEFAULT_RESPONSE_MESSAGES,
                },
            },
        },
    },
    {
        method: "POST",
        path: `${SERVER.API_BASE_URL}/v1/admin/addGoal`,
        handler: async (request: Request | any, h: ResponseToolkit) => {
            try {
                const tokenData = request.auth?.credentials;
                const payload: UserRequest.AddGoal = request.payload;
                const result = await userControllerV1.addGoal(payload, tokenData);
                return responseHandler.sendSuccess(h, result);
            } catch (error) {
                return responseHandler.sendError(request, error);
            }
        },
        config: {
            tags: ["api", "goal"],
            description: "Add Goal",
            auth: {
                strategies: ["AdminAuth"],
            },
            validate: {
                headers: authorizationHeaderObj,
                payload: addGoal,
                failAction: failActionFunction,
            },
            plugins: {
                "hapi-swagger": {
                    responseMessages: SWAGGER_DEFAULT_RESPONSE_MESSAGES,
                },
            },
        },
    },
    {
        method: "PUT",
        path: `${SERVER.API_BASE_URL}/v1/admin/editGoal`,
        handler: async (request: Request | any, h: ResponseToolkit) => {
            try {
                const tokenData = request.auth?.credentials;
                const payload: UserRequest.EditGoal = request.payload;
                const result = await userControllerV1.editGoal(payload,tokenData);
                return responseHandler.sendSuccess(h, result);
            } catch (error) {
                return responseHandler.sendError(request, error);
            }
        },
        config: {
            tags: ["api", "goal"],
            description: "Update Goal",
            auth: {
                strategies: ["AdminAuth"],
            },
            validate: {
                headers: authorizationHeaderObj,
                payload: editGoal,
                failAction: failActionFunction,
            },
            plugins: {
                "hapi-swagger": {
                    responseMessages: SWAGGER_DEFAULT_RESPONSE_MESSAGES,
                },
            },
        },
    },
    {
        method: "GET",
        path: `${SERVER.API_BASE_URL}/v1/admin/goal-details`,
        handler: async (request, h) => {
            try {
                const tokenData = request.auth?.credentials;
                let query: UserRequest.Id = request.query;
                let result = await userControllerV1.getUserGoalDetails(query,tokenData);
                return responseHandler.sendSuccess(h, result);
            } catch (error) {
                return responseHandler.sendError(request, error);
            }
        },
        config: {
            tags: ["api", "goal"],
            description: "get goal Details",
            auth: {
                strategies: ["AdminAuth"],
            },
            validate: {
                headers: authorizationHeaderObj,
                query: goalDetails,
                failAction: failActionFunction,
            },
            plugins: {
                "hapi-swagger": {
                    responseMessages: SWAGGER_DEFAULT_RESPONSE_MESSAGES,
                },
            },
        },
    },
    {
        method: "DELETE",
        path: `${SERVER.API_BASE_URL}/v1/admin/deleteGoal`,
        handler: async (request: Request | any, h: ResponseToolkit) => {
            try {
                const tokenData = request.auth?.credentials;
                const query: UserRequest.Id = request.query;
                const result = await userControllerV1.deleteGoal(query, tokenData);
                return responseHandler.sendSuccess(h, result);
            } catch (error) {
                return responseHandler.sendError(request, error);
            }
        },
        config: {
            tags: ["api", "goal"],
            description: "delete goal",
            auth: {
                strategies: ["AdminAuth"],
            },
            validate: {
                headers: authorizationHeaderObj,
                query: goalDetails,
                failAction: failActionFunction,
            },
            plugins: {
                "hapi-swagger": {
                    responseMessages: SWAGGER_DEFAULT_RESPONSE_MESSAGES,
                },
            },
        },
    },
    {
        method: "POST",
        path: `${SERVER.API_BASE_URL}/v1/admin/addReminder`,
        handler: async (request: Request | any, h: ResponseToolkit) => {
            try {
                const tokenData = request.auth?.credentials;
                const payload: UserRequest.AddReminder = request.payload;
                const result = await userControllerV1.addReminder(payload, tokenData);
                return responseHandler.sendSuccess(h, result);
            } catch (error) {
                return responseHandler.sendError(request, error);
            }
        },
        config: {
            tags: ["api", "reminder"],
            description: "Add reminder",
            auth: {
                strategies: ["AdminAuth"],
            },
            validate: {
                headers: authorizationHeaderObj,
                payload: addReminder,
                failAction: failActionFunction,
            },
            plugins: {
                "hapi-swagger": {
                    responseMessages: SWAGGER_DEFAULT_RESPONSE_MESSAGES,
                },
            },
        },
    },
    {
        method: "PUT",
        path: `${SERVER.API_BASE_URL}/v1/admin/editReminder`,
        handler: async (request: Request | any, h: ResponseToolkit) => {
            try {
                const tokenData = request.auth?.credentials;
                const payload: UserRequest.EditReminder = request.payload;
                const result = await userControllerV1.editReminder(payload,tokenData);
                return responseHandler.sendSuccess(h, result);
            } catch (error) {
                return responseHandler.sendError(request, error);
            }
        },
        config: {
            tags: ["api", "reminder"],
            description: "Update Reminder",
            auth: {
                strategies: ["AdminAuth"],
            },
            validate: {
                headers: authorizationHeaderObj,
                payload: editReminder,
                failAction: failActionFunction,
            },
            plugins: {
                "hapi-swagger": {
                    responseMessages: SWAGGER_DEFAULT_RESPONSE_MESSAGES,
                },
            },
        },
    },
    {
        method: "GET",
        path: `${SERVER.API_BASE_URL}/v1/admin/reminder-listing`,
        handler: async (request, h) => {
            try {
                const tokenData = request.auth?.credentials;
                let query: UserRequest.TaskListing = request.query;
                let result = await userControllerV1.getUserReminderListing(query,tokenData);
                return responseHandler.sendSuccess(h, result);
            } catch (error) {
                return responseHandler.sendError(request, error);
            }
        },
        config: {
            tags: ["api", "reminder"],
            description: "Get the list of user goals",
            auth: {
                strategies: ["AdminAuth"],
            },
            validate: {
                headers: authorizationHeaderObj,
                query: ReminderListing,
                failAction: failActionFunction,
            },
            plugins: {
                "hapi-swagger": {
                    responseMessages: SWAGGER_DEFAULT_RESPONSE_MESSAGES,
                },
            },
        },
    },
    {
        method: "GET",
        path: `${SERVER.API_BASE_URL}/v1/admin/reminder-details`,
        handler: async (request, h) => {
            try {
                const tokenData = request.auth?.credentials;
                let query: UserRequest.Id = request.query;
                let result = await userControllerV1.getUserReminderDetails(query,tokenData);
                return responseHandler.sendSuccess(h, result);
            } catch (error) {
                return responseHandler.sendError(request, error);
            }
        },
        config: {
            tags: ["api", "reminder"],
            description: "get goal Details",
            auth: {
                strategies: ["AdminAuth"],
            },
            validate: {
                headers: authorizationHeaderObj,
                query: goalDetails,
                failAction: failActionFunction,
            },
            plugins: {
                "hapi-swagger": {
                    responseMessages: SWAGGER_DEFAULT_RESPONSE_MESSAGES,
                },
            },
        },
    },
    {
        method: "DELETE",
        path: `${SERVER.API_BASE_URL}/v1/admin/deleteReminder`,
        handler: async (request: Request | any, h: ResponseToolkit) => {
            try {
                const tokenData = request.auth?.credentials;
                const query: UserRequest.Id = request.query;
                const result = await userControllerV1.deleteReminder(query, tokenData);
                return responseHandler.sendSuccess(h, result);
            } catch (error) {
                return responseHandler.sendError(request, error);
            }
        },
        config: {
            tags: ["api", "reminder"],
            description: "delete reminder",
            auth: {
                strategies: ["AdminAuth"],
            },
            validate: {
                headers: authorizationHeaderObj,
                query: goalDetails,
                failAction: failActionFunction,
            },
            plugins: {
                "hapi-swagger": {
                    responseMessages: SWAGGER_DEFAULT_RESPONSE_MESSAGES,
                },
            },
        },
    },


    {
        method: "GET",
        path: `${SERVER.API_BASE_URL}/v1/admin/budget-listing`,
        handler: async (request, h) => {
            try {
                const tokenData = request.auth?.credentials;
                let query: UserRequest.BudgetListing = request.query;
                let result = await userControllerV1.getUserBudegtListing(query,tokenData);
                return responseHandler.sendSuccess(h, result);
            } catch (error) {
                return responseHandler.sendError(request, error);
            }
        },
        config: {
            tags: ["api", "Budget"],
            description: "Get the list of user budgets",
            auth: {
                strategies: ["AdminAuth"],
            },
            validate: {
                headers: authorizationHeaderObj,
                query: BudgetListing,
                failAction: failActionFunction,
            },
            plugins: {
                "hapi-swagger": {
                    responseMessages: SWAGGER_DEFAULT_RESPONSE_MESSAGES,
                },
            },
        },
    },
    {
        method: "POST",
        path: `${SERVER.API_BASE_URL}/v1/admin/addBudget`,
        handler: async (request: Request | any, h: ResponseToolkit) => {
            try {
                const tokenData = request.auth?.credentials;
                const payload: UserRequest.AddBudget = request.payload;
                const result = await userControllerV1.addBudget(payload, tokenData);
                return responseHandler.sendSuccess(h, result);
            } catch (error) {
                return responseHandler.sendError(request, error);
            }
        },
        config: {
            tags: ["api", "Budget"],
            description: "Add Budget",
            auth: {
                strategies: ["AdminAuth"],
            },
            validate: {
                headers: authorizationHeaderObj,
                payload: addBudget,
                failAction: failActionFunction,
            },
            plugins: {
                "hapi-swagger": {
                    responseMessages: SWAGGER_DEFAULT_RESPONSE_MESSAGES,
                },
            },
        },
    },
    {
        method: "PUT",
        path: `${SERVER.API_BASE_URL}/v1/admin/editBudget`,
        handler: async (request: Request | any, h: ResponseToolkit) => {
            try {
                const tokenData = request.auth?.credentials;
                const payload: UserRequest.EditBudget = request.payload;
                const result = await userControllerV1.editBudget(payload,tokenData);
                return responseHandler.sendSuccess(h, result);
            } catch (error) {
                return responseHandler.sendError(request, error);
            }
        },
        config: {
            tags: ["api", "Budget"],
            description: "Update Budget",
            auth: {
                strategies: ["AdminAuth"],
            },
            validate: {
                headers: authorizationHeaderObj,
                payload: editBudget,
                failAction: failActionFunction,
            },
            plugins: {
                "hapi-swagger": {
                    responseMessages: SWAGGER_DEFAULT_RESPONSE_MESSAGES,
                },
            },
        },
    },
    {
        method: "GET",
        path: `${SERVER.API_BASE_URL}/v1/admin/budget-details`,
        handler: async (request, h) => {
            try {
                const tokenData = request.auth?.credentials;
                let query: UserRequest.Id = request.query;
                let result = await userControllerV1.getUserBudgetDetails(query,tokenData);
                return responseHandler.sendSuccess(h, result);
            } catch (error) {
                return responseHandler.sendError(request, error);
            }
        },
        config: {
            tags: ["api", "Budget"],
            description: "get Budget Details",
            auth: {
                strategies: ["AdminAuth"],
            },
            validate: {
                headers: authorizationHeaderObj,
                query: budgetDetails,
                failAction: failActionFunction,
            },
            plugins: {
                "hapi-swagger": {
                    responseMessages: SWAGGER_DEFAULT_RESPONSE_MESSAGES,
                },
            },
        },
    },
    {
        method: "DELETE",
        path: `${SERVER.API_BASE_URL}/v1/admin/deleteBudget`,
        handler: async (request: Request | any, h: ResponseToolkit) => {
            try {
                const tokenData = request.auth?.credentials;
                const query: UserRequest.Id = request.query;
                const result = await userControllerV1.deleteBudget(query, tokenData);
                return responseHandler.sendSuccess(h, result);
            } catch (error) {
                return responseHandler.sendError(request, error);
            }
        },
        config: {
            tags: ["api", "Budget"],
            description: "delete Budget",
            auth: {
                strategies: ["AdminAuth"],
            },
            validate: {
                headers: authorizationHeaderObj,
                query: budgetDetails,
                failAction: failActionFunction,
            },
            plugins: {
                "hapi-swagger": {
                    responseMessages: SWAGGER_DEFAULT_RESPONSE_MESSAGES,
                },
            },
        },
    },
];
