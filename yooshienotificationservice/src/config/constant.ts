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

const NOTIFICATION = (type, data?) => {
  // console.log(':::::::::::::::::;',data.userName,'??????????????')
  switch (type) {
    case "ADMIN_NOTIFICATION":
      return {
        type: NOTIFICATION_TYPE.ADMIN_NOTIFICATION,
        body: data.description,
        title: data.title,
        message: data.description,
        details: data?.details ? data.details : {},
      };
    case "ADD_NEW_TASK_ASSISTANT":
      return {
        type: NOTIFICATION_TYPE.ADD_NEW_TASK_ASSISTANT,
        title: NOTIFICATION_TITLE.ADD_NEW_TASK_ASSISTANT,
        body:
          NOTIFICATION_MSG.ADD_NEW_TASK_ASSISTANT +
          " " +
          `${data?.details.title}`,
        message:
          NOTIFICATION_MSG.ADD_NEW_TASK_ASSISTANT +
          " " +
          `${data?.details.title}`,
        details: data?.details ? data.details : {},
      };
    case "NEW_TASK_SHARED":
      return {
        type: NOTIFICATION_TYPE.NEW_TASK_SHARED,
        title: NOTIFICATION_TITLE.NEW_TASK_SHARED,
        body:
          `${data?.details.clientName}` + " " + NOTIFICATION_MSG.NEW_TASK_SHARED +
          " " +
          `${data?.details.title}`,
        message:
          `${data?.details.clientName}` + " " + NOTIFICATION_MSG.NEW_TASK_SHARED +
          " " +
          `${data?.details.title}`,
        details: data?.details ? data.details : {},
      };
    case "ADD_NEW_TASK_USER":
      return {
        type: NOTIFICATION_TYPE.ADD_NEW_TASK_USER,
        title: NOTIFICATION_TITLE.ADD_NEW_TASK_USER,
        body:
          data.userName +
          " " +
          NOTIFICATION_MSG.ADD_NEW_TASK_USER +
          " " +
          `${data?.details.title}`,
        message:
          data.userName +
          " " +
          NOTIFICATION_MSG.ADD_NEW_TASK_USER +
          " " +
          `${data?.details.title}`,
        details: data?.details ? data.details : {},
      };
    case "UPDATE_TASK_ASSISTANT":
      return {
        type: NOTIFICATION_TYPE.UPDATE_TASK_ASSISTANT,
        title: NOTIFICATION_TITLE.UPDATE_TASK_ASSISTANT,
        body: NOTIFICATION_MSG.UPDATE_TASK_ASSISTANT,
        message: NOTIFICATION_MSG.UPDATE_TASK_ASSISTANT,
        details: data?.details ? data.details : {},
      };
    case "UPDATE_TASK_USER":
      return {
        type: NOTIFICATION_TYPE.UPDATE_TASK_USER,
        title: NOTIFICATION_TITLE.UPDATE_TASK_USER,
        body:
          data.userName +
          " " +
          NOTIFICATION_MSG.UPDATE_TASK_USER +
          " " +
          `${data?.details.title}`,
        message:
          data.userName +
          " " +
          NOTIFICATION_MSG.UPDATE_TASK_USER +
          " " +
          `${data?.details.title}`,
        details: data?.details ? data.details : {},
      };
    case "TASK_MARKED_COMPLETED_ASSISTANT":
      return {
        type: NOTIFICATION_TYPE.TASK_MARKED_COMPLETED_ASSISTANT,
        title: NOTIFICATION_TITLE.TASK_MARKED_COMPLETED_ASSISTANT,
        body: NOTIFICATION_MSG.TASK_MARKED_COMPLETED_ASSISTANT,
        message: NOTIFICATION_MSG.TASK_MARKED_COMPLETED_ASSISTANT,
        details: data?.details ? data.details : {},
      };
    case "DELETE_TASK_ASSISTANT":
      return {
        type: NOTIFICATION_TYPE.DELETE_TASK_ASSISTANT,
        title: NOTIFICATION_TITLE.DELETE_TASK_ASSISTANT,
        body: NOTIFICATION_MSG.DELETE_TASK_ASSISTANT,
        message: NOTIFICATION_MSG.DELETE_TASK_ASSISTANT,
        details: data?.details ? data.details : {},
      };
    case "DELETE_TASK_USER":
      return {
        type: NOTIFICATION_TYPE.DELETE_TASK_USER,
        title: NOTIFICATION_TITLE.DELETE_TASK_USER,
        body:
          data.userName +
          " " +
          NOTIFICATION_MSG.DELETE_TASK_USER +
          " " +
          `${data?.details.title}`,
        message:
          data.userName +
          " " +
          NOTIFICATION_MSG.DELETE_TASK_USER +
          " " +
          `${data?.details.title}`,
        details: data?.details ? data.details : {},
      };
    case "ADD_NEW_GOAL_ASSISTANT":
      return {
        type: NOTIFICATION_TYPE.ADD_NEW_GOAL_ASSISTANT,
        title: NOTIFICATION_TITLE.ADD_NEW_GOAL_ASSISTANT,
        body:
          NOTIFICATION_MSG.ADD_NEW_GOAL_ASSISTANT +
          " " +
          `${data?.details.title}`,
        message:
          NOTIFICATION_MSG.ADD_NEW_GOAL_ASSISTANT +
          " " +
          `${data?.details.title}`,
        details: data?.details ? data.details : {},
      };
    case "ADD_NEW_GOAL_USER":
      return {
        type: NOTIFICATION_TYPE.ADD_NEW_GOAL_USER,
        title: NOTIFICATION_TITLE.ADD_NEW_GOAL_USER,
        body:
          data.userName +
          " " +
          NOTIFICATION_MSG.ADD_NEW_GOAL_USER +
          " " +
          `${data?.details.title}`,
        message:
          data.userName +
          " " +
          NOTIFICATION_MSG.ADD_NEW_GOAL_USER +
          " " +
          `${data?.details.title}`,
        details: data?.details ? data.details : {},
      };
    case "UPDATE_GOAL_ASSISTANT":
      return {
        type: NOTIFICATION_TYPE.UPDATE_GOAL_ASSISTANT,
        title: NOTIFICATION_TITLE.UPDATE_GOAL_ASSISTANT,
        body: NOTIFICATION_MSG.UPDATE_GOAL_ASSISTANT,
        message: NOTIFICATION_MSG.UPDATE_GOAL_ASSISTANT,
        details: data?.details ? data.details : {},
      };
    case "UPDATE_GOAL_USER":
      return {
        type: NOTIFICATION_TYPE.UPDATE_GOAL_USER,
        title: NOTIFICATION_TITLE.UPDATE_GOAL_USER,
        body:
          data.userName +
          " " +
          NOTIFICATION_MSG.UPDATE_GOAL_USER +
          " " +
          `${data?.details.title}`,
        message:
          data.userName +
          " " +
          NOTIFICATION_MSG.UPDATE_GOAL_USER +
          " " +
          `${data?.details.title}`,
        details: data?.details ? data.details : {},
      };
    case "GOAL_MARKED_COMPLETED_ASSISTANT":
      return {
        type: NOTIFICATION_TYPE.GOAL_MARKED_COMPLETED_ASSISTANT,
        title: NOTIFICATION_TITLE.GOAL_MARKED_COMPLETED_ASSISTANT,
        body: NOTIFICATION_MSG.GOAL_MARKED_COMPLETED_ASSISTANT,
        message: NOTIFICATION_MSG.GOAL_MARKED_COMPLETED_ASSISTANT,
        details: data?.details ? data.details : {},
      };
    case "DELETE_GOAL_ASSISTANT":
      return {
        type: NOTIFICATION_TYPE.DELETE_GOAL_ASSISTANT,
        title: NOTIFICATION_TITLE.DELETE_GOAL_ASSISTANT,
        body: NOTIFICATION_MSG.DELETE_GOAL_ASSISTANT,
        message: NOTIFICATION_MSG.DELETE_GOAL_ASSISTANT,
        details: data?.details ? data.details : {},
      };
    case "DELETE_GOAL_USER":
      return {
        type: NOTIFICATION_TYPE.DELETE_GOAL_USER,
        title: NOTIFICATION_TITLE.DELETE_GOAL_USER,
        body:
          data.userName +
          " " +
          NOTIFICATION_MSG.DELETE_GOAL_USER +
          " " +
          `${data?.details.title}`,
        message:
          data.userName +
          " " +
          NOTIFICATION_MSG.DELETE_GOAL_USER +
          " " +
          `${data?.details.title}`,
        details: data?.details ? data.details : {},
      };
    case "ADD_NEW_REMINDER_ASSISTANT":
      return {
        type: NOTIFICATION_TYPE.ADD_NEW_REMINDER_ASSISTANT,
        title: NOTIFICATION_TITLE.ADD_NEW_REMINDER_ASSISTANT,
        body:
          NOTIFICATION_MSG.ADD_NEW_REMINDER_ASSISTANT +
          " " +
          `${data?.details.title}`,
        message:
          NOTIFICATION_MSG.ADD_NEW_REMINDER_ASSISTANT +
          " " +
          `${data?.details.title}`,
        details: data?.details ? data.details : {},
      };
    case "ADD_NEW_REMINDER_USER":
      return {
        type: NOTIFICATION_TYPE.ADD_NEW_REMINDER_USER,
        title: NOTIFICATION_TITLE.ADD_NEW_REMINDER_USER,
        body:
          data.userName +
          " " +
          NOTIFICATION_MSG.ADD_NEW_REMINDER_USER +
          " " +
          `${data?.details.title}`,
        message:
          data.userName +
          " " +
          NOTIFICATION_MSG.ADD_NEW_REMINDER_USER +
          " " +
          `${data?.details.title}`,
        details: data?.details ? data.details : {},
      };
    case "UPDATE_REMINDER_ASSISTANT":
      return {
        type: NOTIFICATION_TYPE.UPDATE_REMINDER_ASSISTANT,
        title: NOTIFICATION_TITLE.UPDATE_REMINDER_ASSISTANT,
        body: NOTIFICATION_MSG.UPDATE_REMINDER_ASSISTANT,
        message: NOTIFICATION_MSG.UPDATE_REMINDER_ASSISTANT,
        details: data?.details ? data.details : {},
      };
    case "UPDATE_REMINDER_USER":
      return {
        type: NOTIFICATION_TYPE.UPDATE_REMINDER_USER,
        title: NOTIFICATION_TITLE.UPDATE_REMINDER_USER,
        body:
          data.userName +
          " " +
          NOTIFICATION_MSG.UPDATE_REMINDER_USER +
          " " +
          `${data?.details.title}`,
        message:
          data.userName +
          " " +
          NOTIFICATION_MSG.UPDATE_REMINDER_USER +
          " " +
          `${data?.details.title}`,
        details: data?.details ? data.details : {},
      };
    case "REMINDER_MARKED_COMPLETED_ASSISTANT":
      return {
        type: NOTIFICATION_TYPE.REMINDER_MARKED_COMPLETED_ASSISTANT,
        title: NOTIFICATION_TITLE.REMINDER_MARKED_COMPLETED_ASSISTANT,
        body: NOTIFICATION_MSG.REMINDER_MARKED_COMPLETED_ASSISTANT,
        message: NOTIFICATION_MSG.REMINDER_MARKED_COMPLETED_ASSISTANT,
        details: data?.details ? data.details : {},
      };
    case "DELETE_REMINDER_ASSISTANT":
      return {
        type: NOTIFICATION_TYPE.DELETE_REMINDER_ASSISTANT,
        title: NOTIFICATION_TITLE.DELETE_REMINDER_ASSISTANT,
        body: NOTIFICATION_MSG.DELETE_REMINDER_ASSISTANT,
        message: NOTIFICATION_MSG.DELETE_REMINDER_ASSISTANT,
        details: data?.details ? data.details : {},
      };
    case "DELETE_REMINDER_USER":
      return {
        type: NOTIFICATION_TYPE.DELETE_REMINDER_USER,
        title: NOTIFICATION_TITLE.DELETE_REMINDER_USER,
        body:
          data.userName +
          " " +
          NOTIFICATION_MSG.DELETE_REMINDER_USER +
          " " +
          `${data?.details.title}`,
        message:
          data.userName +
          " " +
          NOTIFICATION_MSG.DELETE_REMINDER_USER +
          " " +
          `${data?.details.title}`,
        details: data?.details ? data.details : {},
      };
    case "ADD_NEW_BUDGET_ASSISTANT":
      return {
        type: NOTIFICATION_TYPE.ADD_NEW_BUDGET_ASSISTANT,
        title: NOTIFICATION_TITLE.ADD_NEW_BUDGET_ASSISTANT,
        body:
          NOTIFICATION_MSG.ADD_NEW_BUDGET_ASSISTANT +
          " " +
          `${data?.details.title}`,
        message:
          NOTIFICATION_MSG.ADD_NEW_BUDGET_ASSISTANT +
          " " +
          `${data?.details.title}`,
        details: data?.details ? data.details : {},
      };
    case "ADD_NEW_BUDGET_USER":
      return {
        type: NOTIFICATION_TYPE.ADD_NEW_BUDGET_USER,
        title: NOTIFICATION_TITLE.ADD_NEW_BUDGET_USER,
        body:
          data.userName +
          " " +
          NOTIFICATION_MSG.ADD_NEW_BUDGET_USER +
          " " +
          `${data?.details.title}`,
        message:
          data.userName +
          " " +
          NOTIFICATION_MSG.ADD_NEW_BUDGET_USER +
          " " +
          `${data?.details.title}`,
        details: data?.details ? data.details : {},
      };
    case "UPDATE_BUDGET_ASSISTANT":
      return {
        type: NOTIFICATION_TYPE.UPDATE_BUDGET_ASSISTANT,
        title: NOTIFICATION_TITLE.UPDATE_BUDGET_ASSISTANT,
        body: NOTIFICATION_MSG.UPDATE_BUDGET_ASSISTANT,
        message: NOTIFICATION_MSG.UPDATE_BUDGET_ASSISTANT,
        details: data?.details ? data.details : {},
      };
    case "UPDATE_BUDGET_USER":
      return {
        type: NOTIFICATION_TYPE.UPDATE_BUDGET_USER,
        title: NOTIFICATION_TITLE.UPDATE_BUDGET_USER,
        body:
          data.userName +
          " " +
          NOTIFICATION_MSG.UPDATE_BUDGET_USER +
          " " +
          `${data?.details.title}`,
        message:
          data.userName +
          " " +
          NOTIFICATION_MSG.UPDATE_BUDGET_USER +
          " " +
          `${data?.details.title}`,
        details: data?.details ? data.details : {},
      };
    case "BUDGET_MARKED_COMPLETED_ASSISTANT":
      return {
        type: NOTIFICATION_TYPE.BUDGET_MARKED_COMPLETED_ASSISTANT,
        title: NOTIFICATION_TITLE.BUDGET_MARKED_COMPLETED_ASSISTANT,
        body: NOTIFICATION_MSG.BUDGET_MARKED_COMPLETED_ASSISTANT,
        message: NOTIFICATION_MSG.BUDGET_MARKED_COMPLETED_ASSISTANT,
        details: data?.details ? data.details : {},
      };
    case "DELETE_BUDGET_ASSISTANT":
      return {
        type: NOTIFICATION_TYPE.DELETE_BUDGET_ASSISTANT,
        title: NOTIFICATION_TITLE.DELETE_BUDGET_ASSISTANT,
        body: NOTIFICATION_MSG.DELETE_BUDGET_ASSISTANT,
        message: NOTIFICATION_MSG.DELETE_BUDGET_ASSISTANT,
        details: data?.details ? data.details : {},
      };
    case "DELETE_BUDGET_USER":
      return {
        type: NOTIFICATION_TYPE.DELETE_BUDGET_USER,
        title: NOTIFICATION_TITLE.DELETE_BUDGET_USER,
        body:
          data.userName +
          " " +
          NOTIFICATION_MSG.DELETE_BUDGET_USER +
          " " +
          `${data?.details.title}`,
        message:
          data.userName +
          " " +
          NOTIFICATION_MSG.DELETE_BUDGET_USER +
          " " +
          `${data?.details.title}`,
        details: data?.details ? data.details : {},
      };
    case "UPCOMING_TASKS":
      return {
        type: NOTIFICATION_TYPE.UPCOMING_TASKS,
        title: NOTIFICATION_TITLE.UPCOMING_TASKS,
        body: data.userType == USER_TYPE.ASSISTANT ? data?.details.clientName + " " + `Task ${data?.details.title}` + " " + NOTIFICATION_MSG.UPCOMING_TASKS_ASSISTANT: NOTIFICATION_MSG.UPCOMING_TASKS,
        message: data.userType == USER_TYPE.ASSISTANT ? data?.details.clientName + " " + `Task ${data?.details.title}` + " " + NOTIFICATION_MSG.UPCOMING_TASKS_ASSISTANT: NOTIFICATION_MSG.UPCOMING_TASKS,
        details: data?.details ? data.details : {},
      };
    case "TODAY_TASKS":
      return {
        type: NOTIFICATION_TYPE.TODAY_TASKS,
        title: NOTIFICATION_TITLE.TODAY_TASKS,
        body: data.userType == USER_TYPE.ASSISTANT ? data?.details.clientName + " " + `Task ${data?.details.title}` + " " + NOTIFICATION_MSG.TODAY_TASKS_ASSISTANT: NOTIFICATION_MSG.TODAY_TASKS,
        message: data.userType == USER_TYPE.ASSISTANT ? data?.details.clientName + " " + `Task ${data?.details.title}` + " " + NOTIFICATION_MSG.TODAY_TASKS_ASSISTANT: NOTIFICATION_MSG.TODAY_TASKS,
        details: data?.details ? data.details : {},
      };
    case "OVERDUE_TASKS":
      return {
        type: NOTIFICATION_TYPE.OVERDUE_TASKS,
        title: NOTIFICATION_TITLE.OVERDUE_TASKS,
        body: data.userType == USER_TYPE.ASSISTANT ? data?.details.clientName + " " + `Task ${data?.details.title}` + " " + NOTIFICATION_MSG.OVERDUE_TASKS_ASSISTANT: NOTIFICATION_MSG.OVERDUE_TASKS,
        message: data.userType == USER_TYPE.ASSISTANT ? data?.details.clientName + " " + `Task ${data?.details.title}` + " " + NOTIFICATION_MSG.OVERDUE_TASKS_ASSISTANT: NOTIFICATION_MSG.OVERDUE_TASKS,
        details: data?.details ? data.details : {},
      };
    case "UPCOMING_GOALS":
      return {
        type: NOTIFICATION_TYPE.UPCOMING_GOALS,
        title: NOTIFICATION_TITLE.UPCOMING_GOALS,
        body: data.userType == USER_TYPE.ASSISTANT ? data?.details.clientName + " " + `Goal ${data?.details.title}` + " " + NOTIFICATION_MSG.UPCOMING_GOALS_ASSISTANT: NOTIFICATION_MSG.UPCOMING_GOALS,
        message: data.userType == USER_TYPE.ASSISTANT ? data?.details.clientName + " " + `Goal ${data?.details.title}` + " " + NOTIFICATION_MSG.UPCOMING_GOALS_ASSISTANT: NOTIFICATION_MSG.UPCOMING_GOALS,
        details: data?.details ? data.details : {},
      };
    case "TODAY_GOALS":
      return {
        type: NOTIFICATION_TYPE.TODAY_GOALS,
        title: NOTIFICATION_TITLE.TODAY_GOALS,
        body: data.userType == USER_TYPE.ASSISTANT ? data?.details.clientName + " " + `Goal ${data?.details.title}` + " " + NOTIFICATION_MSG.TODAY_GOALS_ASSISTANT: NOTIFICATION_MSG.TODAY_GOALS,
        message: data.userType == USER_TYPE.ASSISTANT ? data?.details.clientName + " " + `Goal ${data?.details.title}` + " " + NOTIFICATION_MSG.TODAY_GOALS_ASSISTANT: NOTIFICATION_MSG.TODAY_GOALS,
        details: data?.details ? data.details : {},
      };
    case "OVERDUE_GOALS":
      return {
        type: NOTIFICATION_TYPE.OVERDUE_GOALS,
        title: NOTIFICATION_TITLE.OVERDUE_GOALS,
        body: data.userType == USER_TYPE.ASSISTANT ? data?.details.clientName + " " + `Goal ${data?.details.title}` + " " + NOTIFICATION_MSG.OVERDUE_GOALS_ASSISTANT: NOTIFICATION_MSG.OVERDUE_GOALS,
        message: data.userType == USER_TYPE.ASSISTANT ? data?.details.clientName + " " + `Goal ${data?.details.title}` + " " + NOTIFICATION_MSG.OVERDUE_GOALS_ASSISTANT: NOTIFICATION_MSG.OVERDUE_GOALS,
        details: data?.details ? data.details : {},
      };
    case "UPCOMING_REMINDERS":
      return {
        type: NOTIFICATION_TYPE.UPCOMING_REMINDERS,
        title: NOTIFICATION_TITLE.UPCOMING_REMINDERS,
        body: data.userType == USER_TYPE.ASSISTANT ? data?.details.clientName + " " + `Reminder ${data?.details.title}` + " " + NOTIFICATION_MSG.UPCOMING_REMINDERS_ASSISTANT: NOTIFICATION_MSG.UPCOMING_REMINDERS,
        message: data.userType == USER_TYPE.ASSISTANT ? data?.details.clientName + " " + `Reminder ${data?.details.title}` + " " + NOTIFICATION_MSG.UPCOMING_REMINDERS_ASSISTANT: NOTIFICATION_MSG.UPCOMING_REMINDERS,
        details: data?.details ? data.details : {},
      };
    case "TODAY_REMINDERS":
      return {
        type: NOTIFICATION_TYPE.TODAY_REMINDERS,
        title: NOTIFICATION_TITLE.TODAY_REMINDERS,
        body: data.userType == USER_TYPE.ASSISTANT ? data?.details.clientName + " " + `Reminder ${data?.details.title}` + " " + NOTIFICATION_MSG.TODAY_REMINDERS_ASSISTANT: NOTIFICATION_MSG.TODAY_REMINDERS,
        message: data.userType == USER_TYPE.ASSISTANT ? data?.details.clientName + " " + `Reminder ${data?.details.title}` + " " + NOTIFICATION_MSG.TODAY_REMINDERS_ASSISTANT: NOTIFICATION_MSG.TODAY_REMINDERS,
        details: data?.details ? data.details : {},
      };
    case "OVERDUE_REMINDERS":
      return {
        type: NOTIFICATION_TYPE.OVERDUE_REMINDERS,
        title: NOTIFICATION_TITLE.OVERDUE_REMINDERS,
        body: data.userType == USER_TYPE.ASSISTANT ? data?.details.clientName + " " + `Reminder ${data?.details.title}` + " " + NOTIFICATION_MSG.OVERDUE_REMINDERS_ASSISTANT: NOTIFICATION_MSG.OVERDUE_REMINDERS,
        message: data.userType == USER_TYPE.ASSISTANT ? data?.details.clientName + " " + `Reminder ${data?.details.title}` + " " + NOTIFICATION_MSG.OVERDUE_REMINDERS_ASSISTANT: NOTIFICATION_MSG.OVERDUE_REMINDERS,
        details: data?.details ? data.details : {},
      };
    case "UPCOMING_BUDGETS":
      return {
        type: NOTIFICATION_TYPE.UPCOMING_BUDGETS,
        title: NOTIFICATION_TITLE.UPCOMING_BUDGETS,
        body: data.userType == USER_TYPE.ASSISTANT ? data?.details.clientName + " " + `Budget ${data?.details.title}` + " " + NOTIFICATION_MSG.UPCOMING_BUDGETS_ASSISTANT: NOTIFICATION_MSG.UPCOMING_BUDGETS,
        message: data.userType == USER_TYPE.ASSISTANT ? data?.details.clientName + " " + `Budget ${data?.details.title}` + " " + NOTIFICATION_MSG.UPCOMING_BUDGETS_ASSISTANT: NOTIFICATION_MSG.UPCOMING_BUDGETS,
        details: data?.details ? data.details : {},
      };
    case "TODAY_BUDGETS":
      return {
        type: NOTIFICATION_TYPE.TODAY_BUDGETS,
        title: NOTIFICATION_TITLE.TODAY_BUDGETS,
        body: data.userType == USER_TYPE.ASSISTANT ? data?.details.clientName + " " + `Budget ${data?.details.title}` + " " + NOTIFICATION_MSG.TODAY_BUDGETS_ASSISTANT: NOTIFICATION_MSG.TODAY_BUDGETS,
        message: data.userType == USER_TYPE.ASSISTANT ? data?.details.clientName + " " + `Budget ${data?.details.title}` + " " + NOTIFICATION_MSG.TODAY_BUDGETS_ASSISTANT: NOTIFICATION_MSG.TODAY_BUDGETS,
        details: data?.details ? data.details : {},
      };
    case "OVERDUE_BUDGETS":
      return {
        type: NOTIFICATION_TYPE.OVERDUE_BUDGETS,
        title: NOTIFICATION_TITLE.OVERDUE_BUDGETS,
        body: data.userType == USER_TYPE.ASSISTANT ? data?.details.clientName + " " + `Budget ${data?.details.title}` + " " + NOTIFICATION_MSG.OVERDUE_BUDGETS_ASSISTANT: NOTIFICATION_MSG.OVERDUE_BUDGETS,
        message: data.userType == USER_TYPE.ASSISTANT ? data?.details.clientName + " " + `Budget ${data?.details.title}` + " " + NOTIFICATION_MSG.OVERDUE_BUDGETS_ASSISTANT: NOTIFICATION_MSG.OVERDUE_BUDGETS,
        details: data?.details ? data.details : {},
      };
    default:
      return null; // Handle the default case or provide a default behavior
  }
};

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
  ALL: "ALL",
};

const DB_MODEL_REF = {
  ADMIN: "admins",
  LOGIN_HISTORY: "login_histories",
  USER: "users",
  ROLE: "roles",
  NOTIFICATION_LIST: "notification_lists",
  NOTIFICATION: "notifications",
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
  SECRET_NAME: `Yooshie-${process.env.NODE_ENV.trim()}-secrets`,
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
  ADD_NEW_TASK_ASSISTANT: "Your assistant has created a new Task:",
  ADD_NEW_TASK_USER: "has created a new Task:",
  NEW_TASK_SHARED: "has shared a new task with you:",
  UPDATE_TASK_ASSISTANT: "Your Task has been updated by your assistant.",
  UPDATE_TASK_USER: "has updated the Task:",
  TASK_MARKED_COMPLETED_ASSISTANT: "Your Task has been successfully marked as completed by your assistant.",
  DELETE_TASK_ASSISTANT: "Your Task has been deleted by your assistant.",
  DELETE_TASK_USER: "has deleted the Task:",
  ADD_NEW_GOAL_ASSISTANT: "Your assistant has created a new Goal:",
  ADD_NEW_GOAL_USER: "has created a new Goal:",
  UPDATE_GOAL_ASSISTANT: "Your Goal has been updated by your assistant.",
  UPDATE_GOAL_USER: "has updated the Goal:",
  GOAL_MARKED_COMPLETED_ASSISTANT: "Your Goal has been successfully marked as completed by your assistant.",
  DELETE_GOAL_ASSISTANT: "Your Goal has been deleted by your assistant.",
  DELETE_GOAL_USER: "has deleted the Goal:",
  ADD_NEW_REMINDER_ASSISTANT: "Your assistant has created a new Reminder:",
  ADD_NEW_REMINDER_USER: "has created a new Reminder:",
  UPDATE_REMINDER_ASSISTANT: "Your Reminder has been updated by your assistant.",
  UPDATE_REMINDER_USER: "has updated the Reminder:",
  REMINDER_MARKED_COMPLETED_ASSISTANT: "Your Reminder has been successfully marked as completed by your assistant.",
  DELETE_REMINDER_ASSISTANT: "Your Reminder has been deleted by your assistant.",
  DELETE_REMINDER_USER: "has deleted the Reminder:",
  ADD_NEW_BUDGET_ASSISTANT: "Your assistant has created a new Budget:",
  ADD_NEW_BUDGET_USER: "has created a new Budget:",
  UPDATE_BUDGET_ASSISTANT: "Your Budget has been updated by your assistant.",
  UPDATE_BUDGET_USER: "has updated the Budget:",
  BUDGET_MARKED_COMPLETED_ASSISTANT: "Your Budget has been successfully marked as completed by your assistant.",
  DELETE_BUDGET_ASSISTANT: "Your Budget has been deleted by your assistant.",
  DELETE_BUDGET_USER: "has deleted the Budget:",
  UPCOMING_TASKS: "Task is due tomorrow.",
  TODAY_TASKS: "Your Task is scheduled for today.",
  OVERDUE_TASKS: "Your Task is overdue. Please review.",
  UPCOMING_GOALS: "Goal is due tomorrow.",
  TODAY_GOALS: "Your Goal is scheduled for today.",
  OVERDUE_GOALS: "Your Goal is overdue. Please review.",
  UPCOMING_REMINDERS: "Reminder is due tomorrow.",
  TODAY_REMINDERS: "Your Reminder is scheduled for today.",
  OVERDUE_REMINDERS: "Your Reminder is overdue. Please review.",
  UPCOMING_BUDGETS: "Budget is due tomorrow.",
  TODAY_BUDGETS: "Your Budget is scheduled for today.",
  OVERDUE_BUDGETS: "Your Budget is overdue. Please review.",
  UPCOMING_TASKS_ASSISTANT: "is due tomorrow.",
  TODAY_TASKS_ASSISTANT: "is scheduled for today.",
  OVERDUE_TASKS_ASSISTANT: "is overdue. Please follow up.",
  UPCOMING_GOALS_ASSISTANT: "is due tomorrow.",
  TODAY_GOALS_ASSISTANT: "is scheduled for today.",
  OVERDUE_GOALS_ASSISTANT: "is overdue. Please follow up.",
  UPCOMING_REMINDERS_ASSISTANT: "is due tomorrow.",
  TODAY_REMINDERS_ASSISTANT: "is scheduled for today.",
  OVERDUE_REMINDERS_ASSISTANT: "is overdue. Please follow up.",
  UPCOMING_BUDGETS_ASSISTANT: "is due tomorrow.",
  TODAY_BUDGETS_ASSISTANT: "is scheduled for today.",
  OVERDUE_BUDGETS_ASSISTANT: "is overdue. Please follow up.",
};
const NOTIFICATION_TITLE = {
  ADD_NEW_TASK_ASSISTANT: "New Task Created by Your Assistant",
  ADD_NEW_TASK_USER: "New Task Created",
  NEW_TASK_SHARED: "New Task Shared with You",
  UPDATE_TASK_ASSISTANT: "Task Updated",
  UPDATE_TASK_USER: "Task Updated",
  TASK_MARKED_COMPLETED_ASSISTANT: "Task Completed",
  DELETE_TASK_ASSISTANT: "Task Deleted",
  DELETE_TASK_USER: "Task Deleted",
  ADD_NEW_GOAL_ASSISTANT: "New Goal Created by Your Assistant",
  ADD_NEW_GOAL_USER: "New Goal Created",
  UPDATE_GOAL_ASSISTANT: "Goal Updated",
  UPDATE_GOAL_USER: "Goal Updated",
  GOAL_MARKED_COMPLETED_ASSISTANT: "Goal Completed",
  DELETE_GOAL_ASSISTANT: "Goal Deleted",
  DELETE_GOAL_USER: "Goal Deleted",
  ADD_NEW_REMINDER_ASSISTANT: "New Reminder Created by Your Assistant",
  ADD_NEW_REMINDER_USER: "New Reminder Created",
  UPDATE_REMINDER_ASSISTANT: "Reminder Updated",
  UPDATE_REMINDER_USER: "Reminder Updated",
  REMINDER_MARKED_COMPLETED_ASSISTANT: "Reminder Completed",
  DELETE_REMINDER_ASSISTANT: "Reminder Deleted",
  DELETE_REMINDER_USER: "Reminder Deleted",
  ADD_NEW_BUDGET_ASSISTANT: "New Budget Created by Your Assistant",
  ADD_NEW_BUDGET_USER: "New Budget Created",
  UPDATE_BUDGET_ASSISTANT: "Budget Updated",
  UPDATE_BUDGET_USER: "Budget Updated",
  BUDGET_MARKED_COMPLETED_ASSISTANT: "Budget Completed",
  DELETE_BUDGET_ASSISTANT: "Budget Deleted",
  DELETE_BUDGET_USER: "Budget Deleted",
  UPCOMING_TASKS: "Task Due Tomorrow",
  TODAY_TASKS: "Task Today",
  OVERDUE_TASKS: "Task Overdue",
  UPCOMING_GOALS: "Goal Due Tomorrow",
  TODAY_GOALS: "Goal Today",
  OVERDUE_GOALS: "Goal Overdue",
  UPCOMING_REMINDERS: "Reminder Due Tomorrow",
  TODAY_REMINDERS: "Reminder Today",
  OVERDUE_REMINDERS: "Reminder Overdue",
  UPCOMING_BUDGETS: "Budget Due Tomorrow",
  TODAY_BUDGETS: "Budget Today",
  OVERDUE_BUDGETS: "Budget Overdue",
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
    BAD_NOTIFICATION: {
      statusCode: HTTP_STATUS_CODE.BAD_REQUEST,
      type: "BAD_NOTIFICATION",
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
    USER_DOES_NOT_EXIST: {
      statusCode: HTTP_STATUS_CODE.BAD_REQUEST,
      type: "USER_DOES_NOT_EXIST",
    },
    NOTIFICATION_NOT_EXIT: {
      statusCode: HTTP_STATUS_CODE.BAD_REQUEST,
      type: "NOTIFICATION_NOT_EXIT",
    },
    LIMIT_EXCEEDS: {
      statusCode: HTTP_STATUS_CODE.ACCESS_FORBIDDEN,
      type: "LIMIT_EXCEEDS",
    },
    INVALID_MAIL_TYPE: {
      statusCode: HTTP_STATUS_CODE.BAD_REQUEST,
      type: "INVALID_MAIL_TYPE",
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
    // admin specific
    ADMIN_LOGIN: (data) => {
      return {
        statusCode: HTTP_STATUS_CODE.OK,
        type: "ADMIN_LOGIN",
        data: data,
      };
    },
    NOTIFICATION_SENT: {
			"statusCode": HTTP_STATUS_CODE.OK,
			"type": "NOTIFICATION_SENT"
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
    NOTIFICATION_READ: {
      statusCode: HTTP_STATUS_CODE.OK,
      type: "NOTIFICATION_READ",
    },
    NOTIFICATION_DETAILS: (data) => {
      return {
        statusCode: HTTP_STATUS_CODE.OK,
        type: "NOTIFICATION_DETAILS",
        data: data
      }
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
    PROFILE_SETTINGS: {
      statusCode: HTTP_STATUS_CODE.OK,
      type: "PROFILE_SETTINGS",
    },
    PROFILE_IMAGE: {
      statusCode: HTTP_STATUS_CODE.OK,
      type: "PROFILE_IMAGE",
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
    LANGUAGE_LIST: (data) => {
      return {
        statusCode: HTTP_STATUS_CODE.OK,
        type: "DEFAULT",
        data: data,
      };
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
    RESEND_NOTIFICATION: {
      statusCode: HTTP_STATUS_CODE.OK,
      type: "RESEND_NOTIFICATION",
    },
    MESSAGE_SENT: {
      statusCode: HTTP_STATUS_CODE.OK,
      type: "MESSAGE_SENT",
    },
  },
};

const TEMPLATES = {
  EMAIL: {
    SUBJECT: {
      FORGOT_PASSWORD: "Reset Password Request",
      // RESET_PASSWORD: "Reset password link",
      VERIFY_EMAIL: "Verify email address",
      WELCOME: "Welcome to Yooshie!",
      ACCOUNT_BLOCKED: "Account Blocked",
      ADD_NEW_SUBADMIN: "Yooshie- New Assistant",
      NEW_ASSISTANT_ASSIGNED: "New Assistant Assigned",
      CHANGE_PASSWORD: "Password Changed",
    },
    FROM_MAIL: process.env["FROM_MAIL"],
  },
  SMS: {
    OTP: `Your Yooshie Code is .`,
    THANKS: `Thanks, Yooshie Team`,
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
  STRING_REPLACE: /[-+ ()*_$#@!{}|\/^%`~=?,.<>:;'"]/g,
  SEARCH: /[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, // NOSONAR
  MONGO_ID: /^[a-f\d]{24}$/i,
};

const NOTIFICATION_TYPE = {
  ADMIN_NOTIFICATION: "ADMIN_NOTIFICATION",
  ADD_NEW_TASK_ASSISTANT: "ADD_NEW_TASK_ASSISTANT",
  ADD_NEW_TASK_USER: "ADD_NEW_TASK_USER",
  NEW_TASK_SHARED: "NEW_TASK_SHARED",
  UPDATE_TASK_ASSISTANT: "UPDATE_TASK_ASSISTANT",
  UPDATE_TASK_USER: "UPDATE_TASK_USER",
  TASK_MARKED_COMPLETED_ASSISTANT: "TASK_MARKED_COMPLETED_ASSISTANT",
  DELETE_TASK_ASSISTANT: "DELETE_TASK_ASSISTANT",
  DELETE_TASK_USER: "DELETE_TASK_USER",
  ADD_NEW_GOAL_ASSISTANT: "ADD_NEW_GOAL_ASSISTANT",
  ADD_NEW_GOAL_USER: "ADD_NEW_GOAL_USER",
  UPDATE_GOAL_ASSISTANT: "UPDATE_GOAL_ASSISTANT",
  UPDATE_GOAL_USER: "UPDATE_GOAL_USER",
  GOAL_MARKED_COMPLETED_ASSISTANT: "GOAL_MARKED_COMPLETED_ASSISTANT",
  DELETE_GOAL_ASSISTANT: "DELETE_GOAL_ASSISTANT",
  DELETE_GOAL_USER: "DELETE_GOAL_USER",
  ADD_NEW_REMINDER_ASSISTANT: "ADD_NEW_REMINDER_ASSISTANT",
  ADD_NEW_REMINDER_USER: "ADD_NEW_REMINDER_USER",
  UPDATE_REMINDER_ASSISTANT: "UPDATE_REMINDER_ASSISTANT",
  UPDATE_REMINDER_USER: "UPDATE_REMINDER_USER",
  REMINDER_MARKED_COMPLETED_ASSISTANT: "REMINDER_MARKED_COMPLETED_ASSISTANT",
  DELETE_REMINDER_ASSISTANT: "DELETE_REMINDER_ASSISTANT",
  DELETE_REMINDER_USER: "DELETE_REMINDER_USER",
  ADD_NEW_BUDGET_ASSISTANT: "ADD_NEW_BUDGET_ASSISTANT",
  ADD_NEW_BUDGET_USER: "ADD_NEW_BUDGET_USER",
  UPDATE_BUDGET_ASSISTANT: "UPDATE_BUDGET_ASSISTANT",
  UPDATE_BUDGET_USER: "UPDATE_BUDGET_USER",
  BUDGET_MARKED_COMPLETED_ASSISTANT: "BUDGET_MARKED_COMPLETED_ASSISTANT",
  DELETE_BUDGET_ASSISTANT: "DELETE_BUDGET_ASSISTANT",
  DELETE_BUDGET_USER: "DELETE_BUDGET_USER",
  UPCOMING_TASKS: "UPCOMING_TASKS",
  TODAY_TASKS: "TODAY_TASKS",
  OVERDUE_TASKS: "OVERDUE_TASKS",
  UPCOMING_GOALS: "UPCOMING_GOALS",
  TODAY_GOALS: "TODAY_GOALS",
  OVERDUE_GOALS: "OVERDUE_GOALS",
  UPCOMING_REMINDERS: "UPCOMING_REMINDERS",
  TODAY_REMINDERS: "TODAY_REMINDERS",
  OVERDUE_REMINDERS: "OVERDUE_REMINDERS",
  UPCOMING_BUDGETS: "UPCOMING_BUDGETS",
  TODAY_BUDGETS: "TODAY_BUDGETS",
  OVERDUE_BUDGETS: "OVERDUE_BUDGETS",
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

const GEN_STATUS = {
  BLOCKED: "BLOCKED",
  UN_BLOCKED: "UN_BLOCKED",
  DELETED: "DELETED",
  PENDING: "PENDING",
};

const DAY = {
  WEEKDAY: "WEEKDAY",
  WEEKEND: "WEEKEND",
};

const DISPUTE = {
  SINGLE: "SINGLE",
  BUNDLE: "BUNDLE",
  BATCH: "BATCH",
};

const DISPUTE_STATUS = {
  ELIGIBLE: "ELIGIBLE",
  NOT_ELIGIBLE: "NOT_ELIGIBLE",
  CLOSED: "CLOSED",
  IN_PROGRESS: "IN_PROGRESS",
  OUTREACH: "OUTREACH",
  OPEN: "OPEN",
};

const ACTIVITY_TYPE = {
  FILE: "FILE",
  TEXT: "TEXT",
};

const MAIL_TYPE = {
  VERIFY_EMAIL: "VERIFY_EMAIL",
  FORGOT_PASSWORD: "FORGOT_PASSWORD",
  ADD_ASSISTANT: "ADD_ASSISTANT",
  ASSIGN_NEW_ASSISTANT: "ASSIGN_NEW_ASSISTANT",
  CHANGE_PASSWORD: "CHANGE_PASSWORD",
};

const TIMERS = {
	ZERO: 0,
	HALF_SECOND: 500,
	SECOND: 1000,
	TWO_SECOND: 2000
};

const FILE_EXTENTION = {
  MSG: "msg",
  EML: "eml",
};

const GENERATOR = {
  STRING: "abcdefghijklmnopqrstuvwxyz",
  NUMBER: "0123456789",
  PUNCTUATION: "@%&*",
};

const FIREBASE = {
  SOUND: "default",
  HIGH_PRIORITY: "high",
  APNS_PRIORITY: "10",
  APNS_EXPIRATION: "0",
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
  fileUploadExts,
  NOTIFICATION,
  CATEGORIES_STAUS,
  MODULES,
  MODULES_ID,
  GEN_STATUS,
  THEME,
  SUB_TYPE,
  VISIBILITY,
  ENVIRONMENT,
  AWS_SECRET_MANGER,
  DAY,
  DISPUTE,
  DISPUTE_STATUS,
  ACTIVITY_TYPE,
  FILE_EXTENTION,
  MAIL_TYPE,
  GENERATOR,
  FIREBASE,
  NOTIFICATION_TYPE,
  TIMERS,
};
