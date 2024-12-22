"use strict";

import * as _ from "lodash";
import * as crypto from "crypto";
import * as mongoose from "mongoose";
import * as promise from "bluebird";
import { buildToken, getRandomOtp, matchOTP } from "@utils/appUtils";
import {
  MESSAGES,
  STATUS,
  TOKEN_TYPE,
  SERVER,
  DB_MODEL_REF,
  ENVIRONMENT,
  MAIL_TYPE,
  REDIS_PREFIX,
  JOB_SCHEDULER_TYPE,
  USER_TYPE,
  CAL_TYPE,
  REDIS_KEY_PREFIX,
} from "@config/index";
import { userDaoV1 } from "@modules/user/index";
import { baseDao } from "@modules/baseDao/index";
import { loginHistoryDao } from "@modules/loginHistory/index";
import { redisClient } from "@lib/redis/RedisClient";
import { sendMessageToFlock } from "@utils/FlockUtils";
import { logger } from "@lib/index";
import { axiosService } from "@lib/axiosService";
import { rewardDaoV1 } from "@modules/reward";
const AWS = require("aws-sdk");
export class UserController {
  private modelLoginHistory: any;
  private modelUser: any;
  constructor() {
    this.modelLoginHistory = DB_MODEL_REF.LOGIN_HISTORY;
    this.modelUser = DB_MODEL_REF.USER;
  }

  /**
   * @function removeSession
   * @description Remove the user login session
   */
  async removeSession(params, isSingleSession: boolean) {
    try {
      if (isSingleSession)
        await loginHistoryDao.removeDeviceById({ userId: params.userId });
      else
        await loginHistoryDao.removeDeviceById({
          userId: params.userId,
          deviceId: params.deviceId,
        });

      if (SERVER.IS_REDIS_ENABLE) {
        if (isSingleSession) {
          let keys: any = await redisClient.getKeys(`*${params.userId}.*`);
          keys = keys.filter(
            (v1) =>
              Object.values(JOB_SCHEDULER_TYPE).findIndex(
                (v2) => v2 === v1.split(".")[0]
              ) === -1
          );
          console.log("removed keys are => ", keys);
          if (keys.length) await redisClient.deleteKey(keys);
        } else
          await redisClient.deleteKey(`${params.userId}.${params.deviceId}`);
      }
    } catch (error) {
      sendMessageToFlock({ title: "_removeSession", error: error.stack });
    }
  }

  /**
   * @function updateUserDataInRedis
   * @description update user's data in redis
   * @param params.salt
   * @param params.userId
   * @returns
   */
  async updateUserDataInRedis(params, isAlreadySaved = false) {
    try {
      delete params.salt;
      if (SERVER.IS_REDIS_ENABLE) {
        let keys: any = await redisClient.getKeys(
          `*${params.userId || params._id.toString()}*`
        );
        keys = keys.filter(
          (v1) =>
            Object.values(JOB_SCHEDULER_TYPE).findIndex(
              (v2) => v2 === v1.split(".")[0]
            ) === -1
        );
        const promiseResult = [],
          array = [];
        for (const key of keys) {
          if (isAlreadySaved) {
            let userData: any = await redisClient.getValue(
              `${params.userId || params._id.toString()}.${key.split(".")[1]}`
            );
            array.push(key);
            array.push(
              JSON.stringify(buildToken(_.extend(JSON.parse(userData), params)))
            );
            promiseResult.push(userData);
          } else {
            array.push(key);
            array.push(JSON.stringify(buildToken(params)));
          }
        }

        await Promise.all(promiseResult);
        if (array.length) redisClient.mset(array);
      }
      return {};
    } catch (error) {
      logger.error(error);
      throw error;
    }
  }

  /**
   * @function updateUserDataInDb
   * @description this function used to update the user data in DB
   */
  async updateUserDataInDb(params) {
    try {
      await baseDao.updateMany(
        this.modelLoginHistory,
        { "userId._id": params._id },
        { $set: { userId: params } },
        {}
      );

      return {};
    } catch (error) {
      throw error;
    }
  }

  /**
   * @function signUp
   * @description signup of participant/supporter
   * @param params.email: user's email (required)
   * @param params.password: user's password (required)
   * @param params.userType: user type (required)
   */
  async loginSignUp(params: UserRequest.loginSignUp) {
    // MongoDB transactions
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const fullMobileNo = params.countryCode + params.mobileNo;
      const otp_count: any = await redisClient.getValue(
        `${SERVER.APP_NAME}.${fullMobileNo}.${REDIS_PREFIX.OTP_ATTEMP}`
      );
      if (otp_count && JSON.parse(otp_count).count > 4)
        return Promise.reject(MESSAGES.ERROR.LIMIT_EXCEEDS);

      const isExist = await userDaoV1.isMobileExists(params);
      if (isExist?.status === STATUS.BLOCKED)
        return Promise.reject(MESSAGES.ERROR.BLOCKED);

      await this.sendOtpOnMobile(params, true);

      if (isExist) {
        if (!isExist.isMobileVerified)
          return Promise.reject(MESSAGES.ERROR.MOBILE_NO_NOT_VERIFIED);

        return MESSAGES.SUCCESS.SIGNUP_VERIFICATION({
          userId: isExist._id,
          // otp: otp,
          mobileNo: params.mobileNo,
          countryCode: params.countryCode,
          isMobileVerified: isExist.isMobileVerified,
          language: isExist.language,
          firstName: isExist.firstName,
          lastName: isExist.lastName,
          name: isExist.name,
        });
      } else {
        const { clientId, clientNumber } =
          await userDaoV1.generateNextClientDetails();
        // Assign to the user
        params["clientId"] = clientId;
        params["clientNumber"] = clientNumber;
        params.fullMobileNo = fullMobileNo;
        const step1 = await userDaoV1.signUp(params, session);
        await session.commitTransaction();
        session.endSession();
        return MESSAGES.SUCCESS.SIGNUP_VERIFICATION({
          userId: step1._id,
          // otp: otp,
          mobileNo: params.mobileNo,
          countryCode: params.countryCode,
          isMobileVerified: step1.isMobileVerified,
        });
      }
    } catch (error) {
      // MongoDB transactions
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  }

  /**
   * @function sendOTP
   * @description send/resend otp on email/number
   * @payload payload contains encrypted data : decrypted params defined below
   * @param params.email user's email (required)
   * @param params.type otp type (required)
   * @returns
   */
  async sendOtpOnMobile(params: UserRequest.SendOtp, signUp: boolean = false) {
    try {
      if (!signUp) {
        const isExist = await userDaoV1.isMobileExists(params);
        if (!isExist)
          return Promise.reject(MESSAGES.ERROR.MOBILE_NOT_REGISTERED);
        if (isExist.status === STATUS.BLOCKED)
          return Promise.reject(MESSAGES.ERROR.BLOCKED);
      }
      const fullMobileNo = params?.countryCode + params?.mobileNo;
      const environment: Array<string> = [
        ENVIRONMENT.PRODUCTION,
        ENVIRONMENT.PREPROD,
        ENVIRONMENT.STAGE,
        ENVIRONMENT.QA,
      ];
      const otp_count: any = await redisClient.getValue(
        `${SERVER.APP_NAME}.${fullMobileNo}.${REDIS_PREFIX.OTP_ATTEMP}`
      );

      if (otp_count && JSON.parse(otp_count).count > SERVER.OTP_LIMIT)
        return Promise.reject(MESSAGES.ERROR.LIMIT_EXCEEDS); //NOSONAR

      const otp = getRandomOtp(6).toString();
      if (environment.includes(SERVER.ENVIRONMENT)) {
        redisClient.setExp(
          `${fullMobileNo}`,
          SERVER.TOKEN_INFO.EXPIRATION_TIME.VERIFY_MOBILE / 1000,
          JSON.stringify({ fullMobileNo: fullMobileNo, otp: otp })
        );
        // let messageData = {
        // 	to: fullMobileNo,
        // 	body: OTP_BODY.VERIFY_MOBILE + otp
        // }
        // axiosService.postData({ "url": process.env.NOTIFICATION_APP_URL + SERVER.SEND_MESSAGE, "body": { data: messageData } });

        if (SERVER.IS_REDIS_ENABLE)
          redisClient.setExp(
            `${SERVER.APP_NAME}.${fullMobileNo}.${REDIS_PREFIX.OTP_ATTEMP}`,
            SERVER.TOKEN_INFO.EXPIRATION_TIME.OTP_LIMIT / 1000,
            JSON.stringify({
              fullMobileNo: fullMobileNo,
              count: JSON.parse(otp_count)
                ? JSON.parse(otp_count).count + 1
                : 1,
            })
          );
      } else {
        redisClient.setExp(
          `${fullMobileNo}`,
          SERVER.TOKEN_INFO.EXPIRATION_TIME.VERIFY_MOBILE / 1000,
          JSON.stringify({
            fullMobileNo: fullMobileNo,
            otp: SERVER.DEFAULT_OTP,
          })
        );
      }
      return MESSAGES.SUCCESS.SEND_OTP;
    } catch (error) {
      logger.error(error);
      throw error;
    }
  }

  /**
   * @function sendOTP
   * @description send/resend otp on email/number
   * @payload payload contains encrypted data : decrypted params defined below
   * @param params.email user's email (required)
   * @param params.type otp type (required)
   * @returns
   */
  async sendOtpOnEmail(params: UserRequest.SendOtp, tokenData: TokenData) {
    try {
      const isUser = await userDaoV1.findUserById(tokenData.userId);
      if (!isUser) return Promise.reject(MESSAGES.ERROR.USER_NOT_FOUND);

      // const isExist = await userDaoV1.isEmailExists(params);
      // if (isExist) return Promise.reject(MESSAGES.ERROR.EMAIL_ALREADY_EXIST);

      const environment: Array<string> = [
        ENVIRONMENT.PRODUCTION,
        ENVIRONMENT.DEV,
        ENVIRONMENT.LOCAL,
        ENVIRONMENT.PREPROD,
        ENVIRONMENT.QA,
      ];
      const otp_count: any = await redisClient.getValue(
        `${SERVER.APP_NAME}.${params.email}.${REDIS_PREFIX.OTP_ATTEMP}`
      );

      if (otp_count && JSON.parse(otp_count).count > SERVER.OTP_LIMIT)
        return Promise.reject(MESSAGES.ERROR.LIMIT_EXCEEDS); //NOSONAR

      const otp = getRandomOtp(6).toString();
      if (environment.includes(SERVER.ENVIRONMENT)) {
        redisClient.setExp(
          `${params.email}`,
          SERVER.TOKEN_INFO.EXPIRATION_TIME.VERIFY_EMAIL / 1000,
          JSON.stringify({ email: params.email, otp: otp })
        );
        let mailData = {
          type: MAIL_TYPE.VERIFY_EMAIL,
          email: params.email,
          otp: otp,
        };
        axiosService.postData({
          url: process.env.NOTIFICATION_APP_URL + SERVER.SEND_MAIL,
          body: mailData,
        });
        if (SERVER.IS_REDIS_ENABLE)
          redisClient.setExp(
            `${SERVER.APP_NAME}.${params.email}.${REDIS_PREFIX.OTP_ATTEMP}`,
            SERVER.TOKEN_INFO.EXPIRATION_TIME.OTP_LIMIT / 1000,
            JSON.stringify({
              email: params.email,
              count: JSON.parse(otp_count)
                ? JSON.parse(otp_count).count + 1
                : 1,
            })
          );
      } else {
        redisClient.setExp(
          `${params.email}`,
          SERVER.TOKEN_INFO.EXPIRATION_TIME.VERIFY_EMAIL / 1000,
          JSON.stringify({ email: params.email, otp: SERVER.DEFAULT_OTP })
        );
      }
      return MESSAGES.SUCCESS.SEND_OTP;
    } catch (error) {
      logger.error(error);
      throw error;
    }
  }

  /**
   * @function verifyMobileOTP
   * @description verify otp on login/signup
   * @param params.email: user's email (required)
   * @param params.otp: otp (required)
   */
  async verifyMobileOTP(params: UserRequest.VerifyOTP) {
    try {
      const step1 = await userDaoV1.isMobileExists(params);
      if (!step1) return Promise.reject(MESSAGES.ERROR.MOBILE_NOT_REGISTERED);
      if (step1.status === STATUS.BLOCKED)
        return Promise.reject(MESSAGES.ERROR.BLOCKED);
      let step2 = await redisClient.getValue(step1.fullMobileNo);
      let isOTPMatched = await matchOTP(params.otp, step2);
      const environment: Array<string> = [
        ENVIRONMENT.PRODUCTION,
        ENVIRONMENT.PREPROD,
        ENVIRONMENT.STAGE,
        ENVIRONMENT.DEV,
        ENVIRONMENT.LOCAL,
        ENVIRONMENT.QA,
      ];
      if (
        environment.includes(SERVER.ENVIRONMENT) &&
        params.otp == SERVER.DEFAULT_OTP
      )
        isOTPMatched = true;

      if (!isOTPMatched) {
        return Promise.reject(MESSAGES.ERROR.INVALID_OTP);
      }
      let dataToReturn = {};
      const salt = crypto.randomBytes(64).toString("hex");
      const tokenData = {
        userId: step1._id,
        deviceId: params.deviceId,
        accessTokenKey: salt,
        type: TOKEN_TYPE.USER_LOGIN,
        userType: step1.userType,
      };
      await this.removeSession(
        { userId: step1._id, deviceId: params.deviceId },
        true
      );
      const location = params.remoteAddress;
      let authToken = await axiosService.postData({
        url: process.env.AUTH_APP_URL + SERVER.CREATE_AUTH_TOKEN,
        body: tokenData,
      });
      const [step3, accessToken] = await promise.join(
        loginHistoryDao.createUserLoginHistory({
          ...params,
          ...step1,
          salt,
          location,
        }),
        authToken.data.jwtToken
        // createToken(tokenData)
      );
      if (SERVER.IS_REDIS_ENABLE)
        redisClient.setExp(
          `${step1._id.toString()}.${params.deviceId}`,
          Math.floor(
            SERVER.TOKEN_INFO.EXPIRATION_TIME[TOKEN_TYPE.USER_LOGIN] / 1000
          ),
          JSON.stringify(buildToken({ ...step1, ...params, salt }))
        );

      await baseDao.findOneAndUpdate(
        this.modelUser,
        { _id: step1._id },
        { isMobileVerified: true },
        {}
      );
      dataToReturn = {
        accessToken,
        userId: step1._id,
        mobileNo: step1?.mobileNo,
        countryCode: step1?.countryCode,
        isMobileVerified: true,
        name: step1?.name,
        profilePicture: step1?.profilePicture,
        userType: step1?.userType,
        email: step1?.email,
        dob: step1?.dob,
        occupation: step1?.occupation,
        firstName: step1?.firstName,
        lastName: step1?.lastName,
        gender: step1?.gender,
        isEmailVerified: step1?.isEmailVerified,
        isProfileCompleted: step1?.isProfileCompleted,
        isAssistantAssigned: step1?.isAssistantAssigned,
        assistantId: step1?.assistantId,
        assistantName: step1?.assistantName,
        assistantProfilePicture: step1?.assistantProfilePicture,
      };

      redisClient.deleteKey(
        `${SERVER.APP_NAME}.${step1.fullMobileNo}.${REDIS_PREFIX.OTP_ATTEMP}`
      );
      return MESSAGES.SUCCESS.VERIFY_OTP(dataToReturn);
    } catch (error) {
      throw error;
    }
  }

  /**
   * @function verifyMobileOTP
   * @description verify otp on login/signup
   * @param params.email: user's email (required)
   * @param params.otp: otp (required)
   */
  async verifyEmailOTP(params: UserRequest.VerifyOTP, tokenData) {
    try {
      const isUser = await userDaoV1.findUserById(tokenData.tokenData.userId);
      if (!isUser) return Promise.reject(MESSAGES.ERROR.USER_NOT_FOUND);

      if (isUser.status === STATUS.BLOCKED)
        return Promise.reject(MESSAGES.ERROR.BLOCKED);
      let step2 = await redisClient.getValue(isUser.email);
      let isOTPMatched = await matchOTP(params.otp, step2);
      const environment: Array<string> = [
        ENVIRONMENT.PRODUCTION,
        ENVIRONMENT.PREPROD,
        ENVIRONMENT.STAGE,
        ENVIRONMENT.DEV,
        ENVIRONMENT.QA,
      ];
      if (
        environment.includes(SERVER.ENVIRONMENT) &&
        params.otp == SERVER.DEFAULT_OTP
      )
        isOTPMatched = true;

      if (!isOTPMatched) {
        return Promise.reject(MESSAGES.ERROR.INVALID_OTP);
      }
      let dataToReturn: any = {};
      await baseDao.findOneAndUpdate(
        this.modelUser,
        { _id: isUser._id },
        { isEmailVerified: true },
        {}
      );

      dataToReturn = {
        userId: isUser._id,
        mobileNo: isUser?.mobileNo,
        countryCode: isUser?.countryCode,
        isEmailVerified: true,
        profilePicture: isUser?.profilePicture,
        firstName: isUser?.firstName,
        lastName: isUser?.lastName,
        isProfileCompleted: isUser?.isProfileCompleted,
        isMobileVerified: isUser?.isMobileVerified,
        name: isUser?.name,
        userType: isUser?.userType,
        email: isUser?.email,
        dob: isUser?.dob,
        occupation: isUser?.occupation,
        gender: isUser?.gender,
      };

      redisClient.deleteKey(`${isUser.email}`);
      redisClient.deleteKey(
        `${SERVER.APP_NAME}.${params.email}.${REDIS_PREFIX.OTP_ATTEMP}`
      );
      if (!isUser.assistantId) {
        try {
          await axiosService.patchData({
            url: SERVER.ADMIN_APP_URL + SERVER.ASSIGN_ASSISTANT,
            auth: `Bearer ${tokenData.accessToken}`,
          });
        } catch (error) {
          console.error("Error in assigning assistant:", error.response?.data);
          throw error.response?.data.message;
        }
      }
      const userData = await userDaoV1.findUserById(tokenData.tokenData.userId);
      (dataToReturn.isAssistantAssigned = userData?.isAssistantAssigned),
        (dataToReturn.assistantId = userData?.assistantId),
        (dataToReturn.assistantName = userData?.assistantName),
        (dataToReturn.assistantProfilePicture =
          userData?.assistantProfilePicture);
      return MESSAGES.SUCCESS.VERIFY_OTP(dataToReturn);
    } catch (error) {
      throw error;
    }
  }

  /**
   * @function logout
   * @author yash sharma
   * @description this function is used to logout the user
   */
  async logout(tokenData: TokenData) {
    try {
      await this.removeSession(tokenData, true);
      return MESSAGES.SUCCESS.USER_LOGOUT;
    } catch (error) {
      throw error;
    }
  }

  /**
   * @function profile
   * @author yash sharma
   * @description View the profile of user
   */
  async profile(params: UserId, tokenData: TokenData) {
    try {
      const userId = params?.userId ? params.userId : tokenData.userId;
      const user = await userDaoV1.findUserById(userId);
      if (!user) return Promise.reject(MESSAGES.ERROR.USER_NOT_FOUND);

      const [events, eventsApple] = await Promise.all([
        baseDao.findOne(
          "calender",
          {
            userId: userId,
            source: CAL_TYPE.GOOGLE,
          },
          { events: 1 }
        ),
        baseDao.findOne(
          "calender",
          {
            userId: userId,
            source: CAL_TYPE.APPLE,
          },
          { events: 1 }
        ),
      ]);

      user.googleEventsCount = events?.events?.length || 0;
      user.appleEventsCount = eventsApple?.events?.length || 0;

      rewardDaoV1.handleLogin(userId);

      return MESSAGES.SUCCESS.DETAILS(user);
    } catch (error) {
      throw error;
    }
  }

  /**
   * @function editProfilePic
   * @description Edit the profile of user
   */
  async editProfile(params: UserRequest.EditProfile, tokenData: TokenData) {
    try {
      const model: any = DB_MODEL_REF.USER;
      const userId = tokenData.userId;
      const user = await userDaoV1.findUserById(userId);
      if (params.email) {
        const isEmail = await userDaoV1.isEmailExists(params);
        if (isEmail) return Promise.reject(MESSAGES.ERROR.EMAIL_ALREADY_EXIST);
        await this.sendOtpOnEmail(params, tokenData);
        //also need to update sharewith in task service if task share with any user.

        await userDaoV1.findOneAndUpdate(
          model,
          { _id: tokenData.userId },
          { email: params.email, isEmailVerified: false }
        );
      }
      if (params.firstName && params.lastName) {
        params.name = params.firstName + " " + params.lastName;
      } else if (params.firstName && user?.lastName) {
        params.name = params.firstName + " " + user.lastName;
      } else if (params.lastName && user?.firstName) {
        params.name = user.firstName + " " + params.lastName;
      }
      delete params.email;
      const data = await userDaoV1.editProfile(params, userId);
      data.userId = data._id;
      const { events, eventsApple } = await userDaoV1.eventsCount(userId);
      data.googleEventsCount = events?.events?.length || 0;
      data.appleEventsCount = eventsApple?.events?.length || 0;
      return MESSAGES.SUCCESS.EDIT_PROFILE(data);
    } catch (error) {
      console.error("Error in editProfile:", error);
      throw error;
    }
  }

  /**
   * @function editProfileSetting
   * @description this function will update the user profile
   * @param params.offineStatus
   * @param params.pushNotificationStatus
   */
  async editProfileSetting(params: UserRequest.EditProfileSetting, tokenData) {
    try {
      const data = await userDaoV1.editProfileSetting(
        params,
        tokenData.tokenData
      );
      await this.redisNotificationMapping(data, tokenData);
      return MESSAGES.SUCCESS.EDIT_PROFILE(data);
    } catch (error) {
      throw error;
    }
  }

  /**
   * @function manageNotification
   * @description this function used to manage the notification
   */
  async manageNotification(
    params: UserRequest.ManageNotification,
    tokenData: TokenData
  ) {
    try {
      if (
        "pushNotificationStatus" in params &&
        (params.pushNotificationStatus || !params.pushNotificationStatus)
      ) {
        await baseDao.updateOne(
          this.modelUser,
          { _id: tokenData.userId },
          { $set: { pushNotificationStatus: params.pushNotificationStatus } },
          {}
        );
        baseDao.updateMany(
          this.modelLoginHistory,
          { userId: tokenData.userId },
          {
            $set: {
              "userId.pushNotificationStatus": params.pushNotificationStatus,
            },
          },
          {}
        );
      }
      if (
        "groupaNotificationStatus" in params &&
        (params.groupaNotificationStatus || !params.groupaNotificationStatus)
      ) {
        await baseDao.updateOne(
          this.modelUser,
          { _id: tokenData.userId },
          {
            $set: { groupaNotificationStatus: params.groupaNotificationStatus },
          },
          {}
        );
        baseDao.updateMany(
          this.modelLoginHistory,
          { userId: tokenData.userId },
          {
            $set: {
              "userId.groupaNotificationStatus":
                params.groupaNotificationStatus,
            },
          },
          {}
        );
      }
      return MESSAGES.SUCCESS.PROFILE_SETTINGS;
    } catch (error) {
      throw error;
    }
  }

  /**
   * @function redisNotificationMapping
   * set/unset mute and offline status status for user privacy
   * push default true and offline default false
   */
  async redisNotificationMapping(
    params: UserRequest.EditProfileSetting,
    tokenData
  ) {
    try {
      if (params.offlineStatus)
        await redisClient.storeValue(SERVER.APP_NAME + "_" + tokenData.tokenData.userId + REDIS_KEY_PREFIX.OFFLINE, Date.now());
      if (!params.offlineStatus)
        await redisClient.deleteKey(SERVER.APP_NAME +"_" +tokenData.tokenData.userId +REDIS_KEY_PREFIX.OFFLINE);
      if (!params.pushNotificationStatus)
        await redisClient.storeValue(SERVER.APP_NAME +"_" +tokenData.tokenData.userId +REDIS_KEY_PREFIX.MUTE_CHAT,Date.now());
      if (params.pushNotificationStatus)
        await redisClient.deleteKey(SERVER.APP_NAME +"_" +tokenData.tokenData.userId +REDIS_KEY_PREFIX.MUTE_CHAT);
      if (!params.inAppNotificationStatus)
        await redisClient.storeValue(SERVER.APP_NAME +"_" +tokenData.tokenData.userId +REDIS_KEY_PREFIX.MUTE_INAPP_CAHT, Date.now());
      if (params.inAppNotificationStatus)
        await redisClient.deleteKey(SERVER.APP_NAME +"_" +tokenData.tokenData.userId +REDIS_KEY_PREFIX.MUTE_INAPP_CAHT);
      const apiUrl = SERVER.CHAT_URL + SERVER.USER_SETTINGS;
      const UserSettingsData = {
        offlineStatus: params?.offlineStatus,
        pushNotificationStatus: params?.pushNotificationStatus,
        inAppNotificationStatus: params?.inAppNotificationStatus,
      }
      axiosService.post({apiUrl, body: UserSettingsData , auth: `Bearer ${tokenData}`});
      return;
    } catch (error) {
      throw error;
    }
  }

  /**
   * @function preSignedURL
   * @description Get a predefined URL for uploading profile picture
   */
  async preSignedURL(params: UserRequest.PreSignedUrl, tokenData: TokenData) {
    try {
      // const ENVIRONMENT = process.env.NODE_ENV.trim();
      // const ENVIRONMENT2 = ["dev", "qa"]
      // if (ENVIRONMENT2.includes(ENVIRONMENT)) {
      // 	AWS.config.update({
      // 		accessKeyId: SERVER.S3.ACCESS_KEY_ID,
      // 		secretAccessKey: SERVER.S3.SECRET_ACCESS_KEY,
      // 		region: SERVER.S3.AWS_REGION,
      // 	});
      // }
      const s3 = new AWS.S3();
      console.log(SERVER.S3.S3_BUCKET_NAME, "*********************bucket name");
      const data = {
        Bucket: SERVER.S3.S3_BUCKET_NAME,
        Key: params.filename,
        Expires: 60 * 60, // URL expiration time in seconds
        ContentType: params.fileType,
        // ACL: "public-read",
      };
      console.log("********************s3 data***********", data);

      const presignedUrl: { url: string } = {
        url: String(await s3.getSignedUrlPromise("putObject", data)),
      };

      return MESSAGES.SUCCESS.DETAILS(presignedUrl);
    } catch (error) {
      throw error;
    }
  }

  /**
   * @function userListing
   * @description get the listing of users
   * @param params.pageNo
   * @param params.limit
   * @returns array of users
   */
  async userListing(params: ListingRequest, tokenData: TokenData) {
    try {
      if (tokenData.userType === USER_TYPE.USER) {
        params.userId = tokenData.userId;
      }
      const data = await userDaoV1.userListing(params);
      return MESSAGES.SUCCESS.DETAILS(data);
    } catch (error) {
      throw error;
    }
  }

  /**
   * @function userListing
   * @description get the listing of particular assistant users
   * @param params.pageNo
   * @param params.limit
   * @returns array of users
   */
  async assistantUserListing(params: ListingRequest, tokenData: TokenData) {
    try {
      const data = await userDaoV1.assistantUserListing(
        params,
        params?.assistantId || tokenData.userId
      );
      return MESSAGES.SUCCESS.DETAILS(data);
    } catch (error) {
      throw error;
    }
  }

  async blockOrDeleteUser(
    params: UserRequest.blockDeleteUser,
    tokenData: TokenData
  ) {
    try {
      if (tokenData.userType === USER_TYPE.ASSISTANT) {
        return Promise.reject(MESSAGES.ERROR.INVALID_USER);
      }

      const isBlocked = params.type === STATUS.BLOCKED;
      const isUnblocked = params.type === STATUS.UN_BLOCKED;
      const isDeleted = params.type === STATUS.DELETED;

      if (
        (isBlocked || isUnblocked) &&
        tokenData.userType === USER_TYPE.ADMIN
      ) {
        await userDaoV1.blockUnblock(params);

        if (isBlocked) {
          await this.removeSession(params, true);
          return MESSAGES.SUCCESS.BLOCK_USER;
        }

        if (isUnblocked) {
          return MESSAGES.SUCCESS.UNBLOCK_USER;
        }
      } else if (isDeleted) {
        await Promise.all([
          userDaoV1.deleteUser(params),
          this.removeSession(params, true),
        ]);

        return MESSAGES.SUCCESS.DELETE_USER;
      }

      return Promise.reject(MESSAGES.ERROR.INVALID_ADMIN);
    } catch (error) {
      throw error;
    }
  }

  /**
   * @function notificationListing
   * @description get the listing of users
   * @param params.pageNo
   * @param params.limit
   * @returns array of users
   */
  async notificationListing(params: ListingRequest, tokenData) {
    try {
      const data = await axiosService.getData({
        url: SERVER.NOTIFICATION_APP_URL + SERVER.NOTIFICATION_LISTING,
        payload: params,
        auth: `Bearer ${tokenData.accessToken}`,
      });
      return MESSAGES.SUCCESS.LIST(data.data);
    } catch (error) {
      console.log("Error", error);
      throw error;
    }
  }
}

export const userController = new UserController();
