declare namespace GoalRequest {
  export interface Id {
    id: string;
  }

  export interface Add {
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

  export interface Pagination {
    pageNo?: number;
    limit?: number;
  }

  export interface goalRequest extends Pagination, Filter {
    userId?: string;
    timezone?: string;
  }

  export interface Edit extends Id, Add {}
}
