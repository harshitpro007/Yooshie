declare namespace AssistantRequest {
  export interface BlockUnblockRole {
    assistantId: string;
    status: string;
  }

  export interface CreateAssistant {
    name?: string;
    email: string;
    password?: string;
    userType?: string;
    salt?: string;
    hash?: string;
    addedBy: string;
    empId:string
  }

  export interface EditAssistant {
    assistantId: string;
    name?: string;
    mobileNo?: string;
    countryCode?: string;
    salt?: string;
    hash?: string;
    fullMobileNo?: string;
    email?: string;
    permission: [];
  }

  export interface BlockAssistant {
    assistantId: string;
    status: string;
  }

  export interface AssistantId {
    assistantId: string;
  }

  export interface AssistantList extends ListingRequest {
    isExport: boolean;
  }

  export interface resendInviteAssistant {
    assistantId: string;
  }

  export interface assignedAssistant {
    assistantId: string;
    userId: string;

  }
  export interface EditProfileSetting {
    offlineStatus?: boolean;
  }
}
