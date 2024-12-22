"use strict";

import { MESSAGES, TEMPLATES, SERVER } from "@config/index";
import { consolelog } from "@utils/appUtils";

let messagebird = require("messagebird");
messagebird = (SERVER.MESSAGEBIRD.ACCESS_KEY);

let smsCounter = 0;

export class SMSManager {

	_sendMessage(mobileNo, body) {
		if (SERVER.ENVIRONMENT !== "production" && smsCounter > 100) {
			return Promise.reject(MESSAGES.ERROR.BLOCKED_MOBILE);
		}

		const params = {
			"originator": "",
			"recipients": +mobileNo,
			"body": body
		};
		return new Promise(function (resolve, reject) {
			messagebird.messages.create(params, function (error, response) {
				if (error) {
					consolelog("Message Bird Send Message", error, false);
					resolve(SERVER.ENVIRONMENT !== "production" ? true : false);
				}
				smsCounter++;
				console.log(response);
				resolve(true);
			});
		});
	}

	async sendOTP(countryCode, mobileNo, otp) {
		try {
			const sms = TEMPLATES.SMS.OTP.replace(/OTP/g, otp);
			return await this._sendMessage([countryCode + mobileNo], sms);
		} catch (error) {
			throw error;
		}
	}

	async _sendVoiceMessage(mobileNo, body) {
		try {
			if (SERVER.ENVIRONMENT !== "production" && smsCounter > 100) {
				return Promise.reject(MESSAGES.ERROR.BLOCKED_MOBILE);
			}
			const params = {
				"originator": "",
				"recipients": +mobileNo,
				"language": "en-in",
				"body": body
			};
			return new Promise(function (resolve, reject) {
				messagebird.voice_messages.create(params, function (error, response) {
					if (error) {
						consolelog("Message Bird Voice Message", error, false);
						resolve(SERVER.ENVIRONMENT !== "production" ? true : false);
					}
					smsCounter++;
					console.log(response);
					resolve(true);
				});
			});
		}
		catch (error) {
			throw error;
		}
	}

	async sendVoicOTP(countryCode, mobileNo, otp, language) {
		try {
			const voiceMessage = `Your O.T.P is ${otp.split("").join(" ")}  .`;
			return await this._sendVoiceMessage([countryCode + mobileNo], voiceMessage);
		} catch (error) {
			throw error;
		}
	}
}

export const smsManager = new SMSManager();