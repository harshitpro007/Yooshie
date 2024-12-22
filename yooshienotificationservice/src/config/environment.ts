"use strict";

import * as dotenv from "dotenv";
import * as fs from "fs";
import * as path from "path";

const ENVIRONMENT = process.env.NODE_ENV || "local";

if (ENVIRONMENT === "local") {
  if (fs.existsSync(path.join(process.cwd(), "/.env.local"))) {
    dotenv.config({ path: ".env.local" });
  } else {
    process.exit(1);
  }
}

export const SERVER = {
  APP_NAME: "Yooshie",
  APP_LOGO:
    "https://appinventiv-development.s3.amazonaws.com/1607946234266_Sqlv5.svg",
  TEMPLATE_PATH: process.cwd() + "/src/views/",
  UPLOAD_DIR: process.cwd() + "/src/uploads/",
  LOG_DIR: process.cwd() + "/logs",
  TOKEN_INFO: {
    EXPIRATION_TIME: {
      USER_REFRESH_TOKEN: 360 * 24 * 60 * 60 * 1000, // 360 days
      USER_LOGIN: 180 * 24 * 60 * 60 * 1000, // 180 days
      ADMIN_LOGIN: 180 * 24 * 60 * 60 * 1000, // 180 days
      FORGOT_PASSWORD: 2 * 60 * 1000, // 2 mins
      VERIFY_EMAIL: 10 * 60 * 1000, // 10 mins
      VERIFY_MOBILE: 1 * 60 * 1000, // 1 mins
      ADMIN_OTP_VERIFY: 10 * 60 * 1000, // 10 mins
      OTP_LIMIT: 5 * 60 * 1000, // 5 mins
      RESET: 5 * 60 * 1000, // 5 mins
      SUB_ADMIN_REINVITE: 1 * 24 * 60 * 60 * 1000, // 24 hrs
    },
    ISSUER: process.env["APP_URL"],
  },
  JWT_PRIVATE_KEY: process.cwd() + "/keys/jwtRS256.key",
  JWT_PUBLIC_KEY: process.cwd() + "/keys/jwtRS256.key.pub",
  // for private.key file use RS256, SHA256, RSA
  JWT_ALGO: "RS256",
  SALT_ROUNDS: 10,
  ENC: "102938$#@$^@1ERF",
  CHUNK_SIZE: 500,
  NOTIFICATION_CHUNK_SIZE: 100,
  APP_URL: process.env["APP_URL"],
  ADMIN_URL: process.env["ADMIN_URL"],
  NOTIFICATION_MICROSERVICE_URL: process.env["NOTIFICATION_MICROSERVICE_URL"],
  API_BASE_URL: `/notification/api`,
  DEV_SECRET_NAME: "yooshie-dev",
  QA_SECRET_NAME: "yooshie-qa",
  STAGE_SECRET_NAME: "yooshie-stage",
  VERIFY_AUTH_TOKEN: "verify-user-auth-token",
  VERIFY_COMMON_AUTH_TOKEN: "verify-common-auth-token",
  VERIFY_ADMIN_AUTH_TOKEN: "verify-auth-token",
  MONGO: {
    DB_NAME: process.env["DB_NAME"],
    DB_URL: process.env["DB_URL"],
    OPTIONS: {
      user: process.env["DB_USER"],
      pass: process.env["DB_PASSWORD"],
      useNewUrlParser: true,
    },
    REPLICA: process.env["DB_REPLICA"],
    REPLICA_OPTION: {
      replicaSet: process.env["DB_REPLICA_SET"],
      authSource: process.env["DB_AUTH_SOURCE"],
      ssl: process.env["DB_SSL"],
    },
  },
  TARGET_MONGO: {
    DB_NAME: process.env["TARGET_DB_NAME"],
    DB_URL: process.env["TARGET_DB_URL"],
    OPTIONS: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    },
  },
  ADMIN_CREDENTIALS: {
    EMAIL: process.env["ADMIN_EMAIL"],
    PASSWORD: process.env["ADMIN_PASSWORD"],
    NAME: process.env["ADMIN_NAME"],
  },
  REDIS: {
    HOST: process.env["REDIS_HOST"],
    PORT: process.env["REDIS_PORT"],
    DB: process.env["REDIS_DB"],
    NAMESPACE: "YooshieApp",
    APP_NAME: "Yooshie",
  },

  MAIL: {
    SMTP: {
      HOST: process.env["SMTP_HOST"],
      PORT: process.env["SMTP_PORT"],
      USER: process.env["SMTP_USER"],
      PASSWORD: process.env["SMTP_PASSWORD"],
      SECURE: process.env["SECURE"],
    },
    FROM_MAIL: process.env["FROM_MAIL"],
    SENDGRID_API_KEY: process.env["SENDGRID_API_KEY"],
  },

  VONAGE: {
    VONAGE_API_KEY: process.env["VONAGE_API_KEY"],
    VONAGE_API_SECRET: process.env["VONAGE_API_SECRET"],
  },

  MESSAGEBIRD: {
    ACCESS_KEY: process.env["MESSAGEBIRD_ACCESS_KEY"],
  },
  BASIC_AUTH: {
    NAME: process.env["BASIC_AUTH_NAME"],
    PASS: process.env["BASIC_AUTH_PASS"],
  },
  API_KEY: process.env["API_KEY"],
  AWS_IAM_USER: {
    ACCESS_KEY_ID: process.env["AWS_ACCESS_KEY"],
    SECRET_ACCESS_KEY: process.env["AWS_SECRET_KEY"],
  },
  S3: {
    ACCESS_KEY_ID: process.env["S3_ACCESS_KEY_ID"],
    SECRET_ACCESS_KEY: process.env["S3_SECRET_ACCESS_KEY"],
    S3_BUCKET_NAME: process.env["S3_BUCKET_NAME"],
    AWS_REGION: "us-east-1",
    BUCKET_URL: process.env["BUCKET_URL"],
    FILE_ACCESS_KEY_ID: process.env["S3_FILE_ACCESS_KEY_ID"],
    FILE_SECRET_ACCESS_KEY: process.env["S3_FILE_SECRET_ACCESS_KEY"],
    S3_FILE_BUCKET_NAME: process.env["S3_FILE_BUCKET_NAME"],
    FILE_BUCKET_URL: process.env["FILE_BUCKET_URL"],
  },
  ENVIRONMENT: process.env["ENVIRONMENT"],
  IP: process.env["IP"],
  NOTIFY_PORT: process.env["NOTIFY_PORT"],
  PROTOCOL: process.env["PROTOCOL"],
  FCM_SERVER_KEY: process.env["FCM_SERVER_KEY"],
  DISPLAY_COLORS: true,
  MAIL_TYPE: 2,
  IS_REDIS_ENABLE: true,
  IS_FIREBASE_ENABLE: true,
  IS_SINGLE_DEVICE_LOGIN: {
    PARTICIPANT: true,
    SUPPORTER: true,
  },
  IS_MAINTENANCE_ENABLE: process.env["IS_MAINTENANCE_ENABLE"],
  BYPASS_OTP: process.env["BYPASS_OTP"],
  FLOCK_URL: process.env["FLOCK_URL"],
  ACTIVITY_TIME: {
    // edit/delete time
    GROUP: 10 * 60 * 1000, // 4 hours
    SHIFT: 10 * 60 * 1000, // 2 hours
  },
  TWILIO_ACC_SID: process.env["TWILIO_ACC_SID"],
  TWILIO_AUTH_TOKEN: process.env["TWILIO_AUTH_TOKEN"],
  TWILIO_NUMBER: process.env["TWILIO_NUMBER"],
  DEFAULT_PASSWORD: "String@123",
  DEFAULT_OTP: "1234",
  NOTIFICATION_URL: process.env["NOTIFICATION_URL"],
  SUBSCRIPTION_URL: process.env["SUBSCRIPTION_URL"],
  USER_URL: process.env["USER_URL"],
  SOCIAL_URL: process.env["SOCIAL_URL"],
  CHAT_URL: process.env["CHAT_URL"],
  FIREBASE_TYPE: process.env["FIREBASE_TYPE"],
  FIREBASE_PROJECT_ID: process.env["FIREBASE_PROJECT_ID"],
  FIREBASE_PRIVATE_KEY_ID: process.env["FIREBASE_PRIVATE_KEY_ID"],
  FIREBASE_PRIVATE_KEY: process.env["FIREBASE_PRIVATE_KEY"],
  FIREBASE_CLIENT_EMAIL: process.env["FIREBASE_CLIENT_EMAIL"],
  FIREBASE_CLIENT_ID: process.env["FIREBASE_CLIENT_ID"],
  FIREBASE_AUTH_URI: process.env["FIREBASE_AUTH_URI"],
  FIREBASE_TOKEN_URI: process.env["FIREBASE_TOKEN_URI"],
  FIREBASE_AUTH_CERT_URL: process.env["FIREBASE_AUTH_CERT_URL"],
  FIREBASE_CLINET_CERT_URL: process.env["FIREBASE_CLINET_CERT_URL"],
  FIREBASE_UNIVERSE_DOMAIN: process.env["FIREBASE_UNIVERSE_DOMAIN"],
  SQS_QUEUE_URL: process.env["SQS_QUEUE_URL"],
};
