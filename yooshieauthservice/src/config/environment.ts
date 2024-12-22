import dotenv from "dotenv";
import fs from "fs";
import path from "path";

const ENVIRONMENT = process.env.NODE_ENV || "local";

if (ENVIRONMENT === "local") {
  if (fs.existsSync(path.join(process.cwd(), "/.env.local"))) {
    dotenv.config({ path: ".env.local" });
  } else {
    process.exit(1);
  }
}

export const SERVER = Object({
  APP_NAME: "Yooshie",
  APP_LOGO:
    "https://appinventiv-development.s3.amazonaws.com/1607946234266_Sqlv5.svg",
  TEMPLATE_PATH: process.cwd() + "/src/views/",
  UPLOAD_DIR: process.cwd() + "/src/uploads/",
  LOG_DIR: process.cwd() + "/logs",
  TOKEN_INFO: {
    EXPIRATION_TIME: {
      USER_LOGIN: 180 * 24 * 60 * 60 * 1000, // 180 days
      ADMIN_LOGIN: 180 * 24 * 60 * 60 * 1000, // 180 days
      ASSISTANT_LOGIN: 180 * 24 * 60 * 60 * 1000, // 180 days
      PROVIDER_LOGIN: 180 * 24 * 60 * 60 * 1000, // 180 days
      FORGOT_PASSWORD: 10 * 60 * 1000, // 10 mins
      VERIFY_EMAIL: 5 * 60 * 1000, // 5 mins
      VERIFY_MOBILE: 2 * 60 * 1000, // 2 mins
      ADMIN_OTP_VERIFY: 10 * 60 * 1000, // 10 mins
      REFRESH_TOKEN: 360 * 24 * 60 * 60 * 100, // 360 days
    },
    ISSUER: process.env["APP_URL"],
  },
  JWT_PRIVATE_KEY: process.cwd() + "/keys/jwtRS256.key",
  JWT_PUBLIC_KEY: process.cwd() + "/keys/jwtRS256.key.pub",
  JWT_PRIVATE_KEY_REFRESH: process.cwd() + "/keys/jwtRS256.key",
  JWT_PUBLIC_KEY_REFRESH: process.cwd() + "/keys/jwtRS256.key.pub",
  // for private.key file use RS256, SHA256, RSA
  JWT_ALGO: "RS256",
  SALT_ROUNDS: 10,
  ENC: "102938$#@$^@1ERF",
  CHUNK_SIZE: 1000,
  APP_URL: process.env["APP_URL"],
  AUTH_URL: process.env["AUTH_URL"],
  AUTH_MICROSERVICE_URL: process.env["AUTH_MICROSERVICE_URL"],
  API_BASE_URL: "/" + "auth" + "/api",
  CREATE_AUTH_TOKEN: "create-auth-token",
  VERIFY_AUTH_TOKEN: "verify-auth-token",
  VERIFY_VERIFICATION_TOKEN: "verify-verification-token",
  DEV_SECRET_NAME: "yooshie-dev",
  QA_SECRET_NAME: "yooshie-qa",
  STAGE_SECRET_NAME: "yooshie-stage",
  MONGO: {
    DB_NAME: process.env["DB_NAME"],
    DB_URL: process.env["DB_URL"],
    OPTIONS: {
      user: process.env["DB_USER"],
      pass: process.env["DB_PASSWORD"],
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
    URL: process.env["ADMIN_URL"],
  },
  ADMIN_END_POINTS: {
    FOR_GOT_PASSWORD: "account/reset-password/",
  },
  REDIS: {
    HOST: process.env["REDIS_HOST"],
    PORT: process.env["REDIS_PORT"],
    DB: process.env["REDIS_DB"],
    NAMESPACE: "Lilyapp",
    APP_NAME: "Lily",
  },

  MAIL: {
    SMTP: {
      HOST: process.env["SMTP_HOST"],
      PORT: process.env["SMTP_PORT"],
      USER: process.env["SMTP_USER"],
      PASSWORD: process.env["SMTP_PASSWORD"],
    },
  },

  MESSAGEBIRD: {
    ACCESS_KEY: process.env["MESSAGEBIRD_ACCESS_KEY"],
  },
  BASIC_AUTH: {
    NAME: process.env["BASIC_AUTH_NAME"],
    PASS: process.env["BASIC_AUTH_PASS"],
  },
  API_KEY: "1234",
  AWS: {
    REGION: "us-east-1",
  },
  AWS_IAM_USER: {
    ACCESS_KEY_ID: process.env["AWS_ACCESS_KEY"],
    SECRET_ACCESS_KEY: process.env["AWS_SECRET_KEY"],
  },
  S3: {
    BUCKET_NAME: process.env["S3_BUCKET_NAME"],
    REGION: process.env["S3_REGION"],
    BUCKET_URL: process.env["BUCKET_URL"],
  },
  ENVIRONMENT: process.env["ENVIRONMENT"],
  IP: process.env["IP"],
  AUTH_PORT: process.env["AUTH_PORT"],
  PROTOCOL: process.env["PROTOCOL"],
  FCM_SERVER_KEY: process.env["FCM_SERVER_KEY"],
  DISPLAY_COLORS: true,
  MAIL_TYPE: 2,
  IS_REDIS_ENABLE: true,
  IS_SINGLE_DEVICE_LOGIN: {
    PARTICIPANT: true,
    SUPPORTER: true,
  },
  IS_MAINTENANCE_ENABLE: process.env["IS_MAINTENANCE_ENABLE"],
  FLOCK_URL: process.env["FLOCK_URL"],
  ACTIVITY_TIME: {
    GROUP: 10 * 60 * 1000, // 4 hours
    SHIFT: 10 * 60 * 1000, // 2 hours
  },
  IS_RABBITMQ_DELAYED_ENABLE: false,

  RABBITMQ: {
    URL: process.env["RABBITMQ_URL"],
    QUEUE_NAME: process.env["RABBITMQ_QUEUE_NAME"],
  },
  DEFAULT_PASSWORD: "String@123",
  DEFAULT_OTP: "1234",
});
