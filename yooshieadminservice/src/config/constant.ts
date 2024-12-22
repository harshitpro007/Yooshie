"use strict";

import {
  FIELD_REQUIRED as EN_FIELD_REQUIRED,
  SERVER_IS_IN_MAINTENANCE as EN_SERVER_IS_IN_MAINTENANCE,
  LINK_EXPIRED as EN_LINK_EXPIRED,
} from "../../locales/en.json";

const SWAGGER_DEFAULT_RESPONSE_MESSAGES = [
  { code: 200, message: "OK" },
  { code: 400, message: "Bad Request" },
  { code: 401, message: "Unauthorized" },
  { code: 404, message: "Data Not Found" },
  { code: 500, message: "Internal Server Error" },
];

const HTTP_STATUS_CODE = {
  OK: 200,
  CREATED: 201,
  UPDATED: 202,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  PAYMENY_REQUIRED: 402,
  ACCESS_FORBIDDEN: 403,
  FAV_USER_NOT_FOUND: 403,
  URL_NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  UNREGISTERED: 410,
  PAYLOAD_TOO_LARGE: 413,
  CONCURRENT_LIMITED_EXCEEDED: 429,
  // TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SHUTDOWN: 503,
  EMAIL_NOT_VERIFIED: 430,
  MOBILE_NOT_VERIFIED: 431,
  FRIEND_REQUEST_ERR: 432,
};

const USER_TYPE = {
  ADMIN: "ADMIN",
  SUB_ADMIN: "SUB_ADMIN",
  USER: "USER",
  SUPPORTER: "SUPPORTER",
  ASSISTANT: "ASSISTANT",
  ALL: "ALL",
};

const DB_MODEL_REF = {
  ADMIN: "admins",
  LOGIN_HISTORY: "login_histories",
  USER: "users",
  ASSISTANT: "assistant",
  CONTENT: "contents",
  NOTIFICATION_LIST: "notification_lists",
  NOTIFICATION: "notifications",
  DASHBOARD_ACTIVITY: "dashboard_activity",
  USER_PAYMENTS: "payments",
};

const SUBSCRIPTION_STATUS = {
  ACTIVE: "ACTIVE",
  EXPIRED: "EXPIRED",
  CANCELLED: "CANCELLED",
};

const PAYMENT_STATUS = {
  SUCCESS: "SUCCESS",
  FAILED: "FAILED",
  PENDING: "PENDING",
};

const DASH_ACTIVITY = {
  TASK_ACTVITY: "TASK_ACTVITY",
  BUDGET_ACTIVITY: "BUDGET_ACTIVITY",
  GOALS_ACTIVITY: "GOALS_ACTIVITY",
  CHAT_ACTIVITY: "CHAT_ACTIVITY",
  CALL_ACTIVITY: "CALL_ACTIVITY",
  TOTAL_POINTS: "TOTAL_POINTS",
};

const MODULES = {
  DASHBOARD: "Dashboard",
  USER_MANAGEMENT: "User Management",
  NOTIFICATION_MANAGEMENT: "Notification Management",
  STATIC_CONTENT_MANAGEMENT: "Content Management",
};

const AWS_SECRET_MANGER = {
  REGION: "us-east-1",
  SECRET_NAME: `improveHealth-${process.env.NODE_ENV.trim()}-secrets`,
};

const MODULES_ID = {
  DASHBOARD: "1",
  USER_MANAGEMENT: "2",
  ROLE_MANAGEMENT: "3",
  CASE_MANAGEMENT: "4",
};

const DEVICE_TYPE = {
  ANDROID: "1",
  IOS: "2",
  WEB: "3",
  ALL: "4",
};

const SUB_TYPE = {
  ANDROID: "android",
  IOS: "ios",
};

const GENDER = {
  MALE: "MALE",
  FEMALE: "FEMALE",
  OTHER: "OTHER",
};

const CATEGORIES_STAUS = {
  ADMIN: "ADMIN",
  USER: "USER",
};

const VISIBILITY = {
  ALL: "ALL",
  PRIVATE: "PRIVATE",
  SELECTED: "SELECTED",
};

const ENVIRONMENT = {
  PRODUCTION: "production",
  PREPROD: "preprod",
  QA: "qa",
  DEV: "dev",
  LOCAL: "local",
  STAGE: "stage",
};

const STATUS = {
  BLOCKED: "BLOCKED",
  UN_BLOCKED: "UN_BLOCKED",
  SUCCESS: "SUCCESS",
  FAILED: "FAILED",
  ACTIVE: "ACTIVE",
  DELETED: "DELETED",
  UPCOMING: "UPCOMING",
  ONGOING: "ONGOING",
  ENDED: "ENDED",
  EXPIRED: "EXPIRED",
  INCOMPLETE: "INCOMPLETE",
  ACCEPTED: "ACCEPTED",
  DELETED_BY_ADMIN: "DELETED_BY_ADMIN",
  CONFIRMED: {
    NUMBER: 1,
    TYPE: "CONFIRMED",
    DISPLAY_NAME: "Confirmed",
  },
  COMPLETED: "COMPLETED",
  CANCELLED: {
    NUMBER: 3,
    TYPE: "CANCELLED",
    DISPLAY_NAME: "Cancelled",
  },
  PENDING: "PENDING",
  NOT_ATTENTED: {
    NUMBER: 5,
    TYPE: "NOT_ATTENTED",
    DISPLAY_NAME: "Not Attended",
  },
  OLD_COMPLETED: {
    NUMBER: 6,
    TYPE: "OLD_COMPLETE",
    DISPLAY_NAME: "Old complete",
  },
  SEND: {
    NUMBER: 7,
    TYPE: "SEND",
    DISPLAY_NAME: "Send",
  },
  SCHEDULE: {
    NUMBER: 8,
    TYPE: "SCHEDULE",
    DISPLAY_NAME: "Schedule",
  },
  DRAFT: {
    NUMBER: 9,
    TYPE: "DRAFT",
    DISPLAY_NAME: "Draft",
  },
};

const VALIDATION_CRITERIA = {
  FIRST_NAME_MIN_LENGTH: 3,
  FIRST_NAME_MAX_LENGTH: 10,
  MIDDLE_NAME_MIN_LENGTH: 3,
  MIDDLE_NAME_MAX_LENGTH: 10,
  LAST_NAME_MIN_LENGTH: 3,
  LAST_NAME_MAX_LENGTH: 10,
  NAME_MIN_LENGTH: 3,
  COUNTRY_CODE_MIN_LENGTH: 1,
  COUNTRY_CODE_MAX_LENGTH: 4,
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_MAX_LENGTH: 16,
  LATITUDE_MIN_VALUE: -90,
  LATITUDE_MAX_VALUE: 90,
  LONGITUDE_MIN_VALUE: -180,
  LONGITUDE_MAX_VALUE: 180,
};

const VALIDATION_MESSAGE = {
  date: "Date must be in the future.",
  invalidId: {
    pattern: "Invalid Id.",
  },
  mobileNo: {
    pattern: "Please enter a valid mobile number.",
  },
  email: {
    pattern: "Please enter email address in a valid format.",
  },
  password: {
    required: "Please enter password.",
    pattern: "Please enter a valid password.",
    // pattern: `Please enter a proper password with minimum ${VALIDATION_CRITERIA.PASSWORD_MIN_LENGTH} character, which can be alphanumeric with special character allowed.`,
    minlength: `Password must be between ${VALIDATION_CRITERIA.PASSWORD_MIN_LENGTH}-${VALIDATION_CRITERIA.PASSWORD_MAX_LENGTH} characters.`,
    // maxlength: `Please enter a proper password with minimum ${VALIDATION_CRITERIA.PASSWORD_MIN_LENGTH} character, which can be alphanumeric with special character allowed.`
    maxlength: `Password must be between ${VALIDATION_CRITERIA.PASSWORD_MIN_LENGTH}-${VALIDATION_CRITERIA.PASSWORD_MAX_LENGTH} characters.`,
  },
};

const MESSAGES = {
  ERROR: {
    UNAUTHORIZED_ACCESS: {
      statusCode: HTTP_STATUS_CODE.UNAUTHORIZED,
      type: "UNAUTHORIZED_ACCESS",
    },
    INTERNAL_SERVER_ERROR: {
      statusCode: HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR,
      type: "INTERNAL_SERVER_ERROR",
    },
    BAD_TOKEN: {
      statusCode: HTTP_STATUS_CODE.UNAUTHORIZED,
      type: "BAD_TOKEN",
    },
    BAD_RESET_TOKEN: {
      statusCode: HTTP_STATUS_CODE.BAD_REQUEST,
      type: "BAD_RESET_TOKEN",
    },
    TOKEN_EXPIRED: {
      statusCode: HTTP_STATUS_CODE.UNAUTHORIZED,
      type: "TOKEN_EXPIRED",
    },
    RESET_TOKEN_EXPIRED: {
      statusCode: HTTP_STATUS_CODE.BAD_REQUEST,
      type: "RESET_TOKEN_EXPIRED",
    },
    TOKEN_GENERATE_ERROR: {
      statusCode: HTTP_STATUS_CODE.BAD_REQUEST,
      type: "TOKEN_GENERATE_ERROR",
    },
    BLOCKED: {
      statusCode: HTTP_STATUS_CODE.UNAUTHORIZED,
      type: "BLOCKED",
    },
    INCORRECT_PASSWORD: {
      statusCode: HTTP_STATUS_CODE.ACCESS_FORBIDDEN,
      type: "INCORRECT_PASSWORD",
    },
    ENTER_NEW_PASSWORD: {
      statusCode: HTTP_STATUS_CODE.ACCESS_FORBIDDEN,
      type: "ENTER_NEW_PASSWORD",
    },
    BLOCKED_MOBILE: {
      statusCode: HTTP_STATUS_CODE.UNAUTHORIZED,
      type: "BLOCKED_MOBILE",
    },
    SESSION_EXPIRED: {
      statusCode: HTTP_STATUS_CODE.UNAUTHORIZED,
      type: "SESSION_EXPIRED",
    },
    RESET_SESSION_EXPIRED: {
      statusCode: HTTP_STATUS_CODE.BAD_REQUEST,
      type: "RESET_SESSION_EXPIRED",
    },
    FAV_USER_NOT_FOUND: {
      statusCode: HTTP_STATUS_CODE.FAV_USER_NOT_FOUND,
      type: "FAV_NOT_FOUND",
    },
    UPDATE_ASSISTANT: {
      statusCode: HTTP_STATUS_CODE.BAD_REQUEST,
      type: "UPDATE_ASSISTANT",
    },
    ERROR: (value, code = HTTP_STATUS_CODE.BAD_REQUEST) => {
      return {
        statusCode: code,
        message: value,
        type: "ERROR",
      };
    },
    FRIEND_ERROR: (value, code = HTTP_STATUS_CODE.FRIEND_REQUEST_ERR) => {
      return {
        statusCode: code,
        message: value,
        type: "ERROR",
      };
    },
    FIELD_REQUIRED: (value, lang = "en") => {
      return {
        statusCode: HTTP_STATUS_CODE.BAD_REQUEST,
        message: EN_FIELD_REQUIRED.replace(/{value}/g, value),
        type: "FIELD_REQUIRED",
      };
    },
    SOMETHING_WENT_WRONG: {
      statusCode: HTTP_STATUS_CODE.BAD_REQUEST,
      type: "SOMETHING_WENT_WRONG",
    },
    SERVER_IS_IN_MAINTENANCE: (lang = "en") => {
      return {
        statusCode: HTTP_STATUS_CODE.BAD_REQUEST,
        message: EN_SERVER_IS_IN_MAINTENANCE,
        type: "SERVER_IS_IN_MAINTENANCE",
      };
    },
    LINK_EXPIRED: {
      statusCode: HTTP_STATUS_CODE.BAD_REQUEST,
      message: EN_LINK_EXPIRED,
      type: "LINK_EXPIRED",
    },
    EMAIL_NOT_REGISTERED: {
      statusCode: HTTP_STATUS_CODE.BAD_REQUEST,
      type: "EMAIL_NOT_REGISTERED",
    },
    MOBILE_NOT_REGISTERED: {
      statusCode: HTTP_STATUS_CODE.BAD_REQUEST,
      type: "MOBILE_NOT_REGISTERED",
    },
    EMAIL_ALREADY_EXIST: {
      statusCode: HTTP_STATUS_CODE.BAD_REQUEST,
      type: "EMAIL_ALREADY_EXIST",
    },
    EMAIL_NOT_VERIFIED: (code = HTTP_STATUS_CODE.BAD_REQUEST) => {
      return {
        statusCode: code,
        type: "EMAIL_NOT_VERIFIED",
      };
    },
    INVALID_OLD_PASSWORD: {
      statusCode: HTTP_STATUS_CODE.BAD_REQUEST,
      type: "INVALID_OLD_PASSWORD",
    },
    INVALID_REFRESH_TOKEN: {
      statusCode: HTTP_STATUS_CODE.BAD_REQUEST,
      type: "INVALID_REFRESH_TOKEN",
    },
    NEW_CONFIRM_PASSWORD: {
      statusCode: HTTP_STATUS_CODE.BAD_REQUEST,
      type: "NEW_CONFIRM_PASSWORD",
    },
    OTP_EXPIRED: {
      statusCode: HTTP_STATUS_CODE.BAD_REQUEST,
      type: "OTP_EXPIRED",
    },
    INVALID_OTP: {
      statusCode: HTTP_STATUS_CODE.BAD_REQUEST,
      type: "INVALID_OTP",
    },
    // user specific
    USER_NOT_FOUND: {
      statusCode: HTTP_STATUS_CODE.BAD_REQUEST,
      type: "USER_NOT_FOUND",
    },
    PROFILE_NOT_COMPLETED: {
      statusCode: HTTP_STATUS_CODE.BAD_REQUEST,
      type: "PROFILE_NOT_COMPLETED",
    },
    USER_DOES_NOT_EXIST: {
      statusCode: HTTP_STATUS_CODE.BAD_REQUEST,
      type: "USER_DOES_NOT_EXIST",
    },
    // content specific
    CONTENT_ALREADY_EXIST: {
      statusCode: HTTP_STATUS_CODE.BAD_REQUEST,
      type: "CONTENT_ALREADY_EXIST",
    },
    CONTENT_NOT_FOUND: {
      statusCode: HTTP_STATUS_CODE.BAD_REQUEST,
      type: "CONTENT_NOT_FOUND",
    },
    FAQ_ALREADY_EXIST: {
      statusCode: HTTP_STATUS_CODE.BAD_REQUEST,
      type: "FAQ_ALREADY_EXIST",
    },
    // categories specific
    CATEGORY_ALREADY_EXIST: {
      statusCode: HTTP_STATUS_CODE.BAD_REQUEST,
      type: "CATEGORY_ALREADY_EXIST",
    },
    CATEGORY_NOT_FOUND: {
      statusCode: HTTP_STATUS_CODE.URL_NOT_FOUND,
      type: "CATEGORY_NOT_FOUND",
    },
    CANT_BLOCK_CATEGORY: {
      statusCode: HTTP_STATUS_CODE.BAD_REQUEST,
      type: "CANT_BLOCK_CATEGORY",
    },
    // version Specific
    VERSION_ALREADY_EXIST: {
      statusCode: HTTP_STATUS_CODE.BAD_REQUEST,
      type: "VERSION_ALREADY_EXIST",
    },

    INVALID_ADMIN: {
      statusCode: HTTP_STATUS_CODE.BAD_REQUEST,
      type: "INVALID_ADMIN",
    },
    ROLE_ALREADY_EXIST: {
      statusCode: HTTP_STATUS_CODE.BAD_REQUEST,

      type: "ROLE_ALREADY_EXIST",
    },
    INVALID_ROLE_ID: {
      statusCode: HTTP_STATUS_CODE.BAD_REQUEST,

      type: "INVALID_ROLE_ID",
    },

    INVALID_ASSISTANT: {
      statusCode: HTTP_STATUS_CODE.BAD_REQUEST,

      type: "INVALID_ASSISTANT",
    },
    ROLE_IS_BLOCKED: {
      statusCode: HTTP_STATUS_CODE.BAD_REQUEST,

      type: "ROLE_IS_BLOCKED",
    },
    CONTACT_ADMIN: (data) => {
      return {
        statusCode: HTTP_STATUS_CODE.BAD_REQUEST,
        type: "CONTACT_ADMIN",
        data: data,
      };
    },
    NOTIFICATION_NOT_EXIT: {
      statusCode: HTTP_STATUS_CODE.BAD_REQUEST,
      type: "NOTIFICATION_NOT_EXIT",
    },
    PRODUCT_NOT_FOUND: {
      statusCode: HTTP_STATUS_CODE.URL_NOT_FOUND,
      type: "PRODUCT_NOT_FOUND",
    },
    COLLECTION_NOT_EXIST: {
      statusCode: HTTP_STATUS_CODE.BAD_REQUEST,
      type: "COLLECTION_NOT_EXIST",
    },
    LIMIT_EXCEEDS: {
      statusCode: HTTP_STATUS_CODE.BAD_REQUEST,
      type: "LIMIT_EXCEEDS",
    },
    NOT_EXIST_HOLIDAY: {
      statusCode: HTTP_STATUS_CODE.BAD_REQUEST,
      type: "NOT_EXIST_HOLIDAY",
    },
    REINVITE_NOT_VALID: {
      statusCode: HTTP_STATUS_CODE.BAD_REQUEST,
      type: "REINVITE_NOT_VALID",
    },
    RESET_PASSWORD_INVALID: {
      statusCode: HTTP_STATUS_CODE.BAD_REQUEST,
      type: "RESET_PASSWORD_INVALID",
    },
    SELF_BLOCK: {
      statusCode: HTTP_STATUS_CODE.BAD_REQUEST,
      type: "SELF_BLOCK",
    },
    ASSIGN_ASSISTANT: {
      statusCode: HTTP_STATUS_CODE.BAD_REQUEST,
      type: "ASSIGN_ASSISTANT",
    },
  },
  SUCCESS: {
    DEFAULT: {
      statusCode: HTTP_STATUS_CODE.OK,
      type: "DEFAULT",
    },
    DETAILS: (data) => {
      return {
        statusCode: HTTP_STATUS_CODE.OK,
        type: "DEFAULT",
        data: data,
      };
    },
    LIST: (data) => {
      return {
        statusCode: HTTP_STATUS_CODE.OK,
        type: "DEFAULT",
        ...data,
      };
    },
    LIST_DATA: (data) => {
      return {
        statusCode: HTTP_STATUS_CODE.OK,
        type: "DEFAULT",
        data: data,
      };
    },
    SEND_OTP: {
      statusCode: HTTP_STATUS_CODE.OK,
      type: "SEND_OTP",
    },
    MAIL_SENT: {
      statusCode: HTTP_STATUS_CODE.OK,
      type: "MAIL_SENT",
    },
    ADD_GOAL: {
      statusCode: HTTP_STATUS_CODE.CREATED,
      type: "ADD_GOAL",
    },
    GOAL_EDIT: {
      statusCode: HTTP_STATUS_CODE.UPDATED,
      type: "GOAL_EDIT",
    },
    GOAL_DELETE: {
      statusCode: HTTP_STATUS_CODE.UPDATED,
      type: "GOAL_DELETE",
    },
    DELETE_TASK: {
      statusCode: HTTP_STATUS_CODE.UPDATED,
      type: "DELETE_TASK",
    },
    EDIT_TASK: {
      statusCode: HTTP_STATUS_CODE.UPDATED,
      type: "EDIT_TASK",
    },
    TASK_STATUS_UPDATED: {
      statusCode: HTTP_STATUS_CODE.UPDATED,
      type: "TASK_STATUS_UPDATED",
    },
    ADD_TASK: {
      statusCode: HTTP_STATUS_CODE.CREATED,
      type: "ADD_TASK",
    },
    DELETE_REMINDER: {
      statusCode: HTTP_STATUS_CODE.UPDATED,
      type: "DELETE_REMINDER",
    },
    EDIT_REMINDER: {
      statusCode: HTTP_STATUS_CODE.UPDATED,
      type: "EDIT_REMINDER",
    },
    ADD_REMINDER: {
      statusCode: HTTP_STATUS_CODE.CREATED,
      type: "ADD_REMINDER",
    },
    DELETE_BUDGET: {
      statusCode: HTTP_STATUS_CODE.UPDATED,
      type: "DELETE_BUDGET",
    },
    EDIT_BUDGET: {
      statusCode: HTTP_STATUS_CODE.UPDATED,
      type: "EDIT_BUDGET",
    },
    ADD_BUDGET: {
      statusCode: HTTP_STATUS_CODE.CREATED,
      type: "ADD_BUDGET",
    },
    VERIFY_OTP: (data) => {
      return {
        statusCode: HTTP_STATUS_CODE.OK,
        type: "VERIFY_OTP",
        data: data,
      };
    },
    RESET_PASSWORD: {
      statusCode: HTTP_STATUS_CODE.OK,
      type: "RESET_PASSWORD",
    },
    MAKE_PUBLIC_SHIFT: {
      statusCode: HTTP_STATUS_CODE.OK,
      type: "MAKE_PUBLIC_SHIFT",
    },
    ASSISTANT_ASSIGNED: {
      statusCode: HTTP_STATUS_CODE.OK,
      type: "ASSISTANT_ASSIGNED",
    },
    CHANGE_PASSWORD: {
      statusCode: HTTP_STATUS_CODE.OK,
      type: "CHANGE_PASSWORD",
    },
    EDIT_PROFILE_PICTURE: {
      statusCode: HTTP_STATUS_CODE.OK,
      type: "EDIT_PROFILE_PICTURE",
    },
    // admin specific
    ADMIN_LOGIN: (data) => {
      return {
        statusCode: HTTP_STATUS_CODE.OK,
        type: "ADMIN_LOGIN",
        data: data,
      };
    },
    LOGOUT: {
      statusCode: HTTP_STATUS_CODE.OK,
      type: "LOGOUT",
    },
    // notification specific
    NOTIFICATION_DELETED: {
      statusCode: HTTP_STATUS_CODE.OK,
      type: "NOTIFICATION_DELETED",
    },
    // content specific
    ADD_CONTENT: {
      statusCode: HTTP_STATUS_CODE.CREATED,
      type: "ADD_CONTENT",
    },
    DELETE_FAQ: {
      statusCode: HTTP_STATUS_CODE.OK,
      type: "DELETE_FAQ",
    },
    EDIT_CONTENT: {
      statusCode: HTTP_STATUS_CODE.UPDATED,
      type: "EDIT_CONTENT",
    },

    // content specific
    DASHBOARD_ACTIVITY: {
      statusCode: HTTP_STATUS_CODE.CREATED,
      type: "DASHBOARD_ACTIVITY",
    },
    // user specific
    SIGNUP: (data) => {
      return {
        statusCode: HTTP_STATUS_CODE.OK,
        type: "SIGNUP",
        data: data,
      };
    },
    SIGNUP_VERIFICATION: (data) => {
      return {
        statusCode: HTTP_STATUS_CODE.OK,
        type: "SIGNUP_VERIFICATION",
        data: data,
      };
    },
    LOGIN: (data) => {
      return {
        statusCode: HTTP_STATUS_CODE.OK,
        type: "LOGIN",
        data: data,
      };
    },
    USER_LOGOUT: {
      statusCode: HTTP_STATUS_CODE.OK,
      type: "USER_LOGOUT",
    },
    BLOCK_USER: {
      statusCode: HTTP_STATUS_CODE.OK,
      type: "BLOCK_USER",
    },
    UNBLOCK_USER: {
      statusCode: HTTP_STATUS_CODE.OK,
      type: "UNBLOCK_USER",
    },
    VERIFICATION_APPROVED: {
      statusCode: HTTP_STATUS_CODE.OK,
      type: "VERIFICATION_APPROVED",
    },
    VERIFICATION_REJECTED: {
      statusCode: HTTP_STATUS_CODE.OK,
      type: "VERIFICATION_REJECTED",
    },
    ADD_PHOTO: {
      statusCode: HTTP_STATUS_CODE.OK,
      type: "ADD_PHOTO",
    },
    PROFILE_SETTINGS: {
      statusCode: HTTP_STATUS_CODE.OK,
      type: "PROFILE_SETTINGS",
    },
    PROFILE_IMAGE: {
      statusCode: HTTP_STATUS_CODE.OK,
      type: "PROFILE_IMAGE",
    },
    RATE_SUPPORTER: {
      statusCode: HTTP_STATUS_CODE.OK,
      type: "RATE_SUPPORTER",
    },
    // version specific
    ADD_VERSION: {
      statusCode: HTTP_STATUS_CODE.CREATED,
      type: "ADD_VERSION",
    },
    DELETE_VERSION: {
      statusCode: HTTP_STATUS_CODE.OK,
      type: "DELETE_VERSION",
    },
    EDIT_VERSION: {
      statusCode: HTTP_STATUS_CODE.UPDATED,
      type: "EDIT_VERSION",
    },
    ROLE_CREATED: (data) => {
      return {
        statusCode: HTTP_STATUS_CODE.CREATED,

        type: "ROLE_CREATED",
        data: data,
      };
    },
    ROLE_EDITED: (data) => {
      return {
        statusCode: HTTP_STATUS_CODE.UPDATED,

        type: "ROLE_EDITED",
        data: data,
      };
    },
    ROLE_BLOCKED: {
      statusCode: HTTP_STATUS_CODE.UPDATED,

      type: "ROLE_BLOCKED",
    },
    ROLE_UNBLOCKED: {
      statusCode: HTTP_STATUS_CODE.UPDATED,

      type: "ROLE_UNBLOCKED",
    },
    ROLE_DELETED: {
      statusCode: HTTP_STATUS_CODE.UPDATED,

      type: "ROLE_DELETED",
    },
    ROLE_LIST: (data) => {
      return {
        statusCode: HTTP_STATUS_CODE.OK,

        type: "ROLE_LIST",
        data: data,
      };
    },
    ROLE_DETAILS: (data) => {
      return {
        statusCode: HTTP_STATUS_CODE.OK,
        message: "Role details get successfully",
        type: "ROLE_DETAILS",
        data: data,
      };
    },
    ASSISTANT_CREATED: {
      statusCode: HTTP_STATUS_CODE.CREATED,
      message: "Assistant registered successfully",
      type: "ASSISTANT_CREATED",
    },
    ASSISTANT_EDITED: {
      statusCode: HTTP_STATUS_CODE.UPDATED,
      type: "ASSISTANT_EDITED",
    },
    ASSISTANT_BLOCKED: {
      statusCode: HTTP_STATUS_CODE.UPDATED,
      message: "Assistant inactivated successfully",
      type: "ASSISTANT_BLOCKED",
    },
    ASSISTANT_UNBLOCKED: {
      statusCode: HTTP_STATUS_CODE.UPDATED,
      message: "Assistant activated successfully",
      type: "ASSISTANT_UNBLOCKED",
    },
    ASSISTANT_DELETED: {
      statusCode: HTTP_STATUS_CODE.UPDATED,
      type: "ASSISTANT_DELETED",
    },
    ASSISTANT_LIST: (data) => {
      return {
        statusCode: HTTP_STATUS_CODE.OK,
        message: "Assistant list get successfully",
        type: "ASSISTANT_LIST",
        data: data,
      };
    },
    ASSISTANT_DETAILS: (data) => {
      return {
        statusCode: HTTP_STATUS_CODE.OK,
        type: "ASSISTANT_DETAILS",
        data: data,
      };
    },
    FORGOT_PASSWORD: {
      statusCode: HTTP_STATUS_CODE.OK,
      message: "Reset Password OTP has been sent.",
      type: "FORGOT_PASSWORD",
    },
    UPDATE_USER: {
      statusCode: HTTP_STATUS_CODE.UPDATED,
      message: "User has been updated",
      type: "UPDATE_USER",
    },
    DELETE_USER: {
      statusCode: HTTP_STATUS_CODE.OK,
      message: "User has been deleted successfully.",
      type: "DELETE_USER",
    },
    LISTING: (data) => {
      return {
        statusCode: HTTP_STATUS_CODE.OK,
        type: "DEFAULT",
        data: data,
      };
    },
    DELETE_POST: {
      statusCode: HTTP_STATUS_CODE.NO_CONTENT,
      type: "DELETE_POST",
    },
    BLOCK_POST: {
      statusCode: HTTP_STATUS_CODE.UPDATED,
      type: "BLOCK_POST",
    },
    UN_BLOCK_POST: {
      statusCode: HTTP_STATUS_CODE.UPDATED,
      type: "UN_BLOCK_POST",
    },
    ADD_NOTIFICATION: (data) => {
      return {
        statusCode: HTTP_STATUS_CODE.CREATED,
        type: "ADD_NOTIFICATION",
        data: data,
      };
    },
    EDIT_NOTIFICATION: (data) => {
      return {
        statusCode: HTTP_STATUS_CODE.UPDATED,
        type: "EDIT_NOTIFICATION",
        data: data,
      };
    },
    RESEND_NOTIFICATION: {
      statusCode: HTTP_STATUS_CODE.OK,
      type: "RESEND_NOTIFICATION",
    },
    RESEND_REINVITE: {
      statusCode: HTTP_STATUS_CODE.UPDATED,
      type: "RESEND_REINVITE",
    },
    EDIT_PROFILE: (data) => {
      return {
        statusCode: HTTP_STATUS_CODE.OK,
        type: "EDIT_PROFILE",
        data: data,
      };
    },
  },
};

const TEMPLATES = {
  EMAIL: {
    SUBJECT: {
      FORGOT_PASSWORD: "Reset Password Request",
      // RESET_PASSWORD: "Reset password link",
      // VERIFY_EMAIL: "Verify email address",
      WELCOME: "Welcome to Improve Health!",
      ACCOUNT_BLOCKED: "Account Blocked",
      VERIFICATION_REJECTED: "Verification Process Rejected",
      UPLOAD_DOCUMENT: "Upload Document",
      INCIDENT_REPORT: "Incident Report",
      ADD_NEW_SUBADMIN: "Improve Health- New User",
    },
    FROM_MAIL: process.env["FROM_MAIL"],
  },
  SMS: {
    OTP: `Your Improve Health Code is .`,
    THANKS: `Thanks, Improve Health Team`,
  },
};

const THEME = {
  DARK: "DARK",
  LIGHT: "LIGHT",
};

const MIME_TYPE = {
  XLSX: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  CSV1: "application/vnd.ms-excel",
  CSV2: "text/csv",
  CSV3: "data:text/csv;charset=utf-8,%EF%BB%BF",
  XLS: "application/vnd.ms-excel",
};

const REGEX = {
  EMAIL: /^\w+([.-]?\w+)*@\w+([.-]?\w+)*\.\w{2,}$/i, // NOSONAR
  URL: /^(https?|http|ftp|torrent|image|irc):\/\/(-\.)?([^\s\/?\.#-]+\.?)+(\/[^\s]*)?$/i, // NOSONAR
  SSN: /^(?!219-09-9999|078-05-1120)(?!666|000|9\d{2})\d{3}-(?!00)\d{2}-(?!0{4})\d{4}$/, // NOSONAR // US SSN
  ZIP_CODE: /^[0-9]{5}(?:-[0-9]{4})?$/, // NOSONAR
  PASSWORD:
    /(?=[^A-Z]*[A-Z])(?=[^a-z]*[a-z])(?=.*[@*%&])(?=[^0-9]*[0-9]).{8,16}/, // NOSONAR  // Minimum 6 characters, At least 1 lowercase alphabetical character, At least 1 uppercase alphabetical character, At least 1 numeric character, At least one special character
  COUNTRY_CODE: /^\d{1,4}$/,
  MOBILE_NUMBER: /^\d{6,16}$/,
  STRING_REPLACE: /[-+ ()*_$#@!{}|\/^%`~=?,.<>:;'"]/g, // NOSONAR
  SEARCH: /[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, // NOSONAR
  MONGO_ID: /^[a-f\d]{24}$/i,
};

const JOB_SCHEDULER_TYPE = {
  ACTIVITY_BOOKING: "activity_booking",
  START_GROUP_ACTIVITY: "start_group_activity",
  FINISH_GROUP_ACTIVITY: "finish_group_activity",
  EXPIRE_GROUP_ACTIVITY: "expire_group_activity",
  EXPIRE_SHIFT_ACTIVITY: "expire_shift_activity",
  EXPIRE_SHIFT_START_TIME: "expire_shift_activity_start_time",
  SHIFT_NOTIFICATION_INTERVAL: "shift_notification_interval",
  GROUP_NOTIFICATION_INTERVAL: "group_notification_interval",
  EXPIRE_GROUP_START_TIME: "expire_group_activity_start_time",
  AUTO_SESSION_EXPIRE: "auto_session_expire",
  SUB_ADMIN_REINVITE: "sub_admin_reinvite",
};

const LANGUAGES = [
  {
    code: "en",
    id: 38,
    isSelected: false,
    name: "English",
  },
];

const TOKEN_TYPE = {
  USER_LOGIN: "USER_LOGIN", // login/signup
  ADMIN_LOGIN: "ADMIN_LOGIN",
  ASSISTANT_LOGIN: "ASSISTANT_LOGIN",
  ADMIN_OTP_VERIFY: "ADMIN_OTP_VERIFY",
  FORGOT_PASSWORD: "FORGOT_PASSWORD",
};

const timeZones = ["Asia/Kolkata"];

const UPDATE_TYPE = {
  BLOCK_UNBLOCK: "BLOCK_UNBLOCK",
  APPROVED_DECLINED: "APPROVED_DECLINED",
  ABOUT_ME: "ABOUT_ME",
  EDIT_PROFILE: "EDIT_PROFILE",
  SET_PROFILE_PIC: "SET_PROFILE_PIC",
};

const DISTANCE_MULTIPLIER = {
  MILE_MULTIPLIER: 0.0006213727366498,
  KM_TO_MILE: 0.621372737,
  MILE_TO_METER: 1609.34,
  METER_TO_MILE: 0.000621371,
  METER_TO_KM: 0.001,
};

const fileUploadExts = [
  ".mp4",
  ".flv",
  ".mov",
  ".avi",
  ".wmv",
  ".jpg",
  ".jpeg",
  ".png",
  ".gif",
  ".svg",
  ".mp3",
  ".aac",
  ".aiff",
  ".m4a",
  ".ogg",
];

const ROLE_TITLES = {
  SUB_ADMIN: "Sub Admin",
};

const PERMISSION = {
  VIEW: "view",
  EDIT: "edit",
  ADD: "add",
  DELTETE: "delete",
};
const GEN_STATUS = {
  BLOCKED: "BLOCKED",
  UN_BLOCKED: "UN_BLOCKED",
  DELETED: "DELETED",
  PENDING: "PENDING",
};

const REDIS_PREFIX = {
  OTP_ATTEMP: "_attemp",
  RESET_ATTEMP: "_reset",
  INVITE: "_invite",
};

const DAY = {
  WEEKDAY: "WEEKDAY",
  WEEKEND: "WEEKEND",
};

const CONTENT_STATUS = {
  BLOCKED: "BLOCKED",
  UN_BLOCKED: "UN_BLOCKED",
  DELETED: "DELETED",
};

const CONTENT_TYPE = {
  FAQ: "FAQ",
  PRIVACY_POLICY: "PRIVACY_POLICY",
  ABOUT_US: "ABOUT_US",
  TERMS_AND_CONDITIONS: "TERMS_AND_CONDITIONS",
  WALKTHROUGH_SCREEN: "WALKTHROUGH_SCREEN",
};

const MAIL_TYPE = {
  FORGOT_PASSWORD: "FORGOT_PASSWORD",
  ADD_ASSISTANT: "ADD_ASSISTANT",
  ASSIGN_NEW_ASSISTANT: "ASSIGN_NEW_ASSISTANT",
};

const GOAL_TYPE = {
  WEEKLY: "Weekly",
  MONTHLY: "Monthly",
  YEARLY: "Yearly",
};

const TIME_TYPE = {
  WEEKLY: "Weekly",
  MONTHLY: "Monthly",
  YEARLY: "Yearly",
};

const GOAL_CATEGORY = {
  HEALTH: "Health",
  CAREER: "Career",
  FINANCE: "Finance",
  SKILLS: "Skills",
  REALATIONSHIP: "Relationship",
  EDUCATIONAL: "Educational",
  OTHERS: "Others",
};

const GENERATOR = {
  STRING: "abcdefghijklmnopqrstuvwxyz",
  NUMBER: "0123456789",
  PUNCTUATION: "@%&*",
};

const CLIENT_LIMIT = {
  MAX: 400,
};

const USER_PREFERENCE = {
  WELCOME_CALL: "WELCOME_CALL",
  IN_APP_MESSAGE: "IN_APP_MESSAGE",
  EMAIL_INTRO: "EMAIL_INTRO",
  TEXT_MESSAGE: "TEXT_MESSAGE",
};

const REDIS_KEY_PREFIX = {
  OFFLINE: "_offline"
};

export {
  SWAGGER_DEFAULT_RESPONSE_MESSAGES,
  HTTP_STATUS_CODE,
  USER_TYPE,
  DB_MODEL_REF,
  DEVICE_TYPE,
  GENDER,
  STATUS,
  VALIDATION_CRITERIA,
  VALIDATION_MESSAGE,
  MESSAGES,
  MIME_TYPE,
  REGEX,
  TEMPLATES,
  JOB_SCHEDULER_TYPE,
  LANGUAGES,
  TOKEN_TYPE,
  timeZones,
  UPDATE_TYPE,
  DISTANCE_MULTIPLIER,
  fileUploadExts,
  CATEGORIES_STAUS,
  MODULES,
  MODULES_ID,
  ROLE_TITLES,
  PERMISSION,
  GEN_STATUS,
  THEME,
  SUB_TYPE,
  VISIBILITY,
  ENVIRONMENT,
  AWS_SECRET_MANGER,
  REDIS_PREFIX,
  DAY,
  CONTENT_STATUS,
  CONTENT_TYPE,
  MAIL_TYPE,
  GOAL_TYPE,
  GOAL_CATEGORY,
  TIME_TYPE,
  GENERATOR,
  CLIENT_LIMIT,
  USER_PREFERENCE,
  DASH_ACTIVITY,
  PAYMENT_STATUS,
  SUBSCRIPTION_STATUS,
  REDIS_KEY_PREFIX,
};
