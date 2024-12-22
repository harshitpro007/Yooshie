"use strict";

import { MESSAGES, TEMPLATES, SERVER } from "@config/index";
import { consolelog } from "@utils/appUtils";
const { Vonage } = require('@vonage/server-sdk')

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

	async vonagesend(params){
		const vonage = new Vonage({
			apiKey: SERVER.VONAGE.VONAGE_API_KEY,
			apiSecret: SERVER.VONAGE.VONAGE_API_SECRET
		})
		const from = "Vonage APIs"
		const to = params.fullMobileNo
		const text = 'A text message sent using the Vonage SMS API'

		async function sendSMS() {
			await vonage.sms.send({ to, from, text })
				.then(resp => { console.log('Message sent successfully'); console.log(resp); })
				.catch(err => { console.log('There was an error sending the messages.'); console.error(err); });
		}
		sendSMS();
	}
}

export const smsManager = new SMSManager();