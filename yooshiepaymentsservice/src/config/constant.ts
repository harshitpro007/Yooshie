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
  ASSISTANT: "ASSISTANT",
};

const DB_MODEL_REF = {
  ADMIN: "admins",
  LOGIN_HISTORY: "login_histories",
  USER: "users",
  USER_PAYMENTS: "payments",
  SUBSCRIPTIONS: "subscriptions",
  INAPP: "inapps",
};

const MODULES = {
  DASHBOARD: "Dashboard",
  USER_MANAGEMENT: "User Management",
  ROLE_MANAGEMENT: "Role Management",
  CASE_MANAGEMENT: "Case Management",
  // HOLIDAY_MANAGEMENT: "Holiday Management"
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
  // HOLIDAY_MANAGEMENT: "5",
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
  COMPLETED: {
    NUMBER: 2,
    TYPE: "COMPLETED",
    DISPLAY_NAME: "Completed",
  },
  CANCELLED: {
    NUMBER: 3,
    TYPE: "CANCELLED",
    DISPLAY_NAME: "Cancelled",
  },
  PENDING: {
    NUMBER: 4,
    TYPE: "PENDING",
    DISPLAY_NAME: "Pending",
  },
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

const NOTIFICATION_MSG = {
  CREATED_SHIFT: "New shift activity created for you",
  SHIFT_ACTIVITY_FINISH_NOTIFICATION: "You mush be finish the activity",
  GROUP_ACTIVITY_FINISH_NOTIFICATION: "You mush be finish the activity",
};
const NOTIFICATION_TITLE = {
  CREATE_SHIFT: "Create Shift Activity",
  SHIFT_FINISH_NOTIFICATION: "Shift activity finish",
  GROUP_FINISH_NOTIFICATION: "Group activity finish",
};

const VALIDATION_MESSAGE = {
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
    TOKEN_EXPIRED: {
      statusCode: HTTP_STATUS_CODE.UNAUTHORIZED,
      type: "TOKEN_EXPIRED",
    },
    TOKEN_GENERATE_ERROR: {
      statusCode: HTTP_STATUS_CODE.BAD_REQUEST,
      type: "TOKEN_GENERATE_ERROR",
    },
    BLOCKED: {
      statusCode: HTTP_STATUS_CODE.UNAUTHORIZED,
      type: "BLOCKED",
    },
    INVALID_TOKEN: (value) => {
      return {
        statusCode: HTTP_STATUS_CODE.BAD_REQUEST,
        type: "ERROR",
        message: value,
      };
    },
    BLOCKED_MOBILE: {
      statusCode: HTTP_STATUS_CODE.UNAUTHORIZED,
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
    INVALID_RECEIPT: {
      statusCode: HTTP_STATUS_CODE.BAD_REQUEST,
      type: "INVALID_RECEIPT",
    },
    RECEIPT_ALREADY_EXIST: {
      statusCode: HTTP_STATUS_CODE.BAD_REQUEST,
      type: "RECEIPT_ALREADY_EXIST",
    },
    YOU_ARE_NOT_AUTHORIZED: {
      statusCode: HTTP_STATUS_CODE.BAD_REQUEST,
      type: "YOU_ARE_NOT_AUTHORIZED",
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
        message:EN_FIELD_REQUIRED.replace(/{value}/g, value),
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
        message:EN_SERVER_IS_IN_MAINTENANCE,
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
    INVALID_ADMIN: {
      statusCode: HTTP_STATUS_CODE.UNAUTHORIZED,

      type: "INVALID_ADMIN",
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
    TRANSACTION_LIST: (data) => {
      return {
        statusCode: HTTP_STATUS_CODE.OK,
        type: "TRANSACTION_LIST",
        ...data,
      };
    },
    TRANSACTIONS_AND_SUBSCRIPTION_DATA: (data) => {
      return {
        statusCode: HTTP_STATUS_CODE.OK,
        type: "TRANSACTIONS_AND_SUBSCRIPTION_DATA",
        data,
      };
    },
    SUBSCRIBED_USER_LIST: (data) => {
      return {
        statusCode: HTTP_STATUS_CODE.OK,
        type: "SUBSCRIBED_USER_LIST",
        ...data,
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
    BLOCK_USER: {
      statusCode: HTTP_STATUS_CODE.OK,
      type: "BLOCK_USER",
    },
    UNBLOCK_USER: {
      statusCode: HTTP_STATUS_CODE.OK,
      type: "UNBLOCK_USER",
    },
    EDIT_PAYMENT_DETAILS: {
      statusCode: HTTP_STATUS_CODE.OK,
      type: "EDIT_PAYMENT_DETAILS",
    },
    IOS_TOKEN_VERIFY: (data) => {
      return {
        statusCode: HTTP_STATUS_CODE.OK,
        type: "IOS_TOKEN_VERIFY",
        data: data,
      };
    },
    ANDROID_TOKEN_VERIFY: (data) => {
      return {
        statusCode: HTTP_STATUS_CODE.OK,
        type: "ANDROID_TOKEN_VERIFY",
        data: data,
      };
    },
    TRIAL_PLAN_PURCHASED_SUCCESSFULLY: {
      statusCode: HTTP_STATUS_CODE.OK,
      type: "TRIAL_PLAN_PURCHASED_SUCCESSFULLY",
    }
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
    // BCC_MAIL: [""],
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
  // EMAIL: /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,63}$/,
  EMAIL: /^\w+([.-]?\w+)*@\w+([.-]?\w+)*\.\w{2,}$/i,
  // EMAIL: /^(([^<>()\[\]\\.,;:\s@']+(\.[^<>()\[\]\\.,;:\s@']+)*)|('.+'))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
  /* URL: /^(http?|ftp|https):\/\/([a-zA-Z0-9.-]+(:[a-zA-Z0-9.&%$-]+)*@)*((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9][0-9]?)(\.(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])){3}|([a-zA-Z0-9-]+\.)*[a-zA-Z0-9-]+\.(com|edu|gov|\
		int|mil|net|org|biz|arpa|info|name|pro|aero|coop|museum|[a-zA-Z]{2}))(:[0-9]+)*(\/($|[a-zA-Z0-9.,?'\\+&%$#=~_-]+))*$/, */
  URL: /^(https?|http|ftp|torrent|image|irc):\/\/(-\.)?([^\s\/?\.#-]+\.?)+(\/[^\s]*)?$/i,
  SSN: /^(?!219-09-9999|078-05-1120)(?!666|000|9\d{2})\d{3}-(?!00)\d{2}-(?!0{4})\d{4}$/, // US SSN
  ZIP_CODE: /^[0-9]{5}(?:-[0-9]{4})?$/,
  PASSWORD:
    /(?=[^A-Z]*[A-Z])(?=[^a-z]*[a-z])(?=.*[@*%&])(?=[^0-9]*[0-9]).{8,16}/, // Minimum 6 characters, At least 1 lowercase alphabetical character, At least 1 uppercase alphabetical character, At least 1 numeric character, At least one special character
  COUNTRY_CODE: /^\d{1,4}$/,
  MOBILE_NUMBER: /^\d{6,16}$/,
  STRING_REPLACE: /[-+ ()*_$#@!{}|\/^%`~=?,.<>:;'"]/g,
  SEARCH: /[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g,
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

const SUBSCRIPTIONS_PLAN = {
  MONTHLY: "Monthly",
  YEARLY: "Yearly",
  TRIAL: "Trial",
};

const PLANS = {
  MONTHLY: "Monthly",
  YEARLY: "Yearly",
  TRAIL: "Trial",
};

const SUBSCRIPTION_AMOUNT = {
  MONTH: 3.99,
  YEAR: 29.99,
  TRIAL: 0,
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

const SUBSCRIPTION_DURATION = {
  MONTH: "monthlysubscription",
  YEAR: "yearlysubscription",
  TRIAL: "freetrailsubscription",
};

const SUBSCRIPTION_DURATION_ANDROID = {
  MONTH: "monthlysubscription",
  YEAR: "yearlysubscription",
  TRIAL: "freetrailsubscription",
};

const REDIS_KEY_PREFIX = {
  SUBSCRIBED: "_subscribed",
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
  LANGUAGES,
  TOKEN_TYPE,
  timeZones,
  UPDATE_TYPE,
  CATEGORIES_STAUS,
  MODULES,
  fileUploadExts,
  MODULES_ID,
  PERMISSION,
  GEN_STATUS,
  THEME,
  SUB_TYPE,
  VISIBILITY,
  ENVIRONMENT,
  AWS_SECRET_MANGER,
  SUBSCRIPTION_STATUS,
  SUBSCRIPTION_AMOUNT,
  PLANS,
  SUBSCRIPTIONS_PLAN,
  PAYMENT_STATUS,
  SUBSCRIPTION_DURATION_ANDROID,
  SUBSCRIPTION_DURATION,
  REDIS_KEY_PREFIX,
};
