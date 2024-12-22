import {
   MESSAGES, USER_TYPE,
} from "@config/index";
import { logger } from "@lib/logger";
import { decode, createToken, createRefreshToken } from "@lib/tokenManager";
import { BaseDao } from "@modules/baseDao/BaseDao";



export class AuthController extends BaseDao {

    /**
   * @function verifyToken
   * @description decode auth token and return the data
   * @param params.authorization // Bearer Token
   * @returns data Object
   */
    async verifyToken(params){
        try {
          let tokenData;
          let jwtToken = params.authorization.split(" ")[1];
          tokenData = await decode(jwtToken);
          return MESSAGES.SUCCESS.DETAILS(tokenData);
        } catch (error) {
            logger.error(error);
            throw error;
        }
    }

    /**
   * @function createAuthToken
   * @description create auth token and return
   * @param params.userId // Bearer Token
   * @param params.accessTokenKey 
   * @param params.deviceId 
   * @param params.type 
   * @param params.userType 
   * @returns JWT token
   */
    async createAuthToken(params){
      try {
        let jwtToken
        let refreshToken
        jwtToken = await createToken(params);
        refreshToken = await createRefreshToken(params);
        return MESSAGES.SUCCESS.DETAILS({jwtToken,refreshToken});
      } catch (error) {
          logger.error(error);
          throw error;
      }
    }
  
    /**
     * @function adminTokenVerification
     * @param payload
     * @param headers
     * @description accepts the payload and return the JWT token
     * @returns Admin access token
     */
    async adminTokenVerification(payload, headers){
      try {
        let jwtToken;
        if(payload.userType == USER_TYPE.ADMIN){
          jwtToken = await createToken({...payload, ...headers});
        }
        return MESSAGES.SUCCESS.DETAILS(jwtToken);
      } catch (error) {
        logger.error(error);
        throw error;
      }
    }
  }
export const authController = new AuthController();
