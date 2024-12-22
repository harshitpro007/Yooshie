declare namespace CalenderRequest {
  export interface Id {
    id: string;
  }

  export interface AddEvents {
    userId: string;
    source: string;
    events: [];
  }

  export interface Edit extends Id, Add {}
}
