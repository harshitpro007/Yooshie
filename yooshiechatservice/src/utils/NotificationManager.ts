"use strict";

import * as _ from "lodash";

import {
	NOTIFICATION_DATA,
	STATUS,
	DB_MODEL_REF

} from "@config/index";


import { baseDao } from "@modules/baseDao/index";

export class NotificationManager {

	public modelLoginHistory: any = DB_MODEL_REF.LOGIN_HISTORY;

	/**
	   * @function profileIncompleteNotification
	 * @description when any field is incomplete during the onboarding
	 * @param {object} tokenData - user data
		 */
	async profileIncompleteNotification(tokenData: TokenData) {
		let notificationData = NOTIFICATION_DATA.ADD_EDIT_EVENT(tokenData.language, tokenData.userId, {}, '');
		notificationData = _.extend(notificationData, { "receiverId": [tokenData.userId] });

		const options: any = { lean: true };
		const tokens = await baseDao.find(this.modelLoginHistory, { "userId": tokenData.userId, "isLogin": true, "pushNotificationStatus": true, "status": STATUS.UN_BLOCKED }, { userId: 1, platform: 1, deviceToken: 1 }, options, {}, {}, {});
		// if (tokens.length) await createPayloadAndSendPush(tokens, notificationData);
	}
}

export const notificationManager = new NotificationManager();