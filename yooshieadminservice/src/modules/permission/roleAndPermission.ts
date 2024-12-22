"use strict";

import { BaseDao } from "@modules/baseDao/BaseDao";

import { STATUS, DB_MODEL_REF, MESSAGES, USER_TYPE } from "@config/constant";
export class RoleAndPermission extends BaseDao {
  async checkPermission(params, tokenData: TokenData) {
    try {
      if (tokenData.userType == USER_TYPE.ADMIN) {
        return true;
      } else {
        // const admin = await adminDaoV1.findAdminById(tokenData.userId);
        const query: any = {};
        const model: any = DB_MODEL_REF.ADMIN;
        query._id = tokenData.userId;
        query.status = { $eq: STATUS.UN_BLOCKED };

        const projection = { permission: 1 };

        const result = await this.findOne(model, query, projection);
        if (!result) return Promise.reject(MESSAGES.ERROR);
        // Check if the required module and permission exist in the result
        const requiredModule = params.module;
        const requiredPermission = params.permission;
        const hasPermission = result.permission.some((perm: any) => {
          return perm.module === requiredModule && perm[requiredPermission];
        });
        return hasPermission;
      }
    } catch (error) {
      throw error;
    }
  }
}

export const roleAndPermission = new RoleAndPermission();
