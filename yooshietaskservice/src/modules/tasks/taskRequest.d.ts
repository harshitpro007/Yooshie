declare namespace TaskRequest {
  export interface Id {
    id: string;
  }

  export interface Add {
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

  export interface Pagination {
    pageNo?: number;
    limit?: number;
  }

  export interface taskListing extends Pagination, Filter {
    userId?: string;
  }

  export interface Edit extends Id, Add {}
}
