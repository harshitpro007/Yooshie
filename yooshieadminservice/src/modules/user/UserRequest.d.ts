declare namespace UserRequest {
	export interface Id {
		id: string;
	}
	export interface EditTask extends Id {
		title?: string;
		description?: string;
		taskDate?: number;
		shareTaskUser?: {
			userName?: string,
			userId?: string,
			email?: string,
			profilePicture?: string
		};
		status?: string;
	}

	export interface TaskListing extends ListingRequest{
		userId?: string;
	}

	export interface AddTask {
		title: string;
		description: string;
		taskDate: number;
		shareTaskUser?: {
			userName?: string,
			userId?: string,
			email?: string,
			profilePicture?: string
		};
		status: string;
		created: number;
		userId: string;
		isTaskShared: boolean;
	}

	export interface AddGoal {
		title: string;
		description: string;
		startDate: number;
		endDate: number;
		goalType: string;
		totalDaysToGoal: string;
		completedGoal: string;
		userId: string;
		category: string;
		status: string;
	}

	export interface EditGoal extends Id {
		title: string;
		description: string;
		startDate: number;
		endDate: number;
		goalType: string;
		totalDaysToGoal: string;
		completedGoal: string;
		category: string;
		status: string;
	}

	export interface AddReminder {
		title: string;
		description: string;
		reminderDate: number;
		status?: string;
		created?: number;
		userId: string;
	}

	export interface EditReminder extends Id {
		title: string;
		description: string;
		reminderDate: number;
		status?: string;
	}



	export interface AddBudget {
	title: string;
    description: string;
    startDate: number;
    endDate: number;
    budgetType: string;
    totalBudget: number;
    amountAdded: number;
    userId: string;
    status: string;
    paymentLink: string;
	}

	export interface EditBudget extends Id,AddBudget {}

	export interface BudgetListing extends ListingRequest{
		userId?: string;
	}

}