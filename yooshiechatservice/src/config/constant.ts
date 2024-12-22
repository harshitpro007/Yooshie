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

const NOTIFICATION_DATA = {
  ADD_EDIT_EVENT: (userName, eventId, senderId, categoryName) => {
    return {
      type: NOTIFICATION_TYPE.SHIFT_CREATE,
      activityId: eventId,
      senderId: senderId,
      message: NOTIFICATION_MSG.CREATED_SHIFT,
      body: NOTIFICATION_MSG.CREATED_SHIFT,
      category: categoryName ? categoryName : "",
      title: NOTIFICATION_TITLE.CREATE_SHIFT,
    };
  },
  SHIFT_ACTIVITY_FINISH_NOTIFICATION: (activityId, intervalId) => {
    return {
      type: NOTIFICATION_TYPE.SHIFT_ACTIVITY_FINISH_NOTIFICATION,
      message: NOTIFICATION_MSG.SHIFT_ACTIVITY_FINISH_NOTIFICATION,
      body: NOTIFICATION_TITLE.SHIFT_FINISH_NOTIFICATION,
      title: NOTIFICATION_TITLE.SHIFT_FINISH_NOTIFICATION,
      activityId: activityId,
      intervalId: intervalId,
    };
  },
  GROUP_ACTIVITY_FINISH_NOTIFICATION: (activityId) => {
    return {
      type: NOTIFICATION_TYPE.GROUP_ACTIVITY_FINISH_NOTIFICATION,
      message: NOTIFICATION_MSG.GROUP_ACTIVITY_FINISH_NOTIFICATION,
      body: NOTIFICATION_TITLE.GROUP_FINISH_NOTIFICATION,
      title: NOTIFICATION_TITLE.GROUP_FINISH_NOTIFICATION,
      activityId: activityId,
      //"intervalId": intervalId
    };
  },
  BROADCAST_NOTIFICATION: (params, receiverId, senderId) => {
    return {
      type: NOTIFICATION_TYPE.BROADCAST_NOTIFICATION,
      receiverId: receiverId,
      senderId: senderId,
      message: params.message,
      body: params.message,

      title: params.title,
    };
  },
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
  SUPPORTER: "SUPPORTER",
  PARTICIPANT: "PARTICIPANT",
  ASSISTANT: "ASSISTANT"
};

const DB_MODEL_REF = {
	ADMIN: "admins",
	LOGIN_HISTORY: "login_histories",
	USER: "users",
	ROLE: "roles",
	CHATS: "chats",
	MESSAGES: "messages",
	CONVERSATION: "conversations",
	EVENTS: "events",
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
  FORWARDED: "FORWARDED",
  REPLIED: "REPLIED",
  ARCHIVED: "ARCHIVED",
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
			"statusCode": HTTP_STATUS_CODE.UNAUTHORIZED,
			"type": "UNAUTHORIZED_ACCESS"
		},
		INTERNAL_SERVER_ERROR: {
			"statusCode": HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR,
			"type": "INTERNAL_SERVER_ERROR"
		},
		BAD_TOKEN: {
			"statusCode": HTTP_STATUS_CODE.UNAUTHORIZED,
			"type": "BAD_TOKEN"
		},
		TOKEN_EXPIRED: {
			"statusCode": HTTP_STATUS_CODE.UNAUTHORIZED,
			"type": "TOKEN_EXPIRED"
		},
		TOKEN_GENERATE_ERROR: {
			"statusCode": HTTP_STATUS_CODE.BAD_REQUEST,
			"type": "TOKEN_GENERATE_ERROR"
		},
		BLOCKED: {
			"statusCode": HTTP_STATUS_CODE.UNAUTHORIZED,
			"type": "BLOCKED"
		},
		INCORRECT_PASSWORD: {
			"statusCode": HTTP_STATUS_CODE.ACCESS_FORBIDDEN,
			"type": "INCORRECT_PASSWORD"
		},
		USER_ALREADY_EXISTS: {
			"statusCode": HTTP_STATUS_CODE.BAD_REQUEST,
			"type": "USER_ALREADY_EXISTS"
		},
		ENTER_NEW_PASSWORD: {
			"statusCode": HTTP_STATUS_CODE.ACCESS_FORBIDDEN,
			"type": "ENTER_NEW_PASSWORD"
		},
		BLOCKED_MOBILE: {
			"statusCode": HTTP_STATUS_CODE.UNAUTHORIZED,
			"type": "BLOCKED_MOBILE"
		},
		SESSION_EXPIRED: {
			"statusCode": HTTP_STATUS_CODE.UNAUTHORIZED,
			"type": "SESSION_EXPIRED"
		},
		FAV_USER_NOT_FOUND: {
			"statusCode": HTTP_STATUS_CODE.FAV_USER_NOT_FOUND,
			"type": "FAV_NOT_FOUND"
		},
		PARAMS_MISSING: {
			"statusCode": HTTP_STATUS_CODE.BAD_REQUEST,
			"type": "PARAMS_MISSING"
		},
		MESSAGE_NOT_FOUND: {
			"statusCode": HTTP_STATUS_CODE.BAD_REQUEST,
			"type": "MESSAGE_NOT_FOUND"
		},
		CHAT_NOT_FOUND: {
			"statusCode": HTTP_STATUS_CODE.BAD_REQUEST,
			"type": "CHAT_NOT_FOUND"
		},
		GROUP_NOT_FOUND: {
			"statusCode": HTTP_STATUS_CODE.BAD_REQUEST,
			"type": "GROUP_NOT_FOUND"
		},
		UNAUTHORIZE_ADMIN: {
			"statusCode": HTTP_STATUS_CODE.BAD_REQUEST,
			"type": "UNAUTHORIZE_ADMIN"
		},
		MEMEBERS_ALREADY_EXIST: {
			"statusCode": HTTP_STATUS_CODE.BAD_REQUEST,
			"type": "MEMBERS_ALREADY_EXIST"
		},
		UNAUTHORIZE_ADMIN_MEMBERS: {
			"statusCode": HTTP_STATUS_CODE.BAD_REQUEST,
			"type": "UNAUTHORIZE_ADMIN_MEMBERS"
		},
		MEETING_ID_NOT_FOUND: {
			"statusCode": HTTP_STATUS_CODE.BAD_REQUEST,
			"type": "MEETING_ID_NOT_FOUND"
		},
    FIRST_ASSIGN_ADMIN: {
      statusCode: 400,
      message: "You are the only admin. Please assign another admin before leaving.",
      type: "FIRST_ASSIGN_ADMIN",
    },
		ERROR: (value, code = HTTP_STATUS_CODE.BAD_REQUEST) => {
			return {
				"statusCode": code,
				"message": value,
				"type": "ERROR"
			};
		},
		FRIEND_ERROR: (value, code = HTTP_STATUS_CODE.FRIEND_REQUEST_ERR) => {
			return {
				"statusCode": code,
				"message": value,
				"type": "ERROR"
			};
		},
		FIELD_REQUIRED: (value, lang = "en") => {
			return {
				"statusCode": HTTP_STATUS_CODE.BAD_REQUEST,
				"message": lang === "en" ? EN_FIELD_REQUIRED.replace(/{value}/g, value) : EN_FIELD_REQUIRED.replace(/{value}/g, value),
				"type": "FIELD_REQUIRED"
			};
		},
		SOMETHING_WENT_WRONG: {
			"statusCode": HTTP_STATUS_CODE.BAD_REQUEST,
			"type": "SOMETHING_WENT_WRONG"
		},
		SERVER_IS_IN_MAINTENANCE: (lang = "en") => {
			return {
				"statusCode": HTTP_STATUS_CODE.BAD_REQUEST,
				"message": lang === "en" ? EN_SERVER_IS_IN_MAINTENANCE : EN_SERVER_IS_IN_MAINTENANCE,
				"type": "SERVER_IS_IN_MAINTENANCE"
			};
		},
		CHAT_MESSAGE_ERROR: (value, chatId, code = HTTP_STATUS_CODE.BAD_REQUEST) => {
			return {
				"statusCode": code,
				"message": value,
				"chatId": chatId,
				"type": "ERROR"
			};
		},
		LINK_EXPIRED: {
			"statusCode": HTTP_STATUS_CODE.BAD_REQUEST,
			"message": EN_LINK_EXPIRED,
			"type": "LINK_EXPIRED"
		},
		EMAIL_NOT_REGISTERED: {
			"statusCode": HTTP_STATUS_CODE.BAD_REQUEST,
			"type": "EMAIL_NOT_REGISTERED"
		},
    REMOVE_USER:{
      "statusCode": HTTP_STATUS_CODE.BAD_REQUEST,
      "message": "You can not remove yourself from the admin/group.",
      "type": "REMOVE_USER"
    },
		MOBILE_NOT_REGISTERED: {
			"statusCode": HTTP_STATUS_CODE.BAD_REQUEST,
			"type": "MOBILE_NOT_REGISTERED"
		},
		EMAIL_ALREADY_EXIST: {
			"statusCode": HTTP_STATUS_CODE.BAD_REQUEST,
			"type": "EMAIL_ALREADY_EXIST"
		},
		EMAIL_NOT_VERIFIED: (code = HTTP_STATUS_CODE.BAD_REQUEST) => {
			return {
				"statusCode": code,
				"type": "EMAIL_NOT_VERIFIED"
			}
		},
		INVALID_OLD_PASSWORD: {
			"statusCode": HTTP_STATUS_CODE.BAD_REQUEST,
			"type": "INVALID_OLD_PASSWORD"
		},
		INVALID_REFRESH_TOKEN: {
			statusCode: HTTP_STATUS_CODE.BAD_REQUEST,
			type: "INVALID_REFRESH_TOKEN",
		},
		NEW_CONFIRM_PASSWORD: {
			"statusCode": HTTP_STATUS_CODE.BAD_REQUEST,
			"type": "NEW_CONFIRM_PASSWORD"
		},
		OTP_EXPIRED: {
			"statusCode": HTTP_STATUS_CODE.BAD_REQUEST,
			"type": "OTP_EXPIRED"
		},
		INVALID_OTP: {
			"statusCode": HTTP_STATUS_CODE.BAD_REQUEST,
			"type": "INVALID_OTP"
		},
		// user specific
		USER_NOT_FOUND: {
			"statusCode": HTTP_STATUS_CODE.BAD_REQUEST,
			"type": "USER_NOT_FOUND"
		},
		PROFILE_NOT_COMPLETED: {
			"statusCode": HTTP_STATUS_CODE.BAD_REQUEST,
			"type": "PROFILE_NOT_COMPLETED"
		},
		USER_DOES_NOT_EXIST: {
			"statusCode": HTTP_STATUS_CODE.BAD_REQUEST,
			"type": "USER_DOES_NOT_EXIST"
		},
		DOCUMENT_NOT_APPROVED: {
			"statusCode": HTTP_STATUS_CODE.BAD_REQUEST,
			"type": "DOCUMENT_NOT_APPROVED"
		},
		MOBILE_NO_NOT_VERIFIED: {
			"statusCode": HTTP_STATUS_CODE.MOBILE_NOT_VERIFIED,
			"type": "MOBILE_NO_NOT_VERIFIED"
		},
		MOBILE_NO_ALREADY_EXIST: {
			"statusCode": HTTP_STATUS_CODE.BAD_REQUEST,
			"type": "MOBILE_NO_ALREADY_EXIST"
		},
		// content specific
		CONTENT_ALREADY_EXIST: {
			"statusCode": HTTP_STATUS_CODE.BAD_REQUEST,
			"type": "CONTENT_ALREADY_EXIST"
		},
		CONTENT_NOT_FOUND: {
			"statusCode": HTTP_STATUS_CODE.BAD_REQUEST,
			"type": "CONTENT_NOT_FOUND"
		},
		FAQ_ALREADY_EXIST: {
			"statusCode": HTTP_STATUS_CODE.BAD_REQUEST,
			"type": "FAQ_ALREADY_EXIST"
		},
		// interest specific
		INTEREST_ALREADY_EXIST: {
			"statusCode": HTTP_STATUS_CODE.BAD_REQUEST,
			"type": "INTEREST_ALREADY_EXIST"
		},
		INTEREST_NOT_FOUND: {
			statusCode: HTTP_STATUS_CODE.URL_NOT_FOUND,
			type: "INTEREST_NOT_FOUND"
		},
		CANT_BLOCK_INTEREST: {
			statusCode: HTTP_STATUS_CODE.BAD_REQUEST,
			type: "CANT_BLOCK_INTEREST"
		},
		// categories specific
		CATEGORY_ALREADY_EXIST: {
			"statusCode": HTTP_STATUS_CODE.BAD_REQUEST,
			"type": "CATEGORY_ALREADY_EXIST"
		},
		CATEGORY_NOT_FOUND: {
			statusCode: HTTP_STATUS_CODE.URL_NOT_FOUND,
			type: "CATEGORY_NOT_FOUND"
		},
		CANT_BLOCK_CATEGORY: {
			statusCode: HTTP_STATUS_CODE.BAD_REQUEST,
			type: "CANT_BLOCK_CATEGORY"
		},
		// version Specific
		VERSION_ALREADY_EXIST: {
			"statusCode": HTTP_STATUS_CODE.BAD_REQUEST,
			"type": "VERSION_ALREADY_EXIST"
		},

    INVALID_ADMIN: {
      statusCode: HTTP_STATUS_CODE.UNAUTHORIZED,

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

    INVALID_SUB_ADMIN: {
      statusCode: HTTP_STATUS_CODE.BAD_REQUEST,

      type: "INVALID_SUB_ADMIN",
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
      statusCode: HTTP_STATUS_CODE.ACCESS_FORBIDDEN,
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
    DISPUTE_NOT_EXIST: {
      statusCode: HTTP_STATUS_CODE.BAD_REQUEST,
      type: "DISPUTE_NOT_EXIST",
    },
    DISPUTE_ALREADY_PRESENT: {
      statusCode: HTTP_STATUS_CODE.BAD_REQUEST,
      type: "DISPUTE_ALREADY_PRESENT",
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
    CHAT_FORMATION: (data) => {
      return {
        statusCode: HTTP_STATUS_CODE.OK,
        type: "CHAT_FORMATION",
        ...data,
      };
    },
    GROUP_DETAILS: (data) => {
      return {
        statusCode: HTTP_STATUS_CODE.OK,
        type: "GROUP_DETAILS",
        data: data,
      };
    },
    DELETE_CHAT: {
      statusCode: HTTP_STATUS_CODE.OK,
      type: "DELETE_CHAT",
    },
    DELETE_MESSAGE: {
      statusCode: HTTP_STATUS_CODE.OK,
      type: "DELETE_MESSAGE",
    },
    DELETE_MEETING: {
      statusCode: HTTP_STATUS_CODE.OK,
      type: "DELETE_MEETING",
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
    EDIT_PROFILE: {
      statusCode: HTTP_STATUS_CODE.OK,
      type: "EDIT_PROFILE",
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
    SET_INTEREST: {
      statusCode: HTTP_STATUS_CODE.OK,
      type: "SET_INTEREST",
    },
    EDIT_DISABILITY_DETAILS: {
      statusCode: HTTP_STATUS_CODE.OK,
      type: "EDIT_DISABILITY_DETAILS",
    },
    EMAIL_UPLOAD: {
      statusCode: HTTP_STATUS_CODE.OK,
      type: "EMAIL_UPLOAD",
    },
    EDIT_PAYMENT_DETAILS: {
      statusCode: HTTP_STATUS_CODE.OK,
      type: "EDIT_PAYMENT_DETAILS",
    },
    EDIT_EMERGENCY_CONTACT: {
      statusCode: HTTP_STATUS_CODE.OK,
      type: "EDIT_EMERGENCY_CONTACT",
    },
    EDIT_NDIS_PLAN: {
      statusCode: HTTP_STATUS_CODE.OK,
      type: "EDIT_NDIS_PLAN",
    },
    UPLOAD_SUPPORTING_DOCUMENT: {
      statusCode: HTTP_STATUS_CODE.OK,
      type: "UPLOAD_SUPPORTING_DOCUMENT",
    },
    UPLOAD_CERTIFICATIONS: {
      statusCode: HTTP_STATUS_CODE.OK,
      type: "UPLOAD_CERTIFICATIONS",
    },
    UPLOAD_NDIS_PLAN: {
      statusCode: HTTP_STATUS_CODE.OK,
      type: "UPLOAD_NDIS_PLAN",
    },
    UPLOAD_RESUME: {
      statusCode: HTTP_STATUS_CODE.OK,
      type: "UPLOAD_RESUME",
    },
    UPLOAD_INDUCTION_CERTIFICATES: {
      statusCode: HTTP_STATUS_CODE.OK,
      type: "UPLOAD_INDUCTION_CERTIFICATES",
    },
    UPLOAD_NDIS_TRAINING_CERTIFICATE: {
      statusCode: HTTP_STATUS_CODE.OK,
      type: "UPLOAD_NDIS_TRAINING_CERTIFICATE",
    },
    UPLOAD_CAR_INSURANCE: {
      statusCode: HTTP_STATUS_CODE.OK,
      type: "UPLOAD_CAR_INSURANCE",
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
    // interest specific
    ADD_INTEREST: {
      statusCode: HTTP_STATUS_CODE.CREATED,
      type: "ADD_INTEREST",
    },
    BLOCK_INTEREST: {
      statusCode: HTTP_STATUS_CODE.OK,
      type: "BLOCK_INTEREST",
    },
    UNBLOCK_INTEREST: {
      statusCode: HTTP_STATUS_CODE.OK,
      type: "UNBLOCK_INTEREST",
    },
    EDIT_INTEREST: {
      statusCode: HTTP_STATUS_CODE.UPDATED,
      type: "EDIT_INTEREST",
    },
    // category specific
    ADD_CATEGORY: {
      statusCode: HTTP_STATUS_CODE.CREATED,
      type: "ADD_CATEGORY",
    },
    BLOCK_CATEGORY: {
      statusCode: HTTP_STATUS_CODE.OK,
      type: "BLOCK_CATEGORY",
    },
    UNBLOCK_CATEGORY: {
      statusCode: HTTP_STATUS_CODE.OK,
      type: "UNBLOCK_CATEGORY",
    },
    EDIT_CATEGORY: {
      statusCode: HTTP_STATUS_CODE.UPDATED,
      type: "EDIT_CATEGORY",
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
    SUB_ADMIN_CREATED: {
      statusCode: HTTP_STATUS_CODE.CREATED,
      message: "Sub admin registered successfully",
      type: "SUB_ADMIN_CREATED",
    },
    SUB_ADMIN_EDITED: {
      statusCode: HTTP_STATUS_CODE.UPDATED,
      message: "Sub-Admin updated successfully",
      type: "SUB_ADMIN_EDITED",
    },
    SUB_ADMIN_BLOCKED: {
      statusCode: HTTP_STATUS_CODE.UPDATED,
      message: "Subadmin inactivated successfully",
      type: "SUB_ADMIN_BLOCKED",
    },
    SUB_ADMIN_UNBLOCKED: {
      statusCode: HTTP_STATUS_CODE.UPDATED,
      message: "Subadmin activated successfully",
      type: "SUB_ADMIN_UNBLOCKED",
    },
    SUB_ADMIN_DELETED: {
      statusCode: HTTP_STATUS_CODE.UPDATED,
      message: "Subadmin deleted successfully",
      type: "SUB_ADMIN_DELETED",
    },
    SUB_ADMIN_LIST: (data) => {
      return {
        statusCode: HTTP_STATUS_CODE.OK,
        message: "Sub admin list get successfully",
        type: "SUB_ADMIN_LIST",
        data: data,
      };
    },
    SUB_ADMIN_DETAILS: (data) => {
      return {
        statusCode: HTTP_STATUS_CODE.OK,
        message: "Sub admin details get successfully",
        type: "SUB_ADMIN_DETAILS",
        data: data,
      };
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
    UPDATE_HOLIDAY: (data) => {
      return {
        statusCode: HTTP_STATUS_CODE.UPDATED,
        type: "UPDATE_HOLIDAY",
        data: data,
      };
    },
    ADD_HOLIDAY: {
      statusCode: HTTP_STATUS_CODE.CREATED,
      type: "ADD_HOLIDAY",
    },
    DELETE_HOLIDAY: {
      statusCode: HTTP_STATUS_CODE.UPDATED,
      type: "DELETE_HOLIDAY",
    },
    RESEND_REINVITE: {
      statusCode: HTTP_STATUS_CODE.UPDATED,
      type: "RESEND_REINVITE",
    },
    DISPUTE_DETAILS: (data) => {
      return {
        statusCode: HTTP_STATUS_CODE.OK,
        type: "DISPUTE_DETAILS",
        data: data,
      };
    },
    DISPUTE_ACTIVITY_LOG: (data) => {
      return {
        statusCode: HTTP_STATUS_CODE.OK,
        type: "DISPUTE_ACTIVITY_LOG",
        data: data,
      };
    },
    ASSIGNED_CASE: (data) => {
      return {
        statusCode: HTTP_STATUS_CODE.OK,
        type: "ASSIGNED_CASE",
        data: data,
      };
    },
    UNASSIGN_USER: {
      statusCode: HTTP_STATUS_CODE.UPDATED,
      type: "UNASSIGN_USER",
    },
  },
  SOCKET_ERROR: {
    E400: {
      MAX_MEMBER: {
        statusCode: 400,
        message: "Max member in group call.",
        type: "MAX_MEMBER",
      },
      FAILURE_ACKNOWLEDGEMENT: (data, listner?) => {
        let errMsg = "Some error occured, please contact admin";
        if (data) {
          if (
            typeof data === "object" &&
            data.hasOwnProperty("statusCode") &&
            (data.hasOwnProperty("message") ||
              data.hasOwnProperty("customMessage"))
          ) {
            errMsg = data.message || data.customMessage;
          }
        }
        return {
          statusCode: 400,
          message: errMsg,
          type: "FAILURE_ACKNOWLEDGEMENT",
          listner: listner,
          data: data,
        };
      },

      INFO_MISSING: (customMessage?: string) => {
        let errorMessage = customMessage
          ? customMessage
          : "Some required information is missing";
        return {
          statusCode: 400,
          message: errorMessage,
          type: "INFO_MISSING",
          data: {},
        };
      },

      NETWORK_ERROR: (data) => {
        let errMsg = "Some error occured, please contact admin";
        if (data) {
          if (
            typeof data === "object" &&
            (data.hasOwnProperty("message") ||
              data.hasOwnProperty("err") ||
              data.hasOwnProperty("errMsg") ||
              data.hasOwnProperty("errmsg") ||
              data.hasOwnProperty("value"))
          ) {
            errMsg =
              data.message ||
              data.err ||
              data.errMsg ||
              data.errmsg ||
              data.value;
          } else if (typeof data === "string") {
            errMsg = data;
          }
        }
        return {
          statusCode: 400,
          message: "Socket Netwrok error",
          type: "NETWORK_ERROR",
          data: errMsg,
        };
      },

      SOCKET_ERROR: {
        statusCode: 400,
        message: "Socket Implementation error",
        type: "SOCKET_ERROR",
        data: {},
      },
      CHAT_THREAD_BLOCK: {
        statusCode: 400,
        message: "Chat thread block",
        type: "CHAT_THREAD_BLOCK",
      },
    },
    E401: {
      AUTHORIZATION_ERROR: {
        statusCode: 401,
        message: "Error in authorization",
        type: "AUTHORIZATION_ERROR",
        data: {},
      },
    },
  },
  SOCKET_SUCCESS: {
    S200: {
      SUCCESS: (data) => {
        return {
          statusCode: 200,
          message: "Action successfull",
          type: "SUCCESS",
          data: data,
        };
      },
      CHAT_SUCCESS: (data, type) => {
        return {
          statusCode: 200,
          message: "Action successfull",
          type: "SUCCESS",
          chatType: type,
          data: data,
        };
      },
      LIVE_STREAMING_SUCCESS: (data, type, status) => {
        return {
          statusCode: 200,
          status: status,
          message: "Action successfull",
          type: type,
          data: data,
        };
      },
      SUCCESS_ACKNOWLEDGEMENT: (data) => {
        return {
          statusCode: 200,
          message: "Successfully acknowledged on server",
          type: "SUCCESS_ACKNOWLEDGEMENT",
          data: data,
        };
      },
      CUSTOM_SUCCESS_ACKNOWLEDGEMENT: (data, listner?) => {
        let successMsg = "Successfully acknowledged on server";
        if (data) {
          if (
            typeof data === "object" &&
            data.hasOwnProperty("statusCode") &&
            (data.hasOwnProperty("message") ||
              data.hasOwnProperty("customMessage"))
          ) {
            successMsg = data.message || data.customMessage;
          }
        }
        return {
          statusCode: 200,
          message: successMsg,
          type: "CUSTOM_SUCCESS_ACKNOWLEDGEMENT",
          listner: listner,
          data: data,
        };
      },
      CONNECTION_ESTABLISHED: {
        statusCode: 200,
        message: "Connection Established",
        type: "CONNECTION_ESTABLISHED",
        data: {},
      },
      JOIN_REQUEST_ACCEPTED: {
        statusCode: 200,
        message: "Request accepted successfully",
        type: "JOIN_REQUEST_ACCEPTED",
        data: {},
      },
      JOIN_REQUEST_DECLINED: {
        statusCode: 200,
        message: "Request declined successfully",
        type: "JOIN_REQUEST_DECLINED",
        data: {},
      },
    },
  },
};

const REDIS_KEY_PREFIX = {
  SOCKET_ID: "_socketid",
  MUTE_CHAT: "_mutechat",
  OFFLINE: "_offline",
  SUBSCRIBED: "_subscribed",
  ARCHIVE: "_archive",
  BLOCKED: "_blocked",
  MEETING: "_meeting",
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

const NOTIFICATION_TYPE = {
  SHIFT_CREATE: "CREATE_SHIFT",
  GROUP_CREATE: "CREATE_GROUP",
  SHIFT_ACCEPT_BY_SUPPORTER: "SHIFT_ACCEPT_SUPPORTER",
  GROUP_ACCEPT_BY_SUPPORTER: "GROUP_ACCEPT_SUPPORTER",
  GROUP_ACCEPT_BY_ORG: "GROUP_ACCEPT_ORG",
  SHIFT_ACCEPT_BY_ORG: "SHIFT_ACCEPT_ORG",
  GROUP_ACTIVITY_STARTED: "GROUP_ACTIVITY_STARTED",
  SHIFT_ACTIVITY_STARTED: "SHIFT_ACTIVITY_STARTED",
  GROUP_ACTIVITY_FINISHED: "GROUP_ACTIVITY_FINISHED",
  SHIFT_ACTIVITY_FINISHED: "SHIFT_ACTIVITY_FINISHED",
  SUPPORTING_RATING: "SUPPORTING_RATING",
  SUPPORT_CHAT: "SUPPPORT_CHAT",
  SHIFT_ACTIVITY_FINISH_NOTIFICATION: "SHIFT_ACTIVITY_FINISH_NOTIFICATION",
  GROUP_ACTIVITY_FINISH_NOTIFICATION: "GROUP_ACTIVITY_FINISH_NOTIFICATION",

  GROUP_ACTIVITY_DECLINED_SINGLE: "GROUP_ACTIVITY_DECLINED_SINGLE",

  GROUP_ACTIVITY_DECLINED_MULTIPLE: "GROUP_ACTIVITY_DECLINED_MULTIPLE",
  GROUP_APPLY_FOR_WORK: "GROUP_APPLY_FOR_WORK",
  SHIFT_APPLY_FOR_WORK: "SHIFT_APPLY_FOR_WORK",
  FRIEND_REQUEST_SENT: "FRIEND_REQUEST_SENT",
  FRIEND_REQUEST_ACCEPT: "FRIEND_REQUEST_ACCEPT",
  FRIEND_REQUEST_DECLINED: "FRIEND_REQUEST_DECLINED",
  CANCELLED_SHIF: "CANCELLED_SHIF",
  MAKE_PUBLIC_SHIFT: "MAKE_PUBLIC_SHIFT",
  DECLINED_SHIFT: "DECLINED_SHIFT_REQUEST",
  PARTICIPANT_ONBOARD: "PARTICIPANT_ONBOARD",
  SUPPORTER_ONBOARD: "SUPPORTER_ONBOARD",
  INCIDENT_REPORT: "INCIDENT_REPORT",
  ADD_NOTES: "ADD_NOTE",
  NOTES_DECLINED: "NOTES_DECLINED",
  REPLACE_SUPPORTER: "REPLACE_SUPPORTER",
  BROADCAST_NOTIFICATION: "BROADCAST_NOTIFICATION",
  CHAT_NOTIFICATION: "CHAT_NOTIFICATION",
  CALL_NOTIFICATION: "CALL_NOTIFICATION",
  EVENT: "1",
  DECLINE_NOTIFICATION: "DECLINE_NOTIFICATION",
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

const QUEUE_NAME = {
  DELAY_NON_DELAY: "delay-non-delay",
  STEPS_POINTS_SUMMARY_EVERYDAY: "steps-points-summary-everyday",
  AUTO_COMPLETE_CLASS_BOOKING: "auto-complete-class-booking",
  AUTO_INCOMPLETE_CLASS_BOOKING: "auto-incomplete-class-booking",
  POINTS_DISTRIBUTION: "points-distribution",
  CORPORATE_POINTS_DISTRIBUTION: "corporate-points-distribution",
  PUSH_NOTIFIACTION_IOS: "-push-notification-ios-v9",
  PUSH_NOTIFIACTION_ANDROID: "-push-notification-android-v9",
  PUSH_NOTIFIACTION_WEB: "-push-notification-web-v9",
  DATABASE_INSERT: "-data-base-insertion-v9",
  COUPON_CODE_ASSIGNED: "coupon-code-assigned",
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

const COMPLAINANT_TYPE = {
  PROVIDER: "Provider",
};

const ACTIVITY_TYPE = {
  FILE: "FILE",
  TEXT: "TEXT",
};

const CHAT_TYPE = {
  ONE_TO_ONE: "ONE_TO_ONE",
  GROUP: "GROUP",
  BROADCAST: "BROADCAST",
};

const SOCKET = {
	CHAT_FORMATION: {
		PARAMS_MISSING: "__params_missing",
	},
	LISTNER: {
		DEFAULT: {
			CONNECTION: 'connection',
			RECONNECT: 'reconnect',
			DISCONECT: 'disconnect',
			DISCONNECTING: 'disconnecting'
		},
		SOCKET_SERVICE: "socket-service",
		ONE_TO_ONE: "__one_to_one",
		GROUP: "__group"
	},

	LISTNER_TYPE: {
		SOCKET_SERVICE: {
			ONE_TO_ONE_CHAT: "__one_to_one_chat_message",
			FORWARD: "__forward_message",
			GROUP: "__group_chat_message",
			CALL_INITIATE:"__call_initiate",
			CALL_DECLINE:"__call_decline",
			CALL_ACCEPT:"__call_accept",
			CALL_END:"__call_end",
			REMOVE_ATTENDEES: "__remove_attendees",
			USER_CALL_STATUS:"__user_call_status",
			HOME_NOTIFICATION_COUNT:"__home_notification_count",
			CURRENT_CALL_STATUS: "__current_call_status"
		},
		MESSAGE: {
			REACTION: "__chat_reaction",
			REPLIED: "__chat_replied",
			DELETE_MESSAGE: "__delete_message",
			READ: "__chat_read_status"
		},
		USER: {
			USER_STATUS: "__user_status",
			LEFT_ROOM: "__chat_room_left",
			BLOCKED: "__user_blocked",
			REPORT: "__report_user",
			SUBSCRIPTION: "__subscription"
		},
		CHAT: {
			LISTING: "__inbox_chat",
			MESSAGE: "__inbox_message",
			DELETE: "__delete_chat",
      TRACKING: "__live_tracking",
			MUTE: "__chat_mute",
			READ_ALL: "__marked_read_all",
			REFRESH: {
				INBOX_CHAT: "__refresh_inbox_chat",
				ARCHIVE_CHAT: "__refresh_inbox_archive"
			}
		},
		// BROADCAST: {
		// 	CREATE: "__create_broadcast",
		// 	EDIT: "__edit_broadcast",
		// 	DETAILS: "__view_broadcast",
		// 	MESSAGES: "__send_broadcast",
		// 	VIEW_MESSAGE: "__inbox_broadcast",
		// 	JOIN: "__join_broadcast"
		// },
		GROUP: {
			CREATE: "__create_group",
			EDIT: "__edit_group",
			DETAILS: "__view_group",
			MESSAGES: "__send_group_message",
			REPLIED: "__reply_group_message",
			EXIT: "__exit_group",
			DELETE: "__delete_group",
			REMOVE: "__remove_group_member",
			JOIN: "__join_group_chat",
			ADMIN: "__make_group_admin",
			REMOVE_ADMIN: "__remove_from_admin",
			GROUP_INFO: "__group_details",

		},
		NOTIFY: {
			REMOVED_FROM_GROUP: "__notify_removed_user",
			NOTIFICATION: "__chat_notification",
			DELIVERED: "__delivered"
		},
		TRANSCRIPTION: {
			MESSAGE: "__transcription_message",
			ON_MESSAGE: "__transcription_on_message"
		}
	},

  EMITTER: {
    DEFAULT: {
      CONNECTED: "connected",
    },
    PING: "PING",
    CHAT: {
      MESSAGE: "message",
      MESSAGE_STATUS: "message-status",
      CHAT: "chat",
      PIN: "pin",
      CHAT_STATUS: "chat-status",
    },
    LIVE_STREAMING: {
      PINNED_COMMENT_INFO: "pinnedCommentInfo",
      ONLINE_USERS: "onlineUsers",
    },
    ERROR: {
      NETWORK_ERROR: "network-error",
      SOCKET_ERROR: "socket-error",
      ACK_ERROR: "ack-error",
      INSUFFICIENT_INFO: "insufficient-info",
      AUTHORIZATION_ERROR: "authorization-error",
    },
  },
};

const CHAT_BOX_PAGINATION = {
  pageNo: 0,
  limit: 1,
};

const NOTIFICATION_MESSAGE_TYPE = {
  IMAGE: "📷 Image",
  AUDIO: "🎙 Audio",
  DOCS: "📁 File",
  VIDEO: "🎬 Video",
  VOICE: "🎙 Voice Message",
  LOCATION: "📍 Location",
  STICKER: "🌝 Sticker",
};

const CHAT_HEADERS = {
  BROADCAST: {
    CREATE: (members: number) => {
      return `You Created a broadcast list with ${members} Recipients`;
    },
    ADD: (userId: string) => {
      return `@${userId} added to this list`;
    },
    REMOVE: (userId: string) => {
      return `@${userId} removed from this list`;
    },
  },
  GROUP: {
    CREATE: (userId: string, name: string) => {
      return `@${userId} Created the group "${name}"`;
    },
    UPDATE: {
      NAME: (userId: string, name: string) => {
        return `@${userId} changed the group name to "${name}"`;
      },
      DESCRIPTION: (userId: string) => {
        return `@${userId} changed the group description`;
      },
      ICON: (userId: string) => {
        return `@${userId} changed the group's icon`;
      },
      REMOVE_ICON: (userId: string) => {
        return `@${userId} deleted this group's icon`;
      },
      ADMIN: (userId: string) => {
        return `@${userId} are now an admin`;
      },
      REVOKE_ADMIN: (userId: string) => {
        return `@${userId} are no longer an admin`;
      },
    },
    LEFT: (userId: string) => {
      return `@${userId} left`;
    },
    ADD: (userId: string, contactUserIds: string) => {
      return `@${userId} added${contactUserIds}`;
    },
    REMOVE: (userId: string, contactUserId: string) => {
      return `@${userId} removed @${contactUserId}`;
    },
    ADD_NOTIFY: (userId: string) => {
      return `addded you`;
    },
  },
};

const CHAT_MODE_TYPE = {
  NAME: "NAME",
  DESCRIPTION: "DESCRIPTION",
  ICON: "ICON",
  REMOVE_ICON: "REMOVE_ICON",
  REMOVE_DESCRIPTION: "REMOVE_DESCRIPTION",
  ADMIN: "ADMIN",
};

const MESSAGE_TYPE = {
  TEXT: "TEXT",
  IMAGE: "IMAGE",
  AUDIO: "AUDIO",
  DOCS: "DOCS",
  VIDEO: "VIDEO",
  VOICE: "VOICE",
  LINK: "LINK",
  MEDIA: "MEDIA",
  LOCATION: "LOCATION",
  HEADING: "HEADING",
  STICKER: "STICKER",
};

const LANGUAGE_CODE = {
  EN: "en",
};

const PAGINATION_DEFAULT = {
  pageNo: 0,
  limit: 1000,
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
  QUEUE_NAME,
  NOTIFICATION_DATA,
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
  DISPUTE,
  DISPUTE_STATUS,
  COMPLAINANT_TYPE,
  ACTIVITY_TYPE,
  CHAT_TYPE,
  SOCKET,
  REDIS_KEY_PREFIX,
  MESSAGE_TYPE,
  CHAT_BOX_PAGINATION,
  NOTIFICATION_MESSAGE_TYPE,
  PAGINATION_DEFAULT,
  LANGUAGE_CODE,
  NOTIFICATION_TYPE,
  CHAT_HEADERS,
  CHAT_MODE_TYPE,
};
