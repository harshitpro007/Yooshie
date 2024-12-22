declare namespace ReminderRequest {
  export interface Id {
    id: string;
  }

  export interface Add {
    title: string;
    description: string;
    reminderDate: number;
    status: string;
    created: number;
    userId: string;
  }

  export interface Pagination {
    pageNo?: number;
    limit?: number;
  }

  export interface reminderRequest extends Pagination, Filter {
    userId?: string;
    timezone?: string;
  }

  export interface Edit extends Id, Add {}
}
