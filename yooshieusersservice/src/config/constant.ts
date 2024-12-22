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
  ASSISTANT: "ASSISTANT",
  USER: "USER",
};

const MAX_DAILY_POINTS = 25;

const DB_MODEL_REF = {
  ADMIN: "admins",
  LOGIN_HISTORY: "login_histories",
  USER: "users",
  REWARD: "reward",
  REWARD_HISTORY: "reward_histories",
  TASK: "task",
  CONTACT: "contacts",
  GOAL: "goal",
  BUDGET: "budget",
  CALENDER: "calender",
};
const CAL_TYPE = {
  GOOGLE: "GOOGLE",
  APPLE: "APPLE",
};

const REWARD_EVENTS = {
  TASK: "Task",
  GOAL: "Goal",
  BUDGET: "Budget",
  LOGIN: "Login",
  PURCHASE: "Purchase",
};

const REWARD_MSG = {
  Daily_Check_In: "Daily Check In",
  Weekly_Login_Streak: "Weekly Login Streak",
  Budget_Successfully_Met: "Budget Successfully Met",
  Complete_a_Goal_Early: "Complete a Goal Early",
  Goal_Completion_On_Time: "Goal Completion On Time",
  Task_Completion_On_Time: "Task Completion On Time",
};

const MODULES = {
  DASHBOARD: "Dashboard",
  USER_MANAGEMENT: "User Management",
  ROLE_MANAGEMENT: "Role Management",
  CASE_MANAGEMENT: "Case Management",
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
  MALE: "Male",
  FEMALE: "Female",
  OTHER: "Other",
};

const USER_PREFERENCE = {
  WELCOME_CALL: "WELCOME_CALL",
  IN_APP_MESSAGE: "IN_APP_MESSAGE",
  EMAIL_INTRO: "EMAIL_INTRO",
  TEXT_MESSAGE: "TEXT_MESSAGE",
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
  // march 14 - natasha
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
  TEMPORARY_ACCOUNT_BLOCKED: "temporary_account_blocked",
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
  invalidId: {
    pattern: "Invalid Id.",
  },
  mobileNo: {
    pattern: "Please enter a valid 10-digit mobile number",
  },
  email: {
    pattern: "Please enter a valid email address",
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
    TOKEN_EXPIRED: {
      statusCode: HTTP_STATUS_CODE.UNAUTHORIZED,
      type: "TOKEN_EXPIRED",
    },
    TOKEN_GENERATE_ERROR: {
      statusCode: HTTP_STATUS_CODE.BAD_REQUEST,
      type: "TOKEN_GENERATE_ERROR",
    },
    BLOCKED: {
      statusCode: HTTP_STATUS_CODE.BAD_REQUEST,
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
      statusCode: HTTP_STATUS_CODE.BAD_REQUEST,
      type: "BLOCKED_MOBILE",
    },
    SESSION_EXPIRED: {
      statusCode: HTTP_STATUS_CODE.UNAUTHORIZED,
      type: "SESSION_EXPIRED",
    },
    FAV_USER_NOT_FOUND: {
      statusCode: HTTP_STATUS_CODE.FAV_USER_NOT_FOUND,
      type: "FAV_NOT_FOUND",
    },
    ERROR: (value, code = HTTP_STATUS_CODE.BAD_REQUEST) => {
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
    MOBILE_NO_ALREADY_EXIST_IN_CONTACTS: {
      statusCode: HTTP_STATUS_CODE.BAD_REQUEST,
      type: "MOBILE_NO_ALREADY_EXIST_IN_CONTACTS",
    },
    EMAIL_ALREADY_EXIST_IN_CONTACTS: {
      statusCode: HTTP_STATUS_CODE.BAD_REQUEST,
      type: "EMAIL_ALREADY_EXIST_IN_CONTACTS",
    },
    CONTACT_NOT_FOUND:{
      statusCode: HTTP_STATUS_CODE.BAD_REQUEST,
      type: "CONTACT_NOT_FOUND",
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
    MOBILE_NO_NOT_VERIFIED: {
      statusCode: HTTP_STATUS_CODE.MOBILE_NOT_VERIFIED,
      type: "MOBILE_NO_NOT_VERIFIED",
    },
    MOBILE_NO_ALREADY_EXIST: {
      statusCode: HTTP_STATUS_CODE.BAD_REQUEST,
      type: "MOBILE_NO_ALREADY_EXIST",
    },
    NOTIFICATION_NOT_EXIT: {
      statusCode: HTTP_STATUS_CODE.BAD_REQUEST,
      type: "NOTIFICATION_NOT_EXIT",
    },
    LIMIT_EXCEEDS: {
      statusCode: HTTP_STATUS_CODE.ACCESS_FORBIDDEN,
      type: "LIMIT_EXCEEDS",
    },
    INVALID_ADMIN: {
      statusCode: HTTP_STATUS_CODE.BAD_REQUEST,
      type: "INVALID_ADMIN",
    },
    INVALID_USER: {
      statusCode: HTTP_STATUS_CODE.BAD_REQUEST,
      type: "INVALID_USER",
    },

    PURCHASE_NOT_VALID: {
      statusCode: HTTP_STATUS_CODE.BAD_REQUEST,
      type: "PURCHASE_NOT_VALID",
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
    CHANGE_PASSWORD: {
      statusCode: HTTP_STATUS_CODE.OK,
      type: "CHANGE_PASSWORD",
    },
    EDIT_PROFILE: (data) => {
      return {
        statusCode: HTTP_STATUS_CODE.OK,
        type: "EDIT_PROFILE",
        data: data,
      };
    },
    EDIT_PROFILE_PICTURE: {
      statusCode: HTTP_STATUS_CODE.OK,
      type: "EDIT_PROFILE_PICTURE",
    },
    PROFILE_SETTINGS: {
      statusCode: HTTP_STATUS_CODE.OK,
      type: "PROFILE_SETTINGS",
    },
    LOGOUT: {
      statusCode: HTTP_STATUS_CODE.OK,
      type: "LOGOUT",
    },
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
    CONTACT_ADDED: {
      statusCode: HTTP_STATUS_CODE.OK,
      type: "CONTACT_ADDED",
    },
    CONTACT_UPDATED:{
      statusCode: HTTP_STATUS_CODE.OK,
      type: "CONTACT_UPDATED",
    },
    CONTACT_DELETED:{
      statusCode: HTTP_STATUS_CODE.OK,
      type: "CONTACT_DELETED",
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
    EMAIL_UPLOAD: {
      statusCode: HTTP_STATUS_CODE.OK,
      type: "EMAIL_UPLOAD",
    },
    FORGOT_PASSWORD: {
      statusCode: HTTP_STATUS_CODE.OK,
      message: "Reset Password OTP has been sent.",
      type: "FORGOT_PASSWORD",
    },
    DELETE_CATEGORY: {
      statusCode: HTTP_STATUS_CODE.UPDATED,
      message: "Category has been deleted successfully.",
      type: "DELETE_CATEGORY",
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

    TASK_REWARD: {
      statusCode: HTTP_STATUS_CODE.UPDATED,
      message: "Task reward points updated.",
      type: "TASK_REWARD",
    },
    GOAL_REWARD: {
      statusCode: HTTP_STATUS_CODE.UPDATED,
      message: "Goal reward points updated.",
      type: "GOAL_REWARD",
    },
    PURCHASE_REWARD: {
      statusCode: HTTP_STATUS_CODE.UPDATED,
      message: "Purchase reward points updated.",
      type: "PURCHASE_REWARD",
    },
    BUDGET_REWARD: {
      statusCode: HTTP_STATUS_CODE.OK,
      message: "Budget reward points updated.",
      type: "BUDGET_REWARD",
    },

    LISTING: (data) => {
      return {
        statusCode: HTTP_STATUS_CODE.OK,
        type: "DEFAULT",
        data: data,
      };
    },
    RESEND_REINVITE: {
      statusCode: HTTP_STATUS_CODE.UPDATED,
      type: "RESEND_REINVITE",
    },
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
    /(?=[^A-Z]*[A-Z])(?=[^a-z]*[a-z])(?=.*[@*%&])(?=[^0-9]*[0-9]).{8,16}/, // NOSONAR // Minimum 6 characters, At least 1 lowercase alphabetical character, At least 1 uppercase alphabetical character, At least 1 numeric character, At least one special character
  COUNTRY_CODE: /^\d{1,4}$/,
  MOBILE_NUMBER: /^\d{6,16}$/,
  STRING_REPLACE: /[-+ ()*_$#@!{}|\/^%`~=?,.<>:;'"]/g, // NOSONAR
  SEARCH: /[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, // NOSONAR
  MONGO_ID: /^[a-f\d]{24}$/i,
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
  COMPLETED: "COMPLETED",
};

const REDIS_PREFIX = {
  OTP_ATTEMP: "_attemp",
  RESET_ATTEMP: "_reset",
  INVITE: "_invite",
};

const MAIL_TYPE = {
  VERIFY_EMAIL: "VERIFY_EMAIL",
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

const OFFLINE_STATUS = {
  TRUE: true,
  FALSE: false,
};

const REDIS_KEY_PREFIX = {
  OFFLINE: "_offline",
  MUTE_CHAT: "_mutechat",
  MUTE_INAPP_CAHT: "_muteinappchat"
};

const TIME_TYPE = {
  WEEKLY: "Weekly",
  MONTHLY: "Monthly",
  YEARLY: "Yearly",
};

export {
  SWAGGER_DEFAULT_RESPONSE_MESSAGES,
  HTTP_STATUS_CODE,
  USER_TYPE,
  DB_MODEL_REF,
  DEVICE_TYPE,
  GENDER,
  STATUS,
  JOB_SCHEDULER_TYPE,
  VALIDATION_CRITERIA,
  VALIDATION_MESSAGE,
  MESSAGES,
  MIME_TYPE,
  REGEX,
  LANGUAGES,
  TOKEN_TYPE,
  timeZones,
  UPDATE_TYPE,
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
  REDIS_PREFIX,
  MAIL_TYPE,
  GENERATOR,
  USER_PREFERENCE,
  MAX_DAILY_POINTS,
  TIME_TYPE,
  GOAL_CATEGORY,
  CAL_TYPE,
  REWARD_EVENTS,
  REWARD_MSG,
  OFFLINE_STATUS,
  REDIS_KEY_PREFIX,
};
