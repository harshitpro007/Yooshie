"use strict";

import * as nodemailer from "nodemailer";

import { timeConversion } from "@utils/appUtils";
import { TEMPLATES, SERVER, ROLE_TITLES } from "@config/index";
import { TemplateUtil } from "@utils/TemplateUtil";
import { sendMessageToFlock } from "@utils/FlockUtils";
const sgMail = require("@sendgrid/mail");

// using smtp


export class MailManager {
	private fromEmail: string = SERVER.MAIL.FROM_MAIL;

	async sendMail(params) {
			sgMail.setApiKey(SERVER.MAIL.SENDGRID_API_KEY);
			let mailOptions = {
				to: params.email,
				from: `${SERVER.APP_NAME} <${SERVER.MAIL.FROM_MAIL}>`, // sender email
				subject: params.subject,
				html: params.content,
			};
			console.log(mailOptions);
			return new Promise(function (resolve, reject) {
				return sgMail.send(mailOptions, function (error, info) {
					if (error) {
						console.error("sendMail==============>", error);
						sendMessageToFlock({ "title": "sendMail", "error": error });
						resolve(SERVER.ENVIRONMENT !== "production" ? true : false);
					} else {
						console.log("Message sent: " + info.response);
						resolve(true);
					}
				});
			});
	}

	async forgotPasswordMail(params) {

		const templatePath = SERVER.TEMPLATE_PATH;
		const template = templatePath + 'reset-password.html';

		const mailContent = await new TemplateUtil(template).compileFile({
			name: params?.name,
			otp: params.otp,
			link: params.link
		});
		const emailParams = {
			email: params.email,
			subject: TEMPLATES.EMAIL.SUBJECT.FORGOT_PASSWORD,
			content: mailContent,
		};
		return await this.sendMail(emailParams);

	}
	async composeMail(params) {
		const mailContent = await (new TemplateUtil(SERVER.TEMPLATE_PATH + "compose.html"))
			.compileFile({
				"message": params.message,
				"name": params.name,
			});

		return await this.sendMail({
			"email": params.email,
			"subject": params.subject,
			"content": mailContent
		});
	}
	async incidenReportdMail(params) {
		const mailContent = await (new TemplateUtil(SERVER.TEMPLATE_PATH + "forgot-password.html"))
			.compileFile({
				"otp": params.otp,
				"name": params.name,
				"validity": timeConversion(SERVER.TOKEN_INFO.EXPIRATION_TIME.FORGOT_PASSWORD)
			});

		return await this.sendMail({
			"email": params.email,
			"subject": TEMPLATES.EMAIL.SUBJECT.FORGOT_PASSWORD,
			"content": mailContent
		});
	}

	/**
	 * @function accountBlocked
	 * @description user account have been blocked
	 */
	async accountBlocked(payload) {
		let mailContent = await (new TemplateUtil(SERVER.TEMPLATE_PATH + "account-blocked.html"))
			.compileFile({
				"name": payload?.name,
				"reason": payload.reason
			});

		return await this.sendMail({
			"email": payload.email,
			"subject": TEMPLATES.EMAIL.SUBJECT.ACCOUNT_BLOCKED,
			"content": mailContent
		});
	}

	/**
	 * @function welcomeEmail
	 * @description send welcome email to user after profile completion
	 * @author Chitvan Baish
	 * @param params.email: user's email
	 * @param params.name: user's name
	 */
	async welcomeEmail(params) {
		const mailContent = await (new TemplateUtil(SERVER.TEMPLATE_PATH + "welcome-email.html"))
			.compileFile({
				"name": params.name
			});

		return await this.sendMail({
			"email": params.email,
			"subject": TEMPLATES.EMAIL.SUBJECT.WELCOME,
			"content": mailContent
		});
	}

	/**
	 * @function accountBlocked
	 * @description user account have been rejected
	 */
	async verificationStatus(payload) {
		let mailContent = await (new TemplateUtil(SERVER.TEMPLATE_PATH + "verification-process.html"))
			.compileFile({
				"name": payload?.name,
				"reason": payload.reason
			});

		return await this.sendMail({
			"email": payload.email,
			"subject": TEMPLATES.EMAIL.SUBJECT.VERIFICATION_REJECTED,
			"content": mailContent
		});
	}

	/**
	 * @function documentUploadLink
	 * @description send document upload link
	 * @author Chitvan Baish
	 * @param params.name: user's name
	 * @param params.email: user's email
	 * @param params.type: type
	 * @param params.displayName: name to be displayed on template
	 * @param params.token: unique token for document upload
	 */
	async documentUploadLink(params) {
		const mailContent = await (new TemplateUtil(SERVER.TEMPLATE_PATH + "document-link.html"))
			.compileFile({
				"url": `${SERVER.APP_URL}/deeplink?name=${params.name}&token=${params.token}&type=${params.type}`,
				"displayName": params.displayName,
				"name": params.name
			});

		return await this.sendMail({
			"email": params.email,
			"subject": TEMPLATES.EMAIL.SUBJECT.UPLOAD_DOCUMENT,
			"content": mailContent
		});
	}


	/**
	 * @function subAdminPasswordMail
	 * @description admin adds new sub-admin
	 * @author Chitvan Baish
	 * @param params.name: sub-admin's name
	 * @param params.email: sub-admin's email
	 * @param params.password: sub-admin's password
	 * @param params.role: sub-admin's role
	 */
	async subAdminPasswordMail(params) {
		let mailContent = await (new TemplateUtil(SERVER.TEMPLATE_PATH + "welcome.html"))
			.compileFile({
				"name": params.name,
				"email": params.email,
				"password": params.password,
				"role": ROLE_TITLES[params.role],
				"link": params.link,
				"admin_url": params.admin_url
			});

		const emailParams = {
			email: params.email,
			subject: TEMPLATES.EMAIL.SUBJECT.ADD_NEW_SUBADMIN,
			content: mailContent,
		};
		return await this.sendMail(emailParams);
	}






}

export const mailManager = new MailManager();