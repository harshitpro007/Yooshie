"use strict";

import * as _ from "lodash";
import * as crypto from "crypto";
import * as promise from "bluebird";

import { encryptHashPassword, matchPassword } from "@utils/appUtils";
import {
  MESSAGES,
  STATUS,
  USER_TYPE,
  TOKEN_TYPE,
  SERVER,
  DB_MODEL_REF,
  GEN_STATUS,
  REDIS_PREFIX,
  MAIL_TYPE,
} from "@config/index";
import { adminDaoV1 } from "@modules/admin/index";

import { loginHistoryDao } from "@modules/loginHistory/index";
import { baseDao } from "@modules/baseDao/index";

import { redisClient } from "@lib/redis/RedisClient";
import { axiosService } from "@lib/axiosService";
const AWS = require("aws-sdk");

class AdminController {
  private modelLoginHistory: any;
  constructor() {
    this.modelLoginHistory = DB_MODEL_REF.LOGIN_HISTORY;
  }

  /**
   * @function updateUserDataInDb
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
      console.log("Error", error);
      throw error;
    }
  }

  /**
   * @function login
   * @description This function used to login the admin
   */
  async login(params: AdminRequest.Login) {
    try {
      const step1 = await adminDaoV1.isEmailExists(params);
      if (!step1 || step1?.userType !== USER_TYPE.ADMIN)
        return Promise.reject(MESSAGES.ERROR.EMAIL_NOT_REGISTERED);
      if (step1.status === GEN_STATUS.BLOCKED)
        return Promise.reject(MESSAGES.ERROR.BLOCKED);
      const isPasswordMatched = await matchPassword(
        params.password,
        step1.hash,
        step1.salt
      );
      console.log("isPasswordMatched", isPasswordMatched);
      if (!isPasswordMatched)
        return Promise.reject(MESSAGES.ERROR.INCORRECT_PASSWORD);
      else {
        if (step1.status === GEN_STATUS.PENDING) {
          await adminDaoV1.updateStatus({ userId: step1._id });
          step1.status = STATUS.UN_BLOCKED;
        }
        await loginHistoryDao.removeDeviceById({ userId: step1._id });
        const salt = crypto.randomBytes(64).toString("hex");
        const tokenData = {
          userId: step1._id,
          deviceId: params.deviceId,
          accessTokenKey: salt,
          type: TOKEN_TYPE.ADMIN_LOGIN,
          userType: step1.userType,
        };
        let authToken = await axiosService.postData({
          url: process.env.AUTH_APP_URL + SERVER.CREATE_AUTH_TOKEN,
          body: tokenData,
        });
        const [step2, accessToken] = await promise.join(
          loginHistoryDao.createUserLoginHistory({ ...params, ...step1, salt }),
          authToken.data.jwtToken
          // createRefreshToken(tokenData)
        );

        // await adminDaoV1.findOneAndUpdate(
        // 	model,
        // 	{ _id: step1._id },
        // 	{ refreshToken }
        //   );
        // await redisClient.deleteKey(`${SERVER.APP_NAME}.${SERVER.ENVIRONMENT}.${step1.email}.${REDIS_PREFIX.INVITE}`)
        delete step1.salt;
        delete step1.hash;
        delete step1.createdAt;
        return MESSAGES.SUCCESS.LOGIN({ accessToken, ...step1 });
      }
    } catch (error) {
      console.log("Error", error);
      throw error;
    }
  }

  /**
   * @function logout
   * @description this function used to logout admin
   */
  async logout(tokenData: TokenData) {
    try {
      await loginHistoryDao.removeDeviceById(tokenData);
      return MESSAGES.SUCCESS.LOGOUT;
    } catch (error) {
      console.log("Error", error);
      throw error;
    }
  }

  /**
   * @function forgotPassword
   */
  async forgotPassword(params: AdminRequest.ForgotPasswordRequest) {
    try {
      const step1 = await adminDaoV1.isEmailExists(params);
      if (!step1) return Promise.reject(MESSAGES.ERROR.EMAIL_NOT_REGISTERED);

      if (step1.status === STATUS.BLOCKED)
        return Promise.reject(MESSAGES.ERROR.BLOCKED);

      const otp_count: any = await redisClient.getValue(
        `${SERVER.APP_NAME}.${SERVER.ENVIRONMENT}.${params.email}.${REDIS_PREFIX.OTP_ATTEMP}`
      );
      if (otp_count && JSON.parse(otp_count).count > 2)
        return Promise.reject(MESSAGES.ERROR.LIMIT_EXCEEDS);

      const salt = crypto.randomBytes(64).toString("hex");
      const tokenData = {
        userId: step1._id,
        email: params.email,
        accessTokenKey: salt,
        userType: step1.userType,
        type: TOKEN_TYPE.FORGOT_PASSWORD,
      };

      let authToken = await axiosService.postData({
        url: process.env.AUTH_APP_URL + SERVER.CREATE_AUTH_TOKEN,
        body: tokenData,
      });
      redisClient.setExp(
        `${SERVER.APP_NAME}.${SERVER.ENVIRONMENT}.${params.email}`,
        SERVER.TOKEN_INFO.EXPIRATION_TIME.FORGOT_PASSWORD / 1000,
        JSON.stringify({ email: params.email, token: authToken.data.jwtToken })
      );
      let mailData;
      if (step1.userType === USER_TYPE.ASSISTANT) {
        mailData = {
          type: MAIL_TYPE.FORGOT_PASSWORD,
          email: params.email,
          name: step1.name,
          link: `${SERVER.ASSISTANT_URL}/reset-password?token=${authToken.data.jwtToken}`,
        };
      } else {
        mailData = {
          type: MAIL_TYPE.FORGOT_PASSWORD,
          email: params.email,
          name: step1.name,
          link: `${SERVER.APP_URL}/reset-password?token=${authToken.data.jwtToken}`,
        };
      }
      axiosService.postData({
        url: process.env.NOTIFICATION_APP_URL + SERVER.SEND_MAIL,
        body: mailData,
      });
      if (SERVER.IS_REDIS_ENABLE) {
        redisClient.setExp(
          `${SERVER.APP_NAME}.${SERVER.ENVIRONMENT}.${params.email}.${REDIS_PREFIX.OTP_ATTEMP}`,
          SERVER.TOKEN_INFO.EXPIRATION_TIME.OTP_LIMIT / 1000,
          JSON.stringify({
            email: params.email,
            token: authToken.data.jwtToken,
            count: JSON.parse(otp_count) ? JSON.parse(otp_count).count + 1 : 1,
          })
        );
      }
      return MESSAGES.SUCCESS.FORGOT_PASSWORD;
    } catch (error) {
      console.log("Error", error);
      throw error;
    }
  }

  /**
   * @function resetPassword
   * @description This function used to enter new password
   */
  async resetPassword(params: AdminRequest.ChangeForgotPassword, tokenData) {
    try {
      console.log(params);
      const step1 = await adminDaoV1.findAdminById(tokenData.sub);
      if (!step1) return Promise.reject(MESSAGES.ERROR.EMAIL_NOT_REGISTERED);
      let step2: any = await redisClient.getValue(
        `${SERVER.APP_NAME}.${SERVER.ENVIRONMENT}.${step1.email}`
      );
      if (!step2) return Promise.reject(MESSAGES.ERROR.RESET_TOKEN_EXPIRED);
      const isPasswordMatched = await matchPassword(
        params.password,
        step1.hash,
        step1.salt
      );
      if (isPasswordMatched)
        return Promise.reject(MESSAGES.ERROR.ENTER_NEW_PASSWORD);
      params.hash = encryptHashPassword(params.password, step1.salt);
      await adminDaoV1.changePassword(params, step1._id);
      redisClient.deleteKey(
        `${SERVER.APP_NAME}.${SERVER.ENVIRONMENT}.${step1.email}`
      );
      redisClient.deleteKey(
        `${SERVER.APP_NAME}.${SERVER.ENVIRONMENT}.${step1.email}.${REDIS_PREFIX.OTP_ATTEMP}`
      );
      return MESSAGES.SUCCESS.RESET_PASSWORD;
    } catch (error) {
      console.log("Error", error);
      throw error;
    }
  }

  /**
   * @function changePassword
   * @description this function used to change the admin password
   */
  async changePassword(params: ChangePasswordRequest, tokenData: TokenData) {
    try {
      if (params.oldPassword == params.password)
        return Promise.reject(MESSAGES.ERROR.ENTER_NEW_PASSWORD);
      const step1 = await adminDaoV1.findAdminById(tokenData.userId, {
        salt: 1,
        hash: 1,
      });
      const oldHash = encryptHashPassword(params.oldPassword, step1.salt);
      if (oldHash !== step1.hash)
        return Promise.reject(MESSAGES.ERROR.INVALID_OLD_PASSWORD);
      params.hash = encryptHashPassword(params.password, step1.salt);
      await adminDaoV1.changePassword(params, tokenData.userId);
      await loginHistoryDao.removeDeviceById(tokenData);
      return MESSAGES.SUCCESS.CHANGE_PASSWORD;
    } catch (error) {
      console.log("Error", error);
      throw error;
    }
  }

  /**
   * @function adminDetails
   * @description this function used to get the admin details
   */
  async adminDetails(tokenData: TokenData) {
    try {
      let admin = await adminDaoV1.findAdminById(tokenData.userId);
      let session = await loginHistoryDao.findDeviceLastLogin(tokenData);
      let details = {
        userId: admin._id,
        email: admin.email,
        name: admin.name,
        profilePicture: admin.profilePicture,
        createdAt: admin.createdAt,
        lastLogin: session[0]?.createdAt,
        permission: admin?.permission,
        userType: admin.userType,
        countryCode: admin?.countryCode,
        mobileNo: admin?.mobileNo,
        fullMobileNo: admin?.fullMobileNo,
      };

      return MESSAGES.SUCCESS.DETAILS(details);
    } catch (error) {
      console.log("Error", error);
      throw error;
    }
  }

  /**
   * @function editProfile
   * @description this function used to edit admin profile
   */
  async editProfile(params: AdminRequest.EditProfile, tokenData: TokenData) {
    try {
      if (params.countryCode || params.mobileNo) {
        params.fullMobileNo = params.countryCode + params.fullMobileNo;
      }
      await adminDaoV1.editProfile(params, tokenData.userId);
      return MESSAGES.SUCCESS.EDIT_PROFILE;
    } catch (error) {
      console.log("Error", error);
      throw error;
    }
  }

  /**
   * @function addRoles
   * @author
   */
  async addRoles(params: AdminRequest.AddRoles, tokenData: TokenData) {
    try {
      let step1 = await adminDaoV1.findAdminById(tokenData.userId, {
        salt: 1,
        hash: 1,
      });
      if (!step1) return Promise.reject(MESSAGES.ERROR.USER_NOT_FOUND);

      let query: any = {};
      query.userId = params.userId;
      query.roles = params.roles;
      let data = await adminDaoV1.addRoles(query); //adding roles

      return MESSAGES.SUCCESS.DETAILS(data);
    } catch (error) {
      console.log("Error", error);
      throw error;
    }
  }

  /**
   * @function roleList
   * @author
   */
  async roleList(params: AdminRequest.RoleList, tokenData: TokenData) {
    try {
      let data = await adminDaoV1.roleList(params); // fetching roles data

      return MESSAGES.SUCCESS.LIST(data);
    } catch (error) {
      console.log("Error", error);
      throw error;
    }
  }

  /**
   * @function preSignedURL
   * @description Get a predefined URL for uploading profile picture
   */
  async preSignedURL(params: AdminRequest.PreSignedUrl) {
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
      const data = {
        Bucket: SERVER.S3.S3_BUCKET_NAME,
        Key: params.filename,
        Expires: 60 * 60, // URL expiration time in seconds
        ContentType: params.fileType,
      };
      console.log("********************s3 data***********", data);

      const presignedUrl: { url: string } = {
        url: String(await s3.getSignedUrlPromise("putObject", data)),
      };

      return MESSAGES.SUCCESS.DETAILS(presignedUrl);
    } catch (error) {
      console.log("Error", error);
      throw error;
    }
  }

  /**
   * @function admin_dashboard
   * @description this function used to dashboard admin
   */
  async adminDashboard() {
    try {
      const [dashboard, dasboardUserRegistration, revenue] = await Promise.all([
        adminDaoV1.adminDashboard(),
        adminDaoV1.adminDashboardChart(),
        adminDaoV1.adminDashboardRevenueChart(),
      ]);
      return MESSAGES.SUCCESS.DETAILS({
        dashboard,
        dasboardUserRegistration,
        revenue,
      });
    } catch (error) {
      console.log("Error", error);
      throw error;
    }
  }
}

export const adminController = new AdminController();
