declare namespace UserRequest {
  export interface loginSignUp extends Device {
    countryCode: string;
    mobileNo: string;
    fullMobileNo?: string;
  }

  export interface SendOtp {
    email?: string;
    countryCode?: string;
    mobileNo?: string;
  }

  export interface VerifyOTP extends Device {
    otp: string;
    email?: string;
    countryCode?: string;
    mobileNo?: string;
  }

  export interface Login extends Device {
    email: string;
    password: string;
  }

  export interface ForgotPassword {
    email: string;
  }

  export interface ChangeForgotPassword {
    newPassword: string;
    confirmPassword: string;
    hash?: string;
    email: string;
  }

  export interface VerifyUser {
    isApproved: string;
    userId: string;
    reason?: string;
    declinedReason?: string;
  }

  export interface SkipSteps {
    type: string;
  }

  export interface supportChat {
    message: string;
    type: number;
    userId?: string;
  }

  export interface Setting {
    pushNotificationStatus: boolean;
    groupaNotificationStatus: boolean;
    isProfileHidden: boolean;
  }
  export interface EditProfile {
    email: string;
    firstName: string;
    lastName: string;
    profilePicture?: string;
    name?: string;
    isProfileCompleted?: boolean;
    occupation: string;
    pushNotificationStatus?: boolean;
    inAppNotificationStatus?: boolean;
    emailNotificationStatus?: boolean;
    dob: string;
    onboardingQues?:string;
  }

  export interface EditProfileSetting {
    offlineStatus?: boolean;
    pushNotificationStatus?: boolean;
    inAppNotificationStatus?: boolean;
    emailNotificationStatus?: boolean
  }

  export interface UploadDocument {
    type: string;
    documentUrl: string;
    documentUploadToken?: string;
  }

  export interface UserList extends ListingRequest {
    userType?: string;
    lat?: number;
    lng?: number;
    users?: any[];
    gender?: string;
    categoryIds?: any;
    interestIds?: any;
    activityId?: string;
  }

  export interface NotificationList {
    pageNo: number;
    limit: number;
  }

  export interface ManageNotification {
    pushNotificationStatus: boolean;
    groupaNotificationStatus: boolean;
  }
  export interface NotificationStatus {
    isRead: boolean;
    notificationId: boolean;
  }

  export interface OnboardSuccess {
    userId: string;
  }

  export interface PreSignedUrl {
    filename: "string";
    fileType: "string";
  }

  export interface blockDeleteUser {
    type: string;
    userId: string;
  }

}
