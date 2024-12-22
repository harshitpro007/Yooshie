"use strict";

import nodemailer from "nodemailer";

import { timeConversion } from "@utils/appUtils";
import { TEMPLATES, SERVER } from "@config/index";
import { TemplateUtil } from "@utils/TemplateUtil";
import { sendMessageToFlock } from "@utils/FlockUtils";
const sgMail = require("@sendgrid/mail");

// using smtp


export class MailManager {
	
	async sendMail(params) {
		let transporter;
		
		
		transporter = nodemailer.createTransport({
			host: SERVER.MAIL.SMTP.HOST,
			port: SERVER.MAIL.SMTP.PORT,
			secure: SERVER.MAIL.SMTP.SECURE, // use SSL
			//	requireTLS: true,
			auth: {
				user: SERVER.MAIL.SMTP.USER,
				pass: SERVER.MAIL.SMTP.PASSWORD
			}
		});
		console.log("Transporer details", transporter);
		const mailOptions = {
			from: `${SERVER.APP_NAME} <${SERVER.MAIL.FROM_MAIL}>`, // sender email
			to: params.email, // list of receivers
			subject: params.subject, // Subject line
			html: params.content
		};
		return new Promise(function (resolve, reject) {
			return transporter.sendMail(mailOptions, function (error, info) {
				if (error) {
					console.error("sendMail==============>", error);
					sendMessageToFlock({ "title": "sendMail", "error": error });
					resolve(SERVER.ENVIRONMENT !== "production");
				} else {
					console.log("Message sent: " + info.response);
					resolve(true);
				}
			});
		});
	}

	async forgotPasswordMail(params) {
		const mailContent = await (new TemplateUtil(SERVER.TEMPLATE_PATH + "forgot-password.html"))
			.compileFile({
				"name": params?.name,
				"link": params.link,
				"validity": timeConversion(SERVER.TOKEN_INFO.EXPIRATION_TIME.FORGOT_PASSWORD)
			});
		return await this.sendMail({
			"email": params.email,
			"subject": TEMPLATES.EMAIL.SUBJECT.FORGOT_PASSWORD,
			"content": mailContent,
		});
	}
	
	async verifyEmail(params) {
		const mailContent = await (new TemplateUtil(SERVER.TEMPLATE_PATH + "verify-email.html"))
			.compileFile({
				"otp": params.otp,
				"name": params.name,
				"validity": timeConversion(SERVER.TOKEN_INFO.EXPIRATION_TIME.VERIFY_EMAIL)
			});

		return await this.sendMail({
			"email": params.email,
			"subject": TEMPLATES.EMAIL.SUBJECT.VERIFY_EMAIL,
			"content": mailContent
		});
	}

	/**
	 * @function welcomeEmail
	 * @description send welcome email to user after profile completion
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
	 * @function assignNewAssistantMail
	 * @description send assign New Assistant email to user
	 * @param params.email: user's email
	 * @param params.name: user's name
	 */
	async assignNewAssistantMail(params){
		const mailContent = await (new TemplateUtil(SERVER.TEMPLATE_PATH + "assign-new-assistant.html"))
			.compileFile({
				"name": params.name,
				"assistantEmail": params.assistantEmail,
				"mobileNo": params.mobileNo,
				"assistantName": params.assistantName
			});

		return await this.sendMail({
			"email": params.email,
			"subject": TEMPLATES.EMAIL.SUBJECT.NEW_ASSISTANT_ASSIGNED,
			"content": mailContent
		});
	}

	/**
	 * @function changePasswordMail
	 * @description send assign New Assistant email to user
	 * @param params.email: user's email
	 * @param params.name: user's name
	 */
	async changePasswordMail(params){
		const mailContent = await (new TemplateUtil(SERVER.TEMPLATE_PATH + "change-password.html"))
			.compileFile({
				"name": params.name
			});

		return await this.sendMail({
			"email": params.email,
			"subject": TEMPLATES.EMAIL.SUBJECT.CHANGE_PASSWORD,
			"content": mailContent
		});
	}

	/**
	 * @function subAdminPasswordMail
	 * @description admin adds new sub-admin
	 * @param params.name: sub-admin's name
	 * @param params.email: sub-admin's email
	 * @param params.password: sub-admin's password
	 * @param params.role: sub-admin's role
	 */
	async subAdminPasswordMail(params) {
		let mailContent = await (new TemplateUtil(SERVER.TEMPLATE_PATH + "sub-admin-invite.html"))
			.compileFile({
				"name": params.name,
				"email": params.email,
				"password": params.password,
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