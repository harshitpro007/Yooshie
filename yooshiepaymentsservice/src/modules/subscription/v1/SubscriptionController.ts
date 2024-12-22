"use strict";

import {
    HTTP_STATUS_CODE,
    MESSAGES,
    REDIS_KEY_PREFIX,
    SERVER,
    STATUS,
    SUBSCRIPTION_AMOUNT,
    SUBSCRIPTIONS_PLAN,
    SUB_TYPE,
    SUBSCRIPTION_DURATION,
} from "@config/index";
import { subscriptionDao } from "./SubscriptionDao";
import { baseDao } from "@modules/baseDao";
import { subscriptionDaoV1 } from "..";
import { redisClient } from "@lib/index";
import { axiosService } from "@lib/axiosService";
import { userDaoV1 } from "@modules/user";
import { verifyAndroidInAppToken, verifyIosInAppToken } from "@lib/subscriptionManager";

export class SubscriptionController {

    /**
     * @function verifyIosInAppToken
     */
    async verifyIosInAppToken(
        query: SubscriptionRequest.VerifyIosInAppToken,
        tokenDetails
    ) {
        try {
            const tokenData = tokenDetails.tokenData;
            const isExist = await userDaoV1.findUserById(tokenData.userId);
            if (!isExist) return Promise.reject(MESSAGES.ERROR.USER_NOT_FOUND);
            const match: any = {};
            const step1 = await verifyIosInAppToken(query.receipt);
            if (!step1.data || step1.data.status === 21003 || step1.data.status === 21002) {
                return Promise.reject(MESSAGES.ERROR.INVALID_RECEIPT);
            }
            match._id = { $ne: tokenData.userId };
            match.status = { $ne: STATUS.DELETED };
            match.original_transaction_id = {
                $eq: step1.data.receipt.in_app[0].original_transaction_id,
            };
            const isReceiptExist = await axiosService.getData({"url": SERVER.SUBSCRIPTION_APP_URL + SERVER.SUBSCRIPTION_PURCHASE, "payload": match, "auth": `Bearer ${tokenData.accessToken}`})
            console.log("isReceiptExistisReceiptExist",isReceiptExist.data)
            if (isReceiptExist.data.statusCode === HTTP_STATUS_CODE.OK) {
                return Promise.reject(MESSAGES.ERROR.RECEIPT_ALREADY_EXIST);
            }
            if (!step1.flag && step1.data.receipt.in_app.length <= 1)
                return Promise.reject(MESSAGES.ERROR.YOU_ARE_NOT_AUTHORIZED);
            if(step1.data.latest_receipt_info[0].expires_date_ms < Date.now())
                return Promise.reject(MESSAGES.ERROR.INVALID_RECEIPT);
            if (step1.flag) {
                await subscriptionDao.saveSubscriptionInAppData(step1.data.receipt.in_app[0],isExist,query);
                

                const match = JSON.stringify({ _id: tokenData.userId });
                const update = JSON.stringify({ 
                    // receipt: query.receipt,
                    original_transaction_id:
                    step1.data.receipt.in_app[0].original_transaction_id,
                    isSubscribed: true,
                    subscribedPlatform:SUB_TYPE.IOS,
                    subscriptionType: step1.data.latest_receipt_info[0].product_id,
                    subscriptionExpiryDate: step1.data.latest_receipt_info[0].expires_date_ms
                })
			    await redisClient.storeValue(SERVER.APP_NAME + "_" + tokenData.userId + REDIS_KEY_PREFIX.SUBSCRIBED, JSON.stringify({"startDate": Date.now(), "expiryDate": step1.data.latest_receipt_info[0].expires_date_ms}));
                await axiosService.patchData({"url": SERVER.USER_APP_URL + SERVER.UPDATE_SUBSCRIPTION, "body": update, "auth": `Bearer ${tokenDetails.accessToken}`});

            }
            return MESSAGES.SUCCESS.IOS_TOKEN_VERIFY({ flag: step1.flag });


        } catch (error) {
            console.error(error);
            throw error;
        }
    }

    /**
   * @function iosWebhook
   */
    async iosWebhook(payload) { //NOSONAR
        try {
            const signedPayload = payload.signedPayload;
            let splitParts = signedPayload.split(".")
            let notificationPayload = splitParts[1];
            const decodedPayload1: any = JSON.parse(Buffer.from(notificationPayload, 'base64').toString('utf8'));
            let splitParts2 = decodedPayload1.data.signedTransactionInfo.split(".")
            let splitParts3 = decodedPayload1.data.signedRenewalInfo.split(".")
            let notificationPayload2 = splitParts2[1];
            let notificationPayload3 = splitParts3[1];
            const decodedPayload2: any = Buffer.from(notificationPayload2, 'base64').toString('utf8');
            const decodedPayload3: any = Buffer.from(notificationPayload3, 'base64').toString('utf8');
            decodedPayload1.data.signedTransactionInfo = JSON.parse(decodedPayload2)
            decodedPayload1.data.signedRenewalInfo = JSON.parse(decodedPayload3)
            decodedPayload1.created = Date.now()
            decodedPayload1.notify = decodedPayload1.notificationType
            await baseDao.insertMany("inapps", [decodedPayload1], {})

            let notificationType: string = decodedPayload1.notificationType
            let subType: string = decodedPayload1?.subtype
            const isExist = await baseDao.findOne("users", { original_transaction_id: decodedPayload1.data.signedTransactionInfo.originalTransactionId });
            if (!isExist) return Promise.reject(MESSAGES.ERROR.USER_NOT_FOUND)
            let amount;
            if (decodedPayload1.data.signedTransactionInfo.productId == SUBSCRIPTION_DURATION.MONTH) {
                amount = SUBSCRIPTION_AMOUNT.MONTH //NOSONAR
            }
            else {
                amount = SUBSCRIPTION_AMOUNT.YEAR //NOSONAR
            }
            if (notificationType) {
                switch (notificationType) {
                    case 'SUBSCRIBED':
                        switch (subType) {
                            case 'INITIAL_BUY'://when user purchase a subscription first time from own device then send the email to user only
                                console.log("callback for INITIAL_BUY")
                                break;
                            case 'RESUBSCRIBE'://when user purchase a subscription after subscription expired  then send the email to user and update data of payment and subscription also
                                await subscriptionDao.reSubscribeIosSubscription(decodedPayload1, isExist);
                                break;
                        }
                        break;
                    case 'DID_CHANGE_RENEWAL_PREF':
                        switch (subType) {
                            case 'UPGRADE'://when user upgrade a subscription  then send the email to user and update data of payment and subscription also
                                await subscriptionDao.updateIosSubscription(decodedPayload1,isExist);
                                break;
                            case 'DOWNGRADE'://when user downgrade a subscription  then set cancel reason null only
                                await subscriptionDao.updateSubscription(isExist);
                                break;
                        }
                        break;
                    case 'DID_RENEW'://when renew a subscription  then save payment and subscription data
                        await subscriptionDao.reNewIosSubscription(decodedPayload1, isExist)
                        break;
                    case 'DID_CHANGE_RENEWAL_STATUS':
                        switch (subType) {
                            case 'AUTO_RENEW_DISABLED'://when user cancel auto renew  a subscription  then update cancel reason
                                await subscriptionDao.autoRenewDisableIosSubscription(isExist)
                                break;
                            case 'AUTO_RENEW_ENABLED'://when user start auto renew  a subscription  then set cancel reason null
                                await subscriptionDao.autoRenewEnableIosSubscription(isExist)
                                break;
                        }
                        break;
                    case 'EXPIRED':
                        switch (subType) { //NOSONAR
                            case 'VOLUNTARY'://send a mail to user when subsription is expired.
                                await subscriptionDaoV1.expireIosSubscription(isExist);
                                break;
                        }
                        break;
                    default:
                        // Unexpected event t.subscriptionExpired
                        console.log(`Unhandled event type ${notificationType}.`);
                }
            }
            return MESSAGES.SUCCESS.IOS_TOKEN_VERIFY(payload);
        } catch (error) {
            console.error(error);
            throw error;
        }
    }


    /**
     * @function verifyIosInAppToken
     */
    async verifyAndroidInAppToken(
        query: SubscriptionRequest.VerifyAndroidInAppToken,
        tokenDetails
    ) {
        try {
            const tokenData = tokenDetails.tokenData;
            console.log('verifyAndroidInAppToken', tokenDetails, tokenData)
            const isExist = await userDaoV1.findUserById(tokenData.userId);
            if (!isExist) return Promise.reject(MESSAGES.ERROR.USER_NOT_FOUND);
            const match: any = {};
            const step1 = await verifyAndroidInAppToken(query)
            if (!step1.flag) {
                return Promise.reject(MESSAGES.ERROR.INVALID_TOKEN(step1.data.message));
            }
            match._id = { "$ne": tokenData.userId };
            match.status = { "$ne": STATUS.DELETED };
            match.original_transaction_id = { "$eq": step1.data.orderId };
            const isReceiptExist = await axiosService.getData({"url": SERVER.SUBSCRIPTION_APP_URL + SERVER.SUBSCRIPTION_PURCHASE, "payload": match, "auth": `Bearer ${tokenData.accessToken}`});
            if (isReceiptExist.data.statusCode === HTTP_STATUS_CODE.OK) {
                return Promise.reject(MESSAGES.ERROR.RECEIPT_ALREADY_EXIST);
            }

            if(step1.data.expiryTimeMillis < Date.now())
                return Promise.reject(MESSAGES.ERROR.INVALID_RECEIPT);

            
            let subscription = await baseDao.findOne("subscriptions", {userId: tokenData.userId});
            if (step1.flag && step1.data) {
                if (!subscription) {
                    await subscriptionDaoV1.saveSubscriptionInAppDataAndroid(step1.data, isExist, query)
                }
                else {
                    await subscriptionDaoV1.updateAndroidSubscription(step1.data, isExist, query);
                }

                const match = JSON.stringify({ _id: tokenData.userId });
                const update = JSON.stringify({ 
                    receipt: query.receipt,
                    original_transaction_id: step1.data.orderId,
                    isSubscribed: true,
                    subscriptionType: query.basePlanId,
                    subscribedPlatform: SUB_TYPE.ANDROID,
                    subscriptionExpiryDate: step1.data.expiryTimeMillis
                })
			    await redisClient.storeValue(SERVER.APP_NAME + "_" + tokenData.userId + REDIS_KEY_PREFIX.SUBSCRIBED, JSON.stringify({"startDate": Date.now(), "expiryDate": step1.data.expiryTimeMillis}));
                await axiosService.patch({"url": SERVER.USER_APP_URL + SERVER.UPDATE_SUBSCRIPTION, "body": update, "auth": `Bearer ${tokenDetails.accessToken}`});
            }
            return MESSAGES.SUCCESS.ANDROID_TOKEN_VERIFY({ flag: step1.flag, subscriptionType: query.basePlanId, endDate: step1.data.expiryTimeMillis });

        } catch (error) {
            console.error(error);
            throw error;
        }
    }

    /**
     * @function androidWebhok
     */
    async androidWebhok(payload) {
        try {
            const data = payload.message.data;
            let decodePayload: any = Buffer.from(data, "base64").toString('utf-8');
            decodePayload = JSON.parse(decodePayload);
            let notificationType = decodePayload.subscriptionNotification.notificationType;
            await baseDao.insertMany("inapps", [decodePayload], {})

            if (notificationType) {
                switch (notificationType) {
                    case 2: //An active subscription was renewed.
                        const response = await verifyAndroidInAppToken(decodePayload.subscriptionNotification); //NOSONAR
                        if (!response.flag) {
                            return Promise.reject(MESSAGES.ERROR.INVALID_TOKEN(response.data.message));
                        }
                        if (response.flag && response.data) {
                            await subscriptionDaoV1.reNewAndroidSubscription(response.data, decodePayload.subscriptionNotification);
                        }
                        break;
                    case 3: // A subscription was either voluntarily or involuntarily cancelled. For voluntary cancellation, sent when the user cancels.
                        await subscriptionDaoV1.subscriptionCancelled(decodePayload.subscriptionNotification);
                        break;
                    case 13: // A subscription has expired
                        await subscriptionDaoV1.subscriptionExpired(decodePayload.subscriptionNotification);
                        break;
                    case 7: // User has restored their subscription. The subscription was canceled but had not expired yet when the user restores.
                        await subscriptionDaoV1.restoredSubscription(decodePayload.subscriptionNotification);
                        break;
                    default:
                        // Unexpected event
                        console.log(`Unhandled event type ${notificationType}.`);
                }
            }
            return HTTP_STATUS_CODE.OK;
        }
        catch (error) {
            console.error(error);
            throw error;
        }
    }

    /**
     * @function featuresDetailAndroid
     * @description Subscription features Details
     */
    async featuresDetail() {
        try {
            return MESSAGES.SUCCESS.DETAILS({data: SUBSCRIPTIONS_PLAN});
        }
        catch (error) {
            console.error(error);
            throw error;
        }
    }

    /**
     * @function getTransactions
     * @description Subscription transactions listing
     */
    async getTransactions(params: any, tokenData: TokenData){
        try{
            const query = JSON.parse(params.match)
            const step1 = await subscriptionDaoV1.getTransactions(query, tokenData);
            return MESSAGES.SUCCESS.TRANSACTION_LIST(step1);
        }
        catch(error){
            console.error(error);
            throw error;
        }
    }

    /**
     * @function subscribedUser
     * @description Subscribed users listing
     */
    async subscribedUser(params: any, tokenData: TokenData){
        try{ 
            const query = JSON.parse(params.match);
            const step1 = await subscriptionDaoV1.subscribedUser(query, tokenData);
            return MESSAGES.SUCCESS.SUBSCRIBED_USER_LIST(step1);
        }
        catch(error){
            console.error(error);
            throw error;
        }
    }

    /**
     * @function transactionOverview
     * @description Overall Overview of subsction
     */
    async transactionOverview(){
        try{
            const step1 = await subscriptionDaoV1.transactionOverview();
            return MESSAGES.SUCCESS.DETAILS(step1);
        }
        catch(error){
            console.error(error);
            throw error;
        }
    }

    /**
     * @function userSubscriptions
     * @description a user subscription history
     */
    async userSubscriptions(params: SubscriptionRequest.Subscriptions){
        try{
            const susbcriptions = await subscriptionDaoV1.userSubscriptions(params);
			return MESSAGES.SUCCESS.DETAILS(susbcriptions);
        }
        catch(error){
            console.error(error);
            throw error;
        }
    }

    async freeTrial(tokeData: TokenData ){
        try{
            const isUser = await userDaoV1.findUserById(tokeData.userId);
            if(!isUser)return Promise.reject(MESSAGES.ERROR.USER_NOT_FOUND);

            await subscriptionDaoV1.freeTrial(tokeData, isUser);
            return MESSAGES.SUCCESS.TRIAL_PLAN_PURCHASED_SUCCESSFULLY;
        }
        catch(error){
            console.error(error);
            throw error;
        }
    }

}

export const subscriptionController = new SubscriptionController();

