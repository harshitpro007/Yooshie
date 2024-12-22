declare namespace ContentRequest {
  export interface Id {
    contentId: string;
  }

  export interface Type {
    type: string;
    theme?: string;
  }

  export interface FaqId {
    faqId: string;
  }

  export interface Add extends Type {
    data: string;
    type: string;
    imageAndContent?: [];
  }

  export interface Edit extends Add {
    messageType: string;
  }

  export interface View {
    type: string;
    language: string;
  }

  export interface AddFaq {
    question?: string;
    answer?: string;
    type: string;
    position?: number;
  }

  export interface EditFaq extends FaqId, AddFaq {
    status?: string;
  }
}
