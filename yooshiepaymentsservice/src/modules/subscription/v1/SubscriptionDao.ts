"use strict";

import { BaseDao, baseDao } from "@modules/baseDao/BaseDao";
const moment = require('moment');
import {
    STATUS,
    SUB_TYPE,
    SUBSCRIPTION_DURATION,
    SUBSCRIPTION_AMOUNT,
    MESSAGES,
    SUBSCRIPTION_DURATION_ANDROID,
    SUBSCRIPTIONS_PLAN,
    DB_MODEL_REF,
    SUBSCRIPTION_STATUS,
    REDIS_KEY_PREFIX,
} from "@config/constant";
import { genRandomString, toObjectId } from "@utils/appUtils";
import { createObjectCsvWriter } from "csv-writer"
import { Search } from "../searchMapper";
import { SERVER } from "@config/environment";
import { imageUtil } from "@lib/ImageUtil";
import { userDaoV1 } from "@modules/user";
import { redisClient } from "@lib/index";
import { axiosService } from "@lib/axiosService";


export class SubscriptionDao extends BaseDao {

    /**
     * @function saveSubsciptionInAppData
     * @param subscription
     * @param user
     */
    async saveSubscriptionInAppData(
        subscription,
        user,
        query: SubscriptionRequest.VerifyIosInAppToken
    ) {
        try {
            const match: any = {};
            match.userId = { $eq: user._id};
            match.original_transactionId = { $eq: subscription.original_transaction_id };
            const step1 = await baseDao.findOne("subscriptions", match);
            if (!step1) {
                let amount;
                let subscriptionPlan = "";
                if ((subscription.product_id == SUBSCRIPTION_DURATION.MONTH)) {
                    amount = SUBSCRIPTION_AMOUNT.MONTH;
                    subscriptionPlan = SUBSCRIPTIONS_PLAN.MONTHLY
                } else {
                    amount = SUBSCRIPTION_AMOUNT.YEAR;
                    subscriptionPlan = SUBSCRIPTIONS_PLAN.YEARLY
                }
                let toSave = {
                    userId: user._id,
                    name: user.name,
                    mobileNo: user.fullMobileNo,
                    subscriptionStatus: STATUS.ACTIVE,
                    startDate: subscription.purchase_date_ms,
                    endDate: subscription.expires_date_ms,
                    transactionId: subscription.transaction_id,
                    original_transactionId: subscription.original_transaction_id,
                    subscriptionType: subscriptionPlan,
                    amount: amount,
                    receiptToken: query.receipt,
                    productId: subscription.product_id,
                    platform: SUB_TYPE.IOS,
                };

                let toSavePayment = {
                    userId: user._id,
                    name: user.name,
                    mobileNo: user.fullMobileNo,
                    paymentStatus: STATUS.SUCCESS,
                    subscriptionStatus: STATUS.ACTIVE,
                    startDate: subscription.purchase_date_ms,
                    endDate: subscription.expires_date_ms,
                    transactionId: subscription.transaction_id,
                    transactionDate: Date.now(),
                    subscriptionPlan: subscriptionPlan,
                    type: SUB_TYPE.IOS,
                    amount: amount,
                    deviceId: query.deviceId,
                };
                await this.save("payments", toSavePayment);
                await this.save("subscriptions", toSave);
            }
        } catch (error) {
            console.error(error);
            throw error;
        }
    }

    /**
     * @function reSubscribeIosSubscription
     */
    async reSubscribeIosSubscription(payload, users) {
        try {
            let amount;
            let subscriptionPlan = "";
            if (payload.data.signedTransactionInfo.productId == SUBSCRIPTION_DURATION.MONTH) {
                amount = SUBSCRIPTION_AMOUNT.MONTH;
                subscriptionPlan = SUBSCRIPTIONS_PLAN.MONTHLY
            }
            else {
                amount = SUBSCRIPTION_AMOUNT.YEAR
                subscriptionPlan = SUBSCRIPTIONS_PLAN.YEARLY
            }
            let toSave = {
                userId: users._id,
                name: users.name,
                mobileNo: users.fullMobileNo,
                isActive: true,
                autoRenewing: true,
                isCancelled: false,
                subscriptionStatus: STATUS.ACTIVE,
                startDate: payload.data.signedTransactionInfo.purchaseDate,
                endDate: payload.data.signedTransactionInfo.expiresDate,
                transactionId: payload.data.signedTransactionInfo.transactionId,
                original_transactionId: payload.data.signedTransactionInfo.originalTransactionId,
                subscriptionType: subscriptionPlan,
                amount: amount,
                receiptToken: users.receipt,
                productId: payload.data.signedTransactionInfo.productId,
                platform: SUB_TYPE.IOS,
            }

            let toSavePayment = {
                userId: users._id,
                name: users.name,
                mobileNo: users.fullMobileNo,
                paymentStatus: STATUS.SUCCESS,
                subscriptionStatus: STATUS.ACTIVE,
                startDate: payload.data.signedTransactionInfo.purchaseDate,
                endDate: payload.data.signedTransactionInfo.expiresDate,
                transactionId: payload.data.signedTransactionInfo.transactionId,
                transactionDate: Date.now(),
                subscriptionPlan: subscriptionPlan,
                type: SUB_TYPE.IOS,
                amount: amount,
            }
            await userDaoV1.findOneAndUpdate(
                "users",
                { _id: users._id },
                {
                    original_transaction_id:payload.data.signedTransactionInfo.originalTransactionId,
                    isSubscribed: true,
                    subscriptionType: payload.data.signedTransactionInfo.productId,
                    subscriptionExpiryDate: payload.data.signedTransactionInfo.expiresDate
                }
            );
			await redisClient.storeValue(SERVER.APP_NAME + "_" + users._id + REDIS_KEY_PREFIX.SUBSCRIBED, JSON.stringify({"startDate": Date.now(), "expiryDate": payload.data.signedTransactionInfo.expiresDate}));
            await this.save("payments", toSavePayment)
            return await this.findOneAndUpdate("subscriptions",{userId: users._id}, toSave);
        } catch (error) {
            console.error(error);
            throw error;
        }
    }
    /**
    * @function updateIosSubscription
    */
    async updateIosSubscription(payload: any, users: any) {
        try {
            let amount;
            let subscriptionPlan = "";
            if (payload.data.signedTransactionInfo.productId == SUBSCRIPTION_DURATION.MONTH) {
                amount = SUBSCRIPTION_AMOUNT.MONTH;
                subscriptionPlan = SUBSCRIPTIONS_PLAN.MONTHLY
            }
            else {
                amount = SUBSCRIPTION_AMOUNT.YEAR
                subscriptionPlan = SUBSCRIPTIONS_PLAN.YEARLY
            }
            let toUpdate = {
                userId: users._id,
                name: users.name,
                mobileNo: users.fullMobileNo,
                subscriptionStatus: STATUS.ACTIVE,
                startDate: payload.data.signedTransactionInfo.purchaseDate,
                endDate: payload.data.signedTransactionInfo.expiresDate,
                transactionId: payload.data.signedTransactionInfo.transactionId,
                original_transactionId: payload.data.signedTransactionInfo.originalTransactionId,
                subscriptionType: subscriptionPlan,
                amount: amount,
                receiptToken: users.receipt,
                productId: payload.data.signedTransactionInfo.productId,
                platform: SUB_TYPE.IOS,
            }
            
            let toSavePayment = {
                userId: users._id,
                name: users.name,
                mobileNo: users.fullMobileNo,
                paymentStatus: STATUS.SUCCESS,
                subscriptionStatus: STATUS.ACTIVE,
                startDate: payload.data.signedTransactionInfo.purchaseDate,
                endDate: payload.data.signedTransactionInfo.expiresDate,
                transactionId: payload.data.signedTransactionInfo.transactionId,
                transactionDate: Date.now(),
                upgradeOn: Date.now(),
                subscriptionPlan: subscriptionPlan,
                type: SUB_TYPE.IOS,
                amount: amount,
            }
            await userDaoV1.findOneAndUpdate(
                "users",
                { _id: users._id },
                {
                    original_transaction_id:payload.data.signedTransactionInfo.originalTransactionId,
                    isSubscribed: true,
                    subscriptionType: payload.data.signedTransactionInfo.productId,
                    subscriptionExpiryDate: payload.data.signedTransactionInfo.expiresDate
                }
            );
			await redisClient.storeValue(SERVER.APP_NAME + "_" + users._id + REDIS_KEY_PREFIX.SUBSCRIBED, JSON.stringify({"startDate": Date.now(), "expiryDate": payload.data.signedTransactionInfo.expiresDate}));
            await baseDao.updateMany("subscriptions", { userId: users._id, subscriptionStatus: STATUS.ACTIVE, platform: SUB_TYPE.IOS }, { $set: toUpdate }, {})
            await this.updateMany("payments", {userId: users._id, subscriptionStatus: SUBSCRIPTION_STATUS.ACTIVE}, {subscriptionStatus: SUBSCRIPTION_STATUS.EXPIRED}, {});
            await this.save("payments", toSavePayment);
        } catch (error) {
            console.error(error);
            throw error;
        }
    }

    /**
    * @function updateIosSubscription
    */
    async updateSubscription(users: any) {
        try {
            await this.findOneAndUpdate("payments", {userId: users._id, subscriptionStatus: SUBSCRIPTION_STATUS.ACTIVE}, {upgradeOn: Date.now()} );
        } catch (error) {
            console.error(error);
            throw error;
        }
    }

    /**
    * @function reNewIosSubscription
    */
    async reNewIosSubscription(payload: any, users: any) {
        try {
            // await baseDao.findOneAndUpdate("subscriptions", { userId: users._id, subscriptionStatus: STATUS.ACTIVE, platform: SUB_TYPE.IOS }, { subscriptionStatus: STATUS.CANCELLED.TYPE, isActive: false, cancelledOn: Date.now() }, {})
            let amount;
            let subscriptionPlan = "";
            if (payload.data.signedTransactionInfo.productId == SUBSCRIPTION_DURATION.MONTH) {
                amount = SUBSCRIPTION_AMOUNT.MONTH;
                subscriptionPlan = SUBSCRIPTIONS_PLAN.MONTHLY
            }
            else {
                amount = SUBSCRIPTION_AMOUNT.YEAR
                subscriptionPlan = SUBSCRIPTIONS_PLAN.YEARLY
            }
            let toSave = {
                userId: users._id,
                name: users.name,
                mobileNo: users.fullMobileNo,
                subscriptionStatus: STATUS.ACTIVE,
                startDate: payload.data.signedTransactionInfo.purchaseDate,
                endDate: payload.data.signedTransactionInfo.expiresDate,
                transactionId: payload.data.signedTransactionInfo.transactionId,
                original_transactionId: payload.data.signedTransactionInfo.originalTransactionId,
                subscriptionType: subscriptionPlan,
                amount: amount,
                receiptToken: users.receipt,
                productId: payload.data.signedTransactionInfo.productId,
                platform: SUB_TYPE.IOS,
            }

            let toSavePayment = {
                userId: users._id,
                name: users.name,
                mobileNo: users.fullMobileNo,
                paymentStatus: STATUS.SUCCESS,
                subscriptionStatus: STATUS.ACTIVE,
                startDate: payload.data.signedTransactionInfo.purchaseDate,
                endDate: payload.data.signedTransactionInfo.expiresDate,
                transactionId: payload.data.signedTransactionInfo.transactionId,
                transactionDate: Date.now(),
                renewOn: Date.now(),
                subscriptionPlan: subscriptionPlan,
                type: SUB_TYPE.IOS,
                amount: amount,
            }
            await userDaoV1.findOneAndUpdate(
                "users",
                { _id: users._id },
                {
                    original_transaction_id:payload.data.signedTransactionInfo.originalTransactionId,
                    isSubscribed: true,
                    subscriptionType: payload.data.signedTransactionInfo.productId,
                    subscriptionExpiryDate: payload.data.signedTransactionInfo.expiresDate
                }
            );
			await redisClient.storeValue(SERVER.APP_NAME + "_" + users._id + REDIS_KEY_PREFIX.SUBSCRIBED, JSON.stringify({"startDate": Date.now(), "expiryDate": payload.data.signedTransactionInfo.expiresDate}));
            await this.updateMany("payments", {userId: users._id, subscriptionStatus: SUBSCRIPTION_STATUS.ACTIVE}, {subscriptionStatus: SUBSCRIPTION_STATUS.EXPIRED},{});
            await this.save("payments", toSavePayment)
            return await this.updateMany("subscriptions",{userId: users._id}, toSave,{});
        } catch (error) {
            console.error(error);
            throw error;
        }
    }
    /**
     * @function autoRenewDisableIosSubscription
     */
    async autoRenewDisableIosSubscription(users: any) {
        try {
            await baseDao.findOneAndUpdate("subscriptions", { userId: users._id, subscriptionStatus: STATUS.ACTIVE, platform: SUB_TYPE.IOS }, { subscriptionStatus: SUBSCRIPTION_STATUS.CANCELLED, autoRenewing: false, isCancelled: true }, {});
            return await this.findOneAndUpdate("payments", {userId: users._id, subscriptionStatus: SUBSCRIPTION_STATUS.ACTIVE}, {subscriptionStatus: SUBSCRIPTION_STATUS.CANCELLED, cancelledOn: Date.now()});
        } catch (error) {
            console.error(error);
            throw error;
        }
    }
    /**
     * @function autoRenewEnableIosSubscription
     */
    async autoRenewEnableIosSubscription(users: any) {
        try {
            return await baseDao.findOneAndUpdate("subscriptions", { userId: users._id, platform: SUB_TYPE.IOS, subscriptionStatus: SUBSCRIPTION_STATUS.CANCELLED, autoRenewing: false, isCancelled: true }, { $set: { autoRenewing: true, isCancelled: false, subscriptionStatus: STATUS.ACTIVE } }, {});
        } catch (error) {
            console.error(error);
            throw error;
        }
    }

    /**
     * @function expireIosSubscription
     */
    async expireIosSubscription(users: any) {
        try {
            const params = {userId:users._id,platform: SUB_TYPE.IOS};
            await Promise.all([
                baseDao.findOneAndUpdate("users", { _id: users._id }, { isSubscribed: false }),
                this.updateMany("payments", {userId: users._id}, {subscriptionStatus: SUBSCRIPTION_STATUS.EXPIRED},{}),
                baseDao.updateMany("subscriptions", { userId: users._id, platform: SUB_TYPE.IOS }, { isActive: false, subscriptionStatus: STATUS.EXPIRED },{}),
                axiosService.post({"url": SERVER.CHAT_APP_URL + SERVER.EXPIRE_SUBSCRIPTION, "body": params}),
                redisClient.deleteKey(SERVER.APP_NAME + "_" + users._id + REDIS_KEY_PREFIX.SUBSCRIBED)
            ]);
            
        }
        catch (error) {
            console.error(error);
            throw error;
        }
    }

    /**
   * @function saveSubsciptionInAppDataAndroid
   * @param subscription
   * @param user
   */
    async saveSubscriptionInAppDataAndroid(
        subscription,
        user,
        query: SubscriptionRequest.VerifyAndroidInAppToken
    ) {
        try {
            const match: any = {};
            match.userId = { $ne: user._id };
            match.orderId = { $eq: subscription.orderId };
            const step1 = await baseDao.findOne("subscriptions", match);
            if (step1) return Promise.reject(MESSAGES.ERROR.RECEIPT_ALREADY_EXIST);
            if (!step1) {
                let amount;
                let subscriptionPlan = ""
                if ((query.basePlanId == SUBSCRIPTION_DURATION_ANDROID.MONTH)) {
                    amount = SUBSCRIPTION_AMOUNT.MONTH;
                    subscriptionPlan = SUBSCRIPTIONS_PLAN.MONTHLY
                } else {
                    amount = SUBSCRIPTION_AMOUNT.YEAR;
                    subscriptionPlan = SUBSCRIPTIONS_PLAN.YEARLY
                }
                let toSave = {
                    userId: user._id,
                    name: user.name,
                    mobileNo: user.fullMobileNo,
                    subscriptionStatus: STATUS.ACTIVE,
                    startDate: subscription.startTimeMillis,
                    endDate: subscription.expiryTimeMillis,
                    orderId: subscription.orderId,
                    subscriptionType: subscriptionPlan,
                    platform: SUB_TYPE.ANDROID,
                    receiptToken: query.receipt,
                    productId: query.basePlanId,
                    amount: amount,
                };

                let toSavePayment = {
                    userId: user._id,
                    name: user.name,
                    mobileNo: user.fullMobileNo,
                    paymentStatus: STATUS.SUCCESS,
                    subscriptionStatus: STATUS.ACTIVE,
                    startDate: subscription.startTimeMillis,
                    endDate: subscription.expiryTimeMillis,
                    transactionId: subscription.orderId,
                    transactionDate: Date.now(),
                    subscriptionPlan: subscriptionPlan,
                    type: SUB_TYPE.ANDROID,
                    amount: amount,
                    deviceId: query.deviceId,
                };
                
                await this.save("payments", toSavePayment);
                await this.save("subscriptions", toSave);
            }
        } catch (error) {
            console.error(error);
            throw error;
        }
    }

    /**
    * @function reNewIosSubscription
    */
    async reNewAndroidSubscription(payload: any, eventData: any) {
        try {

            const query: any = {
                receiptToken: eventData.purchaseToken,
            }
            const subscription = await this.findOne("subscriptions", query);

            let amount;
            let subscriptionPlan = ""
            let basePlan = ""
            if ((subscription?.subscriptionType == SUBSCRIPTIONS_PLAN.MONTHLY)) {
                amount = SUBSCRIPTION_AMOUNT.MONTH;
                subscriptionPlan = SUBSCRIPTIONS_PLAN.MONTHLY
                basePlan = SUBSCRIPTION_DURATION_ANDROID.MONTH
            } else {
                amount = SUBSCRIPTION_AMOUNT.YEAR;
                subscriptionPlan = SUBSCRIPTIONS_PLAN.YEARLY
                basePlan = SUBSCRIPTION_DURATION_ANDROID.YEAR
            }
            if(subscription){
                // await baseDao.findOneAndUpdate("subscriptions", { productId: eventData.subscriptionId, subscriptionStatus: STATUS.ACTIVE, receiptToken: eventData.purchaseToken }, { subscriptionStatus: SUBSCRIPTION_STATUS.EXPIRED, isActive: false }, {})
                let toSave = {
                    userId: subscription.userId,
                    name: subscription.name,
                    mobileNo: subscription.mobileNo,
                    subscriptionStatus: STATUS.ACTIVE,
                    startDate: payload.startTimeMillis,
                    endDate: payload.expiryTimeMillis,
                    orderId: payload.orderId,
                    subscriptionType: subscriptionPlan,
                    platform: SUB_TYPE.ANDROID,
                    receiptToken: eventData.purchaseToken,
                    productId: basePlan,
                    amount: amount,
                }
    
                let toSavePayment = {
                    userId: subscription.userId,
                    name: subscription.name,
                    mobileNo: subscription.mobileNo,
                    paymentStatus: STATUS.SUCCESS,
                    subscriptionStatus: STATUS.ACTIVE,
                    startDate: payload.startTimeMillis,
                    endDate: payload.expiryTimeMillis,
                    transactionId: payload.orderId,
                    transactionDate: Date.now(),
                    renewOn: Date.now(),
                    subscriptionPlan: subscriptionPlan,
                    type: SUB_TYPE.ANDROID,
                    amount: amount,
                }
                await userDaoV1.findOneAndUpdate(
                    "users",
                    { _id: subscription.userId },
                    {
                        original_transaction_id: payload.orderId,
                        isSubscribed: true,
                        subscriptionType: basePlan,
                        subscriptionExpiryDate: payload.expiryTimeMillis
                    }
                );
			    await redisClient.storeValue(SERVER.APP_NAME + "_" + subscription.userId + REDIS_KEY_PREFIX.SUBSCRIBED, JSON.stringify({"startDate": Date.now(), "expiryDate": payload.expiryTimeMillis}));
                await this.findOneAndUpdate("payments", {transactionId: subscription.orderId, subscriptionStatus: SUBSCRIPTION_STATUS.ACTIVE}, {subscriptionStatus: SUBSCRIPTION_STATUS.EXPIRED});
                await this.save("payments", toSavePayment)
                return await baseDao.findOneAndUpdate("subscriptions", { receiptToken: eventData.purchaseToken }, toSave, {})
            }
        } catch (error) {
            console.error(error);
            throw error;
        }
    }

    /**
     * @function subscriptionExpired
     */
    async subscriptionExpired(eventData: any) {
        try {
            const subscriptionFilterQuery: any = {
                receiptToken: eventData.purchaseToken,
            }
            const subscription = await this.findOne("subscriptions", subscriptionFilterQuery);

            if(subscription){
                const query: any = {};
                query.receiptToken = eventData.purchaseToken;
                query.userId = subscription.userId;
                query.subscriptionStatus = {"$in": [SUBSCRIPTION_STATUS.ACTIVE, SUBSCRIPTION_STATUS.CANCELLED]};
                const update = {};
                update["$set"] = {
                    isActive: false,
                    subscriptionStatus: SUBSCRIPTION_STATUS.EXPIRED
                }
                const params = {userId:subscription.userId,platform: SUB_TYPE.ANDROID};
                await Promise.all([
                    this.updateMany("subscriptions", query, update,{}),
                    this.findOneAndUpdate("users", { _id: subscription.userId, receipt: eventData.purchaseToken }, { isSubscribed: false }),
                    redisClient.deleteKey(SERVER.APP_NAME + "_" + subscription.userId + REDIS_KEY_PREFIX.SUBSCRIBED),
                    this.updateMany("payments", {userId: subscription.userId, subscriptionStatus: {"$in": [SUBSCRIPTION_STATUS.ACTIVE, SUBSCRIPTION_STATUS.CANCELLED]}}, {subscriptionStatus: SUBSCRIPTION_STATUS.EXPIRED},{}),
                    axiosService.post({"url": SERVER.CHAT_APP_URL + SERVER.EXPIRE_SUBSCRIPTION, "body": params})
                ])
            }
        }
        catch (error) {
            console.error(error);
            throw error;
        }
    }

    /**
     * @function subscriptionCancelled
     */
    async subscriptionCancelled(eventData: any) {
        try {

            const subscriptionFilterQuery: any = {
                receiptToken: eventData.purchaseToken,
            }
            const subscription = await this.findOne("subscriptions", subscriptionFilterQuery);

            if(subscription){
                const query: any = {};
                query.receiptToken = eventData.purchaseToken;
                query.userId = subscription.userId;
                query.subscriptionStatus = SUBSCRIPTION_STATUS.ACTIVE
                const update = {};
                update["$set"] = {
                    autoRenewing: false,
                    isCancelled: true,
                    subscriptionStatus: SUBSCRIPTION_STATUS.CANCELLED,
                    cancelledOn: Date.now()
                }
                
                await this.findOneAndUpdate("payments", {transactionId: subscription.orderId, subscriptionStatus: SUBSCRIPTION_STATUS.ACTIVE}, {subscriptionStatus: SUBSCRIPTION_STATUS.CANCELLED, cancelledOn: Date.now()});
                return await this.findOneAndUpdate("subscriptions", query, update);
            }
        }
        catch (error) {
            console.error(error);
            throw error;
        }
    }

    /**
     * @function updateAndroidSubscription
     */
    async updateAndroidSubscription(payload: any, users: any, query: any) {
        try {
            let amount;
            let subscriptionPlan = ""
            if ((query.basePlanId == SUBSCRIPTION_DURATION_ANDROID.MONTH)) {
                amount = SUBSCRIPTION_AMOUNT.MONTH;
                subscriptionPlan = SUBSCRIPTIONS_PLAN.MONTHLY
            } else {
                amount = SUBSCRIPTION_AMOUNT.YEAR;
                subscriptionPlan = SUBSCRIPTIONS_PLAN.YEARLY
            }
            let toUpdate = {
                userId: users._id,
                name: users.name,
                isActive: true,
                autoRenewing: true,
                isCancelled: false,
                mobileNo: users.fullMobileNo,
                subscriptionStatus: STATUS.ACTIVE,
                startDate: payload.startTimeMillis,
                endDate: payload.expiryTimeMillis,
                orderId: payload.orderId,
                subscriptionType: subscriptionPlan,
                platform: SUB_TYPE.ANDROID,
                receiptToken: query.receipt,
                productId: query.basePlanId,
                amount: amount,
            }

            let toSavePayment:any = {
                userId: users._id,
                name: users.name,
                mobileNo: users.fullMobileNo,
                paymentStatus: STATUS.SUCCESS,
                subscriptionStatus: STATUS.ACTIVE,
                startDate: payload.startTimeMillis,
                endDate: payload.expiryTimeMillis,
                transactionId: payload.orderId,
                transactionDate: Date.now(),
                subscriptionPlan: subscriptionPlan,
                type: SUB_TYPE.ANDROID,
                amount: amount,
            }

            if(payload.linkedPurchaseToken){
                await baseDao.findOneAndUpdate("subscriptions", { userId: users._id }, { $set: toUpdate }, {});
                toSavePayment.upgradeOn = Date.now();
                await this.updateMany("payments", {userId:  users._id, subscriptionStatus: SUBSCRIPTION_STATUS.ACTIVE}, {subscriptionStatus: SUBSCRIPTION_STATUS.EXPIRED},{});
                await this.save("payments", toSavePayment);
                
            }
            else{
                await baseDao.findOneAndUpdate("subscriptions", { userId: users._id }, { $set: toUpdate }, {});
                await this.save("payments", toSavePayment);
            }


        }
        catch (error) {
            console.error(error);
            throw error;
        }
    }

    /**
     * @function restoredSubscription
     */
    async restoredSubscription(eventData: any) {
        try {
            const subscriptionFilterQuery: any = {
                receiptToken: eventData.purchaseToken,
            }
            const subscription = await this.findOne("subscriptions", subscriptionFilterQuery);
            if(subscription){
                await baseDao.findOneAndUpdate("subscriptions", { userId: subscription.userId, receiptToken: eventData.purchaseToken, platform: SUB_TYPE.ANDROID }, { autoRenewing: true, isCancelled: false, subscriptionStatus: STATUS.ACTIVE });
                await this.findOneAndUpdate("payments", {transactionId: subscription.orderId, subscriptionStatus: SUBSCRIPTION_STATUS.CANCELLED}, {subscriptionStatus: SUBSCRIPTION_STATUS.ACTIVE});
            }
        }
        catch (error) {
            console.error(error);
            throw error;
        }
    }

    /**
     * @function getTransactions
     */
    async getTransactions(params: SubscriptionRequest.TransactionListing, tokenData: TokenData) { //NOSONAR

        try {
            const aggPipe = [];
            let modelUser: any = DB_MODEL_REF.USER_PAYMENTS;

            const match: any = {};
            if (params.searchKey) {
                aggPipe.push(Search(params.searchKey, ["name", "mobileNo", "transactionId"]))
            }
            if (params.paymentStatus) match.paymentStatus = { "$in": params.paymentStatus };
            
            if (params.subscriptionPlan) match.subscriptionPlan = {"$in": params.subscriptionPlan};
            
            if (params.type) match.type = {"$in": params.type};
            
            if (params.fromDate && !params.toDate) match.created = { "$gte": params.fromDate };
            if (params.toDate && !params.fromDate) match.created = { "$lte": params.toDate };
            if (params.fromDate && params.toDate) match.created = { "$gte": params.fromDate, "$lte": params.toDate };
            if (params.amount) match.amount = { "$lte": params.amount };
            aggPipe.push({ "$match": match });

            aggPipe.push({ $sort: { created: -1 } });
            if (!params.isExport) {

                if (params.limit && params.pageNo) {
                    const [skipStage, limitStage] = this.addSkipLimit(
                        params.limit,
                        params.pageNo,
                    );
                    aggPipe.push(skipStage, limitStage);
                }
            }

            const options = { collation: true };
            aggPipe.push({
                "$project": {
                    _id: 0,
                    transactionId: 1,
                    subscriptionPlan: 1,
                    paymentStatus: 1,
                    amount: 1,
                    type: 1,
                    transactionDate: 1,
                    name: 1,
                    mobileNo: 1,
                    userId: 1,
                    createdAt: 1
                }
            });

            let pageCount = true;
            if (!params.isExport) {
                const response = await this.dataPaginate(modelUser, aggPipe, params.limit, params.pageNo, options, pageCount);
                return response
            } else {
                const result = await this.aggregate(modelUser, aggPipe)
                console.log(result);
                const data: { url: string } = {
                    url: String(await this.exportTransactionsToCSV(result, `${tokenData.userId}__TransactionsLists.csv`)),
                };

                return MESSAGES.SUCCESS.DETAILS(data);

            }
        } catch (error) {
            console.error(error);
            throw error;
        }
    }

    async exportTransactionsToCSV(data: any[], fileName: string) {
        const csvWriter = createObjectCsvWriter({
            path: `${SERVER.UPLOAD_DIR}` + fileName,
            header: [
                { id: 'transactionId', title: 'transactionId' },
                { id: 'name', title: 'name' },
                { id: 'mobileNo', title: 'mobileNo' },
                { id: 'subscriptionPlan', title: 'subscriptionPlan' },
                { id: 'type', title: 'type' },
                { id: 'amount', title: 'amount' },
                { id: 'createdAt', title: 'createdAt' },
                { id: 'paymentStatus', title: 'paymentStatus' },
            ],
        });


        try {
            await csvWriter.writeRecords(data);
            return await imageUtil.uploadSingleMediaToS3(fileName);
        } catch (error) {
            console.error('Error writing CSV:', error);
        }
    }

    /**
     * @function subscribedUser
     */
    async subscribedUser(params: SubscriptionRequest.SubscriptionListing, tokenData: TokenData) { //NOSONAR
        try {
            const aggPipe = [];
            let modelUser: any = DB_MODEL_REF.SUBSCRIPTIONS;
            const match: any = {};
            if (params.searchKey) {
                aggPipe.push(Search(params.searchKey, ["name", "mobileNo"]))
            }
            if (params.subscriptionStatus)
                match.subscriptionStatus = { "$in" : params.subscriptionStatus };

            if (params.subscriptionPlan) match.subscriptionType = {"$in": params.subscriptionPlan};
            
            if (params.type) match.platform = {"$in":params.type};
            
            if (params.startFromDate && !params.startToDate) match.startDate = { "$gte": params.startFromDate };
            if (params.startToDate && !params.startFromDate) match.startDate = { "$lte": params.startToDate };
            if (params.startFromDate && params.startToDate) match.startDate = { "$gte": params.startFromDate, "$lte": params.startToDate };
            if (params.renewalFromDate && !params.renewalToDate) match.endDate = { "$gte": params.renewalFromDate };
            if (params.renewalToDate && !params.renewalFromDate) match.endDate = { "$lte": params.renewalToDate };
            if (params.renewalFromDate && params.renewalToDate) match.endDate = { "$gte": params.renewalFromDate, "$lte": params.renewalToDate };
            aggPipe.push({ "$match": match });

            let sort = {};
			(params.sortBy && params.sortOrder) ? sort = { [params.sortBy]: params.sortOrder } : sort = { created: -1 };
			aggPipe.push({ "$sort": sort });
            if (!params.isExport) {

                if (params.limit && params.pageNo) {
                    const [skipStage, limitStage] = this.addSkipLimit(
                        params.limit,
                        params.pageNo,
                    );
                    aggPipe.push(skipStage, limitStage);
                }
            }

            const options = { collation: true };
            aggPipe.push({
                "$project": {
                    _id: 0,
                    subscriptionType: 1,
                    platform: 1,
                    startDate: 1,
                    endDate: 1,
                    subscriptionStatus: 1,
                    name: 1,
                    mobileNo: 1,
                    userId: 1
                }
            });

            let pageCount = true;
            if (!params.isExport) {
                const response = await this.dataPaginate(modelUser, aggPipe, params.limit, params.pageNo, options, pageCount);
                return response
            } else {
                const result = await this.aggregate(modelUser, aggPipe)
                const formattedData = result.map(item => ({
                    ...item,
                    startDate: new Date(item.startDate).toLocaleDateString(),
                    endDate: new Date(item.endDate).toLocaleDateString(),
                }));
                console.log(formattedData);
                const data: { url: string } = {
                    url: String(await this.exportSubscribedUsersToCSV(formattedData, `${tokenData.userId}__SubscribedUsersLists.csv`)),
                };

                return MESSAGES.SUCCESS.DETAILS(data);

            }
        }
        catch (error) {
            console.error(error);
            throw error;
        }
    }

    async exportSubscribedUsersToCSV(data: any[], fileName: string) {
        const csvWriter = createObjectCsvWriter({
            path: `${SERVER.UPLOAD_DIR}` + fileName,
            header: [
                { id: 'name', title: 'name' },
                { id: 'mobileNo', title: 'mobileNo' },
                { id: 'subscriptionType', title: 'subscriptionType' },
                { id: 'platform', title: 'platform' },
                { id: 'startDate', title: 'startDate' },
                { id: 'endDate', title: 'endDate' },
                { id: 'subscriptionStatus', title: 'subscriptionStatus' },
            ],
        });


        try {
            await csvWriter.writeRecords(data);
            return await imageUtil.uploadSingleMediaToS3(fileName);
        } catch (error) {
            console.error('Error writing CSV:', error);
        }
    }

    /**
     * @function transactionOverview
     */
    async transactionOverview(){
        try{
            const query: any = {};
            query.platform = SUB_TYPE.IOS;

            const query1: any = {};
            query1.platform = SUB_TYPE.ANDROID;

            const query2: any = {};
            query2.subscriptionStatus = SUBSCRIPTION_STATUS.ACTIVE;

            const query3: any = {};
            query3.subscriptionStatus = SUBSCRIPTION_STATUS.CANCELLED;

            const aggPipe:any = [];
            aggPipe.push(
                {
                    $group: {
                        _id: null,
                        totalAmount: { $sum: { $toDouble: "$amount" } }
                    }
                }
            );

            const query4:any = {subscriptionType: { $exists: true }};

            let [totalTransactions, 
                iosSubsCount, 
                androidSubsCount, 
                activeSubsCount, 
                cancelledSubsCount, 
                totalRevenueResult,
                totalSubsUsers] = await Promise.all([
                this.count("payments", {}),
                this.count("subscriptions", query),
                this.count("subscriptions", query1),
                this.count("subscriptions", query2),
                this.count("subscriptions", query3),
                this.aggregate("payments",aggPipe),
                this.count("users", query4)
            ]);

            const totalRevenue = totalRevenueResult.length > 0 ? totalRevenueResult[0].totalAmount : 0;
            return {
                totalTransactions, 
                iosSubsCount, 
                androidSubsCount, 
                activeSubsCount, 
                cancelledSubsCount, 
                totalRevenue,
                totalSubsUsers
            };
        }
        catch(error){
            console.error(error);
            throw error;
        }
    }

    /**
     * @function userSubscriptions
     */
    async userSubscriptions(params: SubscriptionRequest.Subscriptions){
        try{
            const modelReport:any = DB_MODEL_REF.USER_PAYMENTS 
			const aggPipe: any = [];

            const match: any = {};
            match.userId = toObjectId(params.userId);
            aggPipe.push({ "$match": match });

			aggPipe.push({ $sort: { created: -1 } });

			if (params.limit && params.pageNo) {
				const [skipStage, limitStage] = this.addSkipLimit(
					params.limit,
					params.pageNo,
				);
				aggPipe.push(skipStage, limitStage);
			}

            aggPipe.push({
                "$project": {
                    _id: 0,
                    transactionId: 1,
                    subscriptionType: "$subscriptionPlan",
                    startDate: 1,
                    endDate: 1,
                    subscriptionStatus: 1,
                    upgradeOn: 1,
                    renewOn: 1,
                    cancelledOn: 1,
                    amount: 1,
                }
            });
			const options = { collation: true };
			let pageCount = true;
			return await this.dataPaginate(modelReport, aggPipe, params.limit, params.pageNo, options, pageCount);
        }
        catch(error){
            console.error(error);
            throw error;
        }
    }

    async freeTrial(tokeData: TokenData, userDetails: any){
        try{
            let endDate = moment().add(6, 'days'); // 7 days from now
            endDate = endDate.endOf('day').valueOf();
            const transactionId = genRandomString(10);
            let toSave = {
                userId: userDetails._id,
                name: userDetails.name,
                mobileNo: userDetails.fullMobileNo,
                isActive: true,
                autoRenewing: false,
                isCancelled: false,
                subscriptionStatus: STATUS.ACTIVE,
                startDate: moment(),
                endDate: endDate,
                transactionId: transactionId,
                subscriptionType: SUBSCRIPTIONS_PLAN.TRIAL,
                amount: SUBSCRIPTION_AMOUNT.TRIAL,
                productId: SUBSCRIPTIONS_PLAN.TRIAL, 
            }

            let toSavePayment = {
                userId: userDetails._id,
                name: userDetails.name,
                mobileNo: userDetails.fullMobileNo,
                paymentStatus: STATUS.SUCCESS,
                subscriptionStatus: STATUS.ACTIVE,
                startDate: Date.now(),
                endDate: endDate,
                transactionDate: Date.now(),
                transactionId: transactionId,
                subscriptionPlan: SUBSCRIPTIONS_PLAN.TRIAL,
                amount: SUBSCRIPTION_AMOUNT.TRIAL,
            }
            await userDaoV1.findOneAndUpdate(
                "users",
                { _id: tokeData.userId },
                {
                    original_transaction_id: transactionId,
                    isSubscribed: true,
                    subscriptionType: SUBSCRIPTIONS_PLAN.TRIAL,
                    subscriptionExpiryDate: endDate,
                }
            );
			await redisClient.storeValue(SERVER.APP_NAME + "_" + tokeData.userId + REDIS_KEY_PREFIX.SUBSCRIBED, JSON.stringify({"startDate": Date.now(), "expiryDate": endDate}));
            await this.save("payments", toSavePayment)
            return await this.save("subscriptions", toSave);
        }
        catch(error){
            throw error;
        }
    }
}

export const subscriptionDao = new SubscriptionDao();
