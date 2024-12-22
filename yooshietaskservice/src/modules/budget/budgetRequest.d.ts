declare namespace BudgetRequest {
  export interface Id {
    id: string;
  }

  export interface Add {
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

  export interface Pagination {
    pageNo?: number;
    limit?: number;
  }

  export interface budgetRequest extends Pagination, Filter {
    userId?: string;
    timezone?: string;
  }

  export interface Edit extends Id, Add {}
}
