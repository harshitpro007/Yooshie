"use strict";

import {
	MESSAGES,
	SERVER,
	STATUS,
} from "@config/index";
import { axiosService } from "@lib/axiosService";

export class UserController {

	/**
	 * @function userListing
	 * @description get the listing of users
	 * @param params.pageNo 
	 * @param params.limit
	 * @returns array of users
	 */
	async userListing(params: ListingRequest, tokenData){
		try{
			const data = await axiosService.getData({"url": SERVER.USER_APP_URL + SERVER.USER_LISTING, "payload": params, "auth": `Bearer ${tokenData.accessToken}`})
			return MESSAGES.SUCCESS.DETAILS(data.data);
		}
		catch(error){
			console.log("Error", error)
			throw error;
		}
	}

	/**
	 * @function getUserDetails
	 * @description get the details of user by id
	 * @param params.userId
	 * @returns object of user details
	 */
	async getUserDetails(params: UserId, tokenData){
		try{
			const data = await axiosService.getData({"url": SERVER.USER_APP_URL + SERVER.USER_PROFILE, "payload": params, "auth": `Bearer ${tokenData.accessToken}`})
			return MESSAGES.SUCCESS.DETAILS(data.data);
		}
		catch(error){
			console.log("Error", error)
			throw error;
		}
	}

	/**
	 * @function getUserTaskListing
	 * @description get the listing of user task
	 * @param params.userId
	 * @param params.pageNo 
	 * @param params.limit
	 * @returns array of user task	
	 */
	async getUserTaskListing(params: UserRequest.TaskListing, tokenData){
		try{
			const data = await axiosService.getData({"url": SERVER.TASK_APP_URL + SERVER.USER_TASK_LISTING, "payload": params, "auth": `Bearer ${tokenData.accessToken}`})
			delete data.message;
			delete data.type;
			delete data.statusCode;
			return MESSAGES.SUCCESS.DETAILS(data);
		}
		catch(error){
			console.log("Error", error)
			throw error;
		}
	}

	/**
	 * @function editTask
	 * @description edit the details of user task
	 * @param params.id task id (required)
	 * @returns object of updated task detail	
	 */
	async editTask(params: UserRequest.EditTask, tokenData){
		try{
			await axiosService.putData({"url": SERVER.TASK_APP_URL + SERVER.EDIT_TASK, "body": params, "auth": `Bearer ${tokenData.accessToken}`})
			if(params.status === STATUS.COMPLETED){
				return MESSAGES.SUCCESS.TASK_STATUS_UPDATED;
			}
			else{
				return MESSAGES.SUCCESS.EDIT_TASK;
			}
		}
		catch(error){
			console.log("Error", error)
			throw error;
		}
	}
	
	/**
	 * @function getUserTaskDetails
	 * @description get the details of task
	 * @param params.id task id (required)
	 * @returns object of task detials	
	 */
	async getUserTaskDetails(params: UserRequest.Id, tokenData){
		try{
			const data = await axiosService.getData({"url": SERVER.TASK_APP_URL + SERVER.TASK_DETAILS, "payload": params, "auth": `Bearer ${tokenData.accessToken}`})
			return MESSAGES.SUCCESS.DETAILS(data.data);
		}
		catch(error){
			console.log("Error", error)
			throw error;
		}
	}

	/**
	 * @function addTask
	 * @description add new task of a user
	 * @param params.userId 
	 * @param params.title
	 * @param params.desciption
	 * @param params.taskDate
	 * @param params.taskTime
	 * @returns 
	 */
	async addTask(params: UserRequest.AddTask, tokenData){
		try{
			const data = await axiosService.post({"url": SERVER.TASK_APP_URL + SERVER.ADD_TASK, "body": params, "auth": `Bearer ${tokenData.accessToken}`})
			return MESSAGES.SUCCESS.ADD_TASK;
		}
		catch(error){
			console.log("Error", error)
			throw error;
		}
	}

	/**
	 * @function deleteTask
	 * @description delete the task
	 * @param params.id task id (required)
	 * @returns 
	 */
	async deleteTask(params: UserRequest.Id, tokenData){
		try{
			const data = await axiosService.deleteData({"url": SERVER.TASK_APP_URL + SERVER.DELETE_TASK, "payload": params, "auth": `Bearer ${tokenData.accessToken}`})
			return MESSAGES.SUCCESS.DELETE_TASK;
		}
		catch(error){
			console.log("Error", error)
			throw error;
		}
	}
	
	/**
	 * @function getUserGoalListing
	 * @description get the listing of user goals
	 * @param params.userId
	 * @param params.pageNo 
	 * @param params.limit
	 * @returns array of user goal	
	 */
	async getUserGoalListing(params: UserRequest.TaskListing, tokenData){
		try{
			const data = await axiosService.getData({"url": SERVER.TASK_APP_URL + SERVER.GOAL, "payload": params, "auth": `Bearer ${tokenData.accessToken}`})
			delete data.message;
			delete data.type;
			delete data.statusCode;
			return MESSAGES.SUCCESS.DETAILS(data);
		}
		catch(error){
			console.log("Error", error)
			throw error;
		}
	}

	/**
	 * @function addGoal
	 * @description add new goal for a user
	 * @param params.userId 
	 * @param params.title
	 * @param params.desciption
	 * @returns 
	 */
	async addGoal(params: UserRequest.AddGoal, tokenData){
		try{	
			const data = await axiosService.post({"url": SERVER.TASK_APP_URL + SERVER.GOAL, "body": params, "auth": `Bearer ${tokenData.accessToken}`})
			return MESSAGES.SUCCESS.ADD_GOAL;
		}
		catch(error){
			console.log("Error", error)
			throw error;
		}
	}

	/**
	 * @function editGoal
	 * @description edit the details of a goal
	 * @param params.id goal id (required)
	 * @returns object of updated goal detail
	 */
	async editGoal(params: UserRequest.EditGoal, tokenData){
		try{
			const data = await axiosService.putData({"url": SERVER.TASK_APP_URL + SERVER.GOAL, "body": params, "auth": `Bearer ${tokenData.accessToken}`})
			return MESSAGES.SUCCESS.GOAL_EDIT;
		}
		catch(error){
			console.log("Error", error)
			throw error;
		}
	}

	/**
	 * @function getUserGoalDetails
	 * @description get the details of goal
	 * @param params.id goal id (required)
	 * @returns object of goal detials	
	 */
	async getUserGoalDetails(params: UserRequest.Id, tokenData){
		try{
			const data = await axiosService.getData({"url": SERVER.TASK_APP_URL + SERVER.GOAL_DETAILS, "payload": params, "auth": `Bearer ${tokenData.accessToken}`})
			return MESSAGES.SUCCESS.DETAILS(data.data);
		}
		catch(error){
			console.log("Error", error)
			throw error;
		}
	}

	/**
	 * @function deleteGoal
	 * @description delete the goal
	 * @param params.id goal id (required)
	 * @returns 
	 */
	async deleteGoal(params: UserRequest.Id, tokenData){
		try{
			const data = await axiosService.deleteData({"url": SERVER.TASK_APP_URL + SERVER.GOAL, "payload": params, "auth": `Bearer ${tokenData.accessToken}`})
			return MESSAGES.SUCCESS.GOAL_DELETE;
		}
		catch(error){
			console.log("Error", error)
			throw error;
		}
	}

	/**
	 * @function addReminder
	 * @description add new reminder for a user
	 * @param params.userId 
	 * @param params.title
	 * @param params.desciption
	 * @returns 
	 */
	async addReminder(params: UserRequest.AddReminder, tokenData){
		try{
			const data = await axiosService.post({"url": SERVER.TASK_APP_URL + SERVER.REMINDER, "body": params, "auth": `Bearer ${tokenData.accessToken}`})
			return MESSAGES.SUCCESS.ADD_REMINDER;
		}
		catch(error){
			console.log("Error", error)
			throw error;
		}
	}

	/**
	 * @function editReminder
	 * @description edit the details of a reminder
	 * @param params.id reminder id (required)
	 * @returns object of updated reminder details
	 */
	async editReminder(params: UserRequest.EditReminder, tokenData){
		try{
			const data = await axiosService.putData({"url": SERVER.TASK_APP_URL + SERVER.REMINDER, "body": params, "auth": `Bearer ${tokenData.accessToken}`})
			return MESSAGES.SUCCESS.EDIT_REMINDER;
		}
		catch(error){
			console.log("Error", error)
			throw error;
		}
	}

	/**
	 * @function getUserReminderListing
	 * @description get the listing of user reminders
	 * @param params.userId
	 * @param params.pageNo 
	 * @param params.limit
	 * @returns array of user reminders	
	 */
	async getUserReminderListing(params: UserRequest.TaskListing, tokenData){
		try{	
			const data = await axiosService.getData({"url": SERVER.TASK_APP_URL + SERVER.REMINDER, "payload": params, "auth": `Bearer ${tokenData.accessToken}`})
			delete data.message;
			delete data.type;
			delete data.statusCode;
			return MESSAGES.SUCCESS.DETAILS(data);
		}
		catch(error){
			console.log("Error", error)
			throw error;
		}
	}

	/**
	 * @function getUserReminderDetails
	 * @description get the details of reminder
	 * @param params.id reminder id (required)
	 * @returns object of reminder detials	
	 */
	async getUserReminderDetails(params: UserRequest.Id, tokenData){
		try{
			const data = await axiosService.getData({"url": SERVER.TASK_APP_URL + SERVER.REMINDER_DETAILS, "payload": params, "auth": `Bearer ${tokenData.accessToken}`})
			return MESSAGES.SUCCESS.DETAILS(data.data);
		}
		catch(error){
			console.log("Error", error)
			throw error;
		}
	}

	/**
	 * @function deleteReminder
	 * @description delete the reminder
	 * @param params.id reminder id (required)
	 * @returns 
	 */
	async deleteReminder(params: UserRequest.Id, tokenData){
		try{
			const data = await axiosService.deleteData({"url": SERVER.TASK_APP_URL + SERVER.REMINDER, "payload": params, "auth": `Bearer ${tokenData.accessToken}`})
			return MESSAGES.SUCCESS.DELETE_REMINDER;
		}
		catch(error){
			console.log("Error", error)
			throw error;
		}
	}

	
	/**
	 * @function getUserBudgetListing
	 * @description get the listing of user Budget
	 * @param params.userId
	 * @param params.pageNo 
	 * @param params.limit
	 * @returns array of user Budget	
	 */
	async getUserBudegtListing(params: UserRequest.BudgetListing, tokenData){
		try{
			const data = await axiosService.getData({"url": SERVER.TASK_APP_URL + SERVER.BUDGET, "payload": params, "auth": `Bearer ${tokenData.accessToken}`})
			delete data.message;
			delete data.type;
			delete data.statusCode;
			return MESSAGES.SUCCESS.DETAILS(data);
		}
		catch(error){
			console.log("Error", error)
			throw error;
		}
	}

	/**
	 * @function addBudget
	 * @description add new Budget for a user
	 * @param params.userId 
	 * @param params.title
	 * @param params.desciption
	 * @returns 
	 */
	async addBudget(params: UserRequest.AddBudget, tokenData){
		try{	
			const data = await axiosService.post({"url": SERVER.TASK_APP_URL + SERVER.BUDGET, "body": params, "auth": `Bearer ${tokenData.accessToken}`})
			return MESSAGES.SUCCESS.ADD_BUDGET;
		}
		catch(error){
			console.log("Error", error)
			throw error;
		}
	}

	/**
	 * @function editBudget
	 * @description edit the details of a Budget
	 * @param params.id Budget id (required)
	 * @returns object of updated Budget detail
	 */
	async editBudget(params: UserRequest.EditBudget, tokenData){
		try{
			const data = await axiosService.putData({"url": SERVER.TASK_APP_URL + SERVER.BUDGET, "body": params, "auth": `Bearer ${tokenData.accessToken}`})
			return MESSAGES.SUCCESS.EDIT_BUDGET;
		}
		catch(error){
			console.log("Error", error)
			throw error;
		}
	}

	/**
	 * @function getUserBudgetDetails
	 * @description get the details of Budget 
	 * @param params.id Budget  id (required)
	 * @returns object of Budget  detials	
	 */
	async getUserBudgetDetails(params: UserRequest.Id, tokenData){
		try{
			const data = await axiosService.getData({"url": SERVER.TASK_APP_URL + SERVER.BUDGET_DETAILS, "payload": params, "auth": `Bearer ${tokenData.accessToken}`})
			return MESSAGES.SUCCESS.DETAILS(data.data);
		}
		catch(error){
			console.log("Error", error)
			throw error;
		}
	}

	/**
	 * @function deleteBudget
	 * @description delete the Budget
	 * @param params.id Budget id (required)
	 * @returns 
	 */
	async deleteBudget(params: UserRequest.Id, tokenData){
		try{
			const data = await axiosService.deleteData({"url": SERVER.TASK_APP_URL + SERVER.BUDGET, "payload": params, "auth": `Bearer ${tokenData.accessToken}`})
			return MESSAGES.SUCCESS.DELETE_BUDGET;
		}
		catch(error){
			console.log("Error", error)
			throw error;
		}
	}

}

export const userController = new UserController();