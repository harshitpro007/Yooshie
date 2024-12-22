"use strict";

import * as crypto from "crypto";
import * as promise from "bluebird";

import {
  DB_MODEL_REF,
  GEN_STATUS,
  MAIL_TYPE,
  MESSAGES,
  REDIS_KEY_PREFIX,
  REDIS_PREFIX,
  SERVER,
  STATUS,
  TOKEN_TYPE,
  USER_TYPE,
} from "@config/index";
import { adminDaoV1 } from "@modules/admin/index";
import { assistantsDaoV1 } from "@modules/assistant/index";
import {
  encryptHashPassword,
  matchPassword,
  passwordGenrator,
} from "@utils/appUtils";
import { loginHistoryDao } from "@modules/loginHistory";
import { redisClient } from "@lib/redis/RedisClient";
import { axiosService } from "@lib/axiosService";
import { baseDao } from "@modules/baseDao";

export class AssistantController {
  /**
   * @function login
   * @description This function used to login the Assistant
   */
  async login(params: AdminRequest.Login) {
    try {
      const model: any = DB_MODEL_REF.ADMIN;
      const step1 = await adminDaoV1.isEmailExists(params);
      if (!step1 || step1?.userType !== USER_TYPE.ASSISTANT)
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
          type: TOKEN_TYPE.ASSISTANT_LOGIN,
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
   * @function createAssistant
   * @description this function is used to create the sub-admin
   */
  async createAssistant(
    params: AssistantRequest.CreateAssistant,
    tokenData: TokenData
  ) {
    try {
      if (tokenData.userType === USER_TYPE.ADMIN) {
        let step1 = await adminDaoV1.isEmailExists(params);
        if (step1) {
          return Promise.reject(MESSAGES.ERROR.EMAIL_ALREADY_EXIST);
        }
        params.userType = USER_TYPE.ASSISTANT;

        let password = passwordGenrator(12);
        params.salt = crypto.randomBytes(64).toString("hex");
        params.hash = encryptHashPassword(password, params.salt);

        // Generate an employee ID like "ys1", "ys2", etc.
        let empIdNumber = await assistantsDaoV1.genrateAssistantId();

        params.empId = empIdNumber;

        await assistantsDaoV1.createAssistant(params);

        let link = `${SERVER.ASSISTANT_URL}`;

        console.log(password, "generated password");

        let mailData = {
          type: MAIL_TYPE.ADD_ASSISTANT,
          name: params.name,
          email: params.email,
          password: password,
          link: link,
        };

        await axiosService.postData({
          url: process.env.NOTIFICATION_APP_URL + SERVER.SEND_MAIL,
          body: mailData,
        });

        redisClient.setExp(
          `${SERVER.APP_NAME}.${SERVER.ENVIRONMENT}.${params.email}.${REDIS_PREFIX.INVITE}`,
          SERVER.TOKEN_INFO.EXPIRATION_TIME.SUB_ADMIN_REINVITE / 1000,
          JSON.stringify({ email: params.email })
        );

        return MESSAGES.SUCCESS.ASSISTANT_CREATED;
      } else {
        return Promise.reject(MESSAGES.ERROR.INVALID_ADMIN);
      }
    } catch (error) {
      console.log("Error", error);
      throw error;
    }
  }

  /**
   * @function editAssistant
   * @description This function is used to edit the sub-admin
   */
  async editAssistant(
    params: AssistantRequest.EditAssistant,
    tokenData: TokenData
  ) {
    try {
      if (tokenData.userType === USER_TYPE.ADMIN) {
        let step1 = await assistantsDaoV1.findAssistantById({
          userId: params.assistantId,
        });
        if (!step1) {
          return Promise.reject(MESSAGES.ERROR.INVALID_ASSISTANT);
        }

        const result = await assistantsDaoV1.editAssistant(params);
        if (!result) {
          return Promise.reject(MESSAGES.ERROR.UPDATE_ASSISTANT);
        }
        return MESSAGES.SUCCESS.ASSISTANT_EDITED;
      } else {
        return Promise.reject(MESSAGES.ERROR.INVALID_ADMIN);
      }
    } catch (error) {
      console.log("Error", error);
      throw error;
    }
  }

  /**
   * @function blockUnblockAssistant
   * @description This function block and unblock the sub-admin
   */
  async blockUnblockAssistant(
    params: AssistantRequest.BlockAssistant,
    tokenData: TokenData
  ) {
    try {
      if (params.assistantId.toString() == tokenData.userId.toString()) {
        return Promise.reject(MESSAGES.ERROR.SELF_BLOCK);
      }
      if (tokenData.userType === USER_TYPE.ADMIN) {
        let Assistant = await assistantsDaoV1.findAssistantById({
          userId: params.assistantId,
        });
        if (!Assistant) {
          return Promise.reject(MESSAGES.ERROR.INVALID_ASSISTANT);
        }

        if (
          Assistant.status == GEN_STATUS.PENDING &&
          params.status == STATUS.UN_BLOCKED
        ) {
          params.status = GEN_STATUS.PENDING;
        }
        if (
          Assistant.status == STATUS.BLOCKED &&
          Assistant.isProfileCompleted == false &&
          params.status == STATUS.UN_BLOCKED
        ) {
          params.status = GEN_STATUS.PENDING;
        }
        await assistantsDaoV1.blockUnblockAssistant(params);
        switch (params.status) {
          case STATUS.BLOCKED:
            await loginHistoryDao.removeDeviceById({
              userId: params.assistantId,
            });
            return MESSAGES.SUCCESS.ASSISTANT_BLOCKED;
          case STATUS.UN_BLOCKED:
            return MESSAGES.SUCCESS.ASSISTANT_UNBLOCKED;
        }
      } else {
        return Promise.reject(MESSAGES.ERROR.INVALID_ADMIN);
      }
    } catch (error) {
      console.log("Error", error);
      throw error;
    }
  }

  /**
   * @function deleteAssistant
   * @description Delete the sub-admin profile
   */
  async deleteAssistant(
    params: AssistantRequest.AssistantId,
    tokenData: TokenData
  ) {
    try {
      if (tokenData.userType === USER_TYPE.ADMIN) {
        await assistantsDaoV1.deleteAssistant(params);
        await loginHistoryDao.removeDeviceById({ userId: params.assistantId });
        return MESSAGES.SUCCESS.ASSISTANT_DELETED;
      } else {
        return Promise.reject(MESSAGES.ERROR.INVALID_ADMIN);
      }
    } catch (error) {
      console.log("Error", error);
      throw error;
    }
  }

  /**
   * @function AssistantList
   * @description get the listing of sub-admins
   */
  async AssistantList(
    params: AssistantRequest.AssistantList,
    tokenData: TokenData
  ) {
    try {
      if (tokenData.userType === USER_TYPE.ADMIN) {
        let step1 = await assistantsDaoV1.assistantList(params, tokenData);
        return MESSAGES.SUCCESS.ASSISTANT_LIST(step1);
      } else {
        return Promise.reject(MESSAGES.ERROR.INVALID_ADMIN);
      }
    } catch (error) {
      console.log("Error", error);
      throw error;
    }
  }

  /**
   * @function AssistantDetails
   * @description Get the details of Assistant
   */
  async AssistantDetails(
    params: AssistantRequest.AssistantId,
    tokenData: TokenData
  ) {
    try {
      let step1 = await assistantsDaoV1.assistantDetails(params);
      return MESSAGES.SUCCESS.ASSISTANT_DETAILS(step1);
    } catch (error) {
      console.log("Error", error);
      throw error;
    }
  }

  /**
   * @function resendInviteAssistant
   * @description this function is used to send reinvite mail
   */
  async resendInviteAssistant(
    params: AssistantRequest.EditAssistant,
    tokenData: TokenData
  ) {
    try {
      if (tokenData.userType === USER_TYPE.ADMIN) {
        let step1 = await adminDaoV1.isEmailExistsWithStatus(params);
        if (!step1) {
          return Promise.reject(MESSAGES.ERROR.INVALID_ASSISTANT);
        }
        // if(!step1?.reinvite){
        // 	return Promise.reject(MESSAGES.ERROR.REINVITE_NOT_VALID)
        // }
        let reinvite = await redisClient.getValue(
          `${SERVER.APP_NAME}.${SERVER.ENVIRONMENT}.${step1.email}.${REDIS_PREFIX.INVITE}`
        );
        if (reinvite) {
          return Promise.reject(MESSAGES.ERROR.REINVITE_NOT_VALID);
        }

        let password = passwordGenrator(12);
        let salt = crypto.randomBytes(64).toString("hex");
        encryptHashPassword(password, salt);
        await assistantsDaoV1.editAssistant(params);
        let link = `${SERVER.ASSISTANT_URL}/dashboard`;

        let mailData = {
          type: MAIL_TYPE.ADD_ASSISTANT,
          name: step1.name,
          email: params.email,
          password: password,
          link: link,
        };
        axiosService.postData({
          url: process.env.NOTIFICATION_APP_URL + SERVER.SEND_MAIL,
          body: mailData,
        });

        return MESSAGES.SUCCESS.RESEND_REINVITE;
      } else {
        return Promise.reject(MESSAGES.ERROR.INVALID_ADMIN);
      }
    } catch (error) {
      console.log("Error", error);
      throw error;
    }
  }

  /**
   * @function assignedAutomaticAssistant
   * @description assigned automatic assistant
   * @returns
   */
  async assignedAutomaticAssistant(tokenData: TokenData) {
    try {
      await assistantsDaoV1.assignedAutomaticAssistant(tokenData.userId);
      return MESSAGES.SUCCESS.ASSISTANT_ASSIGNED;
    } catch (error) {
      console.log("Error in assigned automatic assistant", error);
      throw error;
    }
  }

  async assignedManualAssistant(
    params: AssistantRequest.assignedAssistant,
    tokenData: TokenData
  ) {
    try {
      if (tokenData.userType !== USER_TYPE.ADMIN)
        return Promise.reject(MESSAGES.ERROR.INVALID_ADMIN);

      const result = await assistantsDaoV1.assignedManualAssistant(params);
      if (result) {
        return MESSAGES.SUCCESS.ASSISTANT_ASSIGNED;
      } else {
        return Promise.reject(MESSAGES.ERROR.ASSIGN_ASSISTANT);
      }
    } catch (error) {
      console.log("Error in assigned manual assistant", error);
      throw error;
    }
  }

  async userListing(params: ListingRequest, tokenData) {
    try {
      const data = await axiosService.getData({
        url: SERVER.USER_APP_URL + SERVER.USER_LIST,
        payload: params,
        auth: `Bearer ${tokenData.accessToken}`,
      });
      return MESSAGES.SUCCESS.DETAILS(data.data);
    } catch (error) {
      console.log("Error", error);
      throw error;
    }
  }

  async assitantDashboard(tokenData) {
    try {
      const data = await axiosService.getData({
        url: SERVER.TASK_APP_URL + SERVER.ASSISTANT_UPCOMING_TASK,
        payload: "",
        auth: `Bearer ${tokenData.accessToken}`,
      });
      return MESSAGES.SUCCESS.DETAILS(data.data);
    } catch (error) {
      console.log("Error", error);
      throw error;
    }
  }

  /**
   * @function editProfileSetting
   * @description this function will update the user profile
   * @param params.offineStatus
   * @param params.pushNotificationStatus
   */
  async editProfileSetting(params: AssistantRequest.EditProfileSetting, tokenData) {
    try {
      const data = await assistantsDaoV1.editProfileSetting(
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
   * @function redisNotificationMapping
   * set/unset mute and offline status status for user privacy
   * push default true and offline default false
   */
  async redisNotificationMapping(
    params: AssistantRequest.EditProfileSetting,
    tokenData
  ) {
    try {
      if (params.offlineStatus)
        await redisClient.storeValue(SERVER.APP_NAME + "_" + tokenData.tokenData.userId + REDIS_KEY_PREFIX.OFFLINE, Date.now());
      if (!params.offlineStatus)
        await redisClient.deleteKey(SERVER.APP_NAME +"_" +tokenData.tokenData.userId +REDIS_KEY_PREFIX.OFFLINE);
      const apiUrl = SERVER.CHAT_URL + SERVER.USER_SETTINGS;
      const UserSettingsData = {
        offlineStatus: params?.offlineStatus,
      }
      axiosService.post({apiUrl, body: UserSettingsData , auth: `Bearer ${tokenData}`});
      return;
    } catch (error) {
      throw error;
    }
  }
}

export const assistantController = new AssistantController();
