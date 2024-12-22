
"use strict";

import * as _ from "lodash";
import { SERVER } from '@config/environment';
import { MESSAGES, STATUS, SOCKET, CHAT_TYPE, MESSAGE_TYPE, REDIS_KEY_PREFIX, PAGINATION_DEFAULT, LANGUAGE_CODE, NOTIFICATION_TYPE, CHAT_HEADERS, CHAT_MODE_TYPE, DB_MODEL_REF, USER_TYPE } from "@config/constant";
import { baseDao } from "@modules/baseDao";
import { chatDaoV1 } from "@modules/chat/index";
import { userDaoV1 } from "@modules/user";
import { redisClient } from "@lib/redis/RedisClient";
import { toObjectId, consolelog, diffBw2Arrays, messageTypeInChat } from "@utils/appUtils";
import { imageUtil } from "@lib/ImageUtil";
import * as  moment  from 'moment'
import { SocketIO } from "../../../socket/socket";
import { smsProxy } from "@modules/vonage/controller";
export class ChatController {

    private modelMessage: any;
    private modelChat: any;
    private modelUser: any;
    constructor() {
        this.modelMessage = DB_MODEL_REF.MESSAGES;
        this.modelChat = DB_MODEL_REF.CHATS;
        this.modelUser = DB_MODEL_REF.USER;
    }


	/**
	 * @function chatFormation
	 * event for entering into a room for chatting with users
	 */
	async chatFormation(io: any, socket: any, params: ChatRequest.Add, ack: any, tokenData: TokenData) {
		try {
			if (!params.contactUserId) {
				ack(MESSAGES.ERROR.USER_NOT_FOUND);
				return
			}
			const contactUserId = await userDaoV1.findUserById(params.contactUserId);
			if (!contactUserId) {
				ack(MESSAGES.ERROR.USER_NOT_FOUND)
				return
			}
			const isBlocked = await this.checkUserBlockedStatus(tokenData.userId, params.contactUserId);
			const isReceiverBlocked = await this.checkUserBlockedStatus(params.contactUserId, tokenData.userId);
			let members = [];
			let vonageUsers = [];
			if(!contactUserId.vonageUserId){
				const vonageUser = await smsProxy.createUser(params.contactUserId);
				vonageUsers.push(vonageUser.id)
			}
			else{
				vonageUsers.push(contactUserId.vonageUserId)
			}
			const user = await userDaoV1.findUserById(tokenData.userId);
			if(!user.vonageUserId){
				const vonageUser = await smsProxy.createUser(tokenData.userId);
				vonageUsers.push(vonageUser.id)
			}
			else{
				vonageUsers.push(user.vonageUserId)
			}
			members.push(tokenData.userId, params.contactUserId);
			let isExist = await chatDaoV1.isChatExists(members);
			if (!isExist) {
				const vonageConversationData = await smsProxy.createGroup(vonageUsers);
				const data: any = {
					members: members,
					overallMembers: members,
					vonageUsersId: vonageUsers,
					vonageConversationId: vonageConversationData.conversation.id,
					vonageMembersId: vonageConversationData.members
				}
				isExist = await chatDaoV1.save("chats", data)
			}
			let isOnline = false;
			const socket_user = await redisClient.getValue(SERVER.APP_NAME + "_" + params.contactUserId + REDIS_KEY_PREFIX.SOCKET_ID);
			if (socket_user) isOnline = true;
			let offline_status = await this.checkUserOfflineOverallStatus(tokenData.userId, params.contactUserId);
			if (offline_status) isOnline = false;
			let data = {
				chatId: isExist?._id,
				lastSeen: contactUserId?.lastSeen || 0,
				countryCode: contactUserId?.countryCode,
				mobileNo: contactUserId?.mobileNo,
				language: contactUserId?.language,
				profilePicture: contactUserId?.profilePicture,
				flagCode: contactUserId?.flagCode,
				name: contactUserId?.name,
				isBlocked: isBlocked ? true : false,
				isReceiverBlocked: isReceiverBlocked ? true : false,
				isOnline: isOnline,
				chatType: isExist?.type,
				mutedBy: isExist?.mutedBy
			}
			if (params.accessData) return data;
			ack(MESSAGES.SUCCESS.CHAT_FORMATION(data));
			socket.join(`${isExist._id}`);
			socket.emit(SOCKET.LISTNER.ONE_TO_ONE, MESSAGES.SUCCESS.CHAT_FORMATION(data));
			return
		} catch (error) {
			throw error;
		}
	}

	/**
 * @function oneToOneMessage
 * exchange messages in a room with chat user for real time chatting
 */
	async oneToOneMessage(io: any, socket: any, params: ChatRequest.ONE_TO_ONE_CHAT_MESSAGE, ack: any, tokenData: TokenData) {
		try {
			if (!params.chatId || !params.contactUserId || !params.messageType || !params.senderId ) {
				ack(MESSAGES.ERROR.PARAMS_MISSING)
				return
			}
			if (params.messageType == MESSAGE_TYPE.TEXT && !params.message) {
				ack(MESSAGES.ERROR.PARAMS_MISSING)
				return
			}
			const contactUserId = await userDaoV1.findUserById(params.contactUserId);
			if (!contactUserId) {
				ack(MESSAGES.ERROR.USER_NOT_FOUND)
			}
			const isChatExist = await baseDao.findOne('chats', {_id: params.chatId});
			if(!isChatExist)return Promise.reject(MESSAGES.ERROR.CHAT_NOT_FOUND);
			const isBlocked = await this.checkUserBlockedStatus(params.contactUserId, tokenData.userId)
			let isDelivered = [], isRead = [], deletedBy = [], blockedMessage = false;
			const socket_user = await redisClient.getValue(SERVER.APP_NAME + "_" + (params.contactUserId).toString() + REDIS_KEY_PREFIX.SOCKET_ID);
			if (isBlocked) {
				blockedMessage = true
				deletedBy.push(toObjectId(params.contactUserId))
			} else if (socket_user) {
				if (!isBlocked) {
					isDelivered.push(params.contactUserId);
				}
				const scoketIds = await io.in(socket_user).fetchSockets();
				for (const socket of scoketIds) {
					if (socket?.rooms?.has(`${params.chatId}`)) isRead.push(params.contactUserId);
				}
			}
			let members = [];
			isRead.push(params.senderId);
			isDelivered.push(params.senderId);
			members.push(tokenData.userId, params.contactUserId);
			let data: any = {
				// _id: params.localMessageId,
				type: CHAT_TYPE.ONE_TO_ONE,
				senderId: params.senderId,
				members: members,
				chatId: params.chatId,
				message: params.message,
				mediaUrl: params.mediaUrl,
				messageType: params.messageType,
				isRead: isRead,
				isDelivered: isDelivered,
				thumbnailUrl: params.thumbnailUrl ? params.thumbnailUrl : null,
				location: params.location,
				size: params.size ? params.size : null,
				transcribe: params.transcribe ? params.transcribe : null,
				status: params.status,
				deletedBy: deletedBy,
				blockedMessage: blockedMessage,
				imageRatio: params.imageRatio,
				localUrl: params.localUrl,
				vonageConversationId: isChatExist.vonageConversationId,
				vonageMembersId: isChatExist.vonageMembersId,
				vonageUsersId: isChatExist.vonageUsersId
			}
			const message = await baseDao.save(this.modelMessage, data);
			const Chat = await baseDao.findOneAndUpdate(this.modelChat, {
				_id: params.chatId
			}, {
				lastMsgId: message._id,
				lastMsgCreated: Date.now(),
				deletedBy: []
			}, { new: true });
			let membersDetails = await userDaoV1.find("users", { _id: { $in: members } }, { profilePicture: 1, _id: 1, countryCode: 1, mobileNo: 1, language: 1, status: 1, name: 1, flagCode: 1 });
			const assistantDetails = await userDaoV1.find("admins", { _id: { $in: members } }, { profilePicture: 1, _id: 1, countryCode: 1, mobileNo: 1, language: 1, status: 1, name: 1, flagCode: 1 });
			membersDetails = membersDetails.concat(assistantDetails);
			message.membersDetails = membersDetails;
			ack(message);
			if (isBlocked) {
				socket.emit(`${params.chatId}`, {
					eventType: SOCKET.LISTNER_TYPE.SOCKET_SERVICE.ONE_TO_ONE_CHAT,
					data: message
				});
				
					this.inboxChat(io, socket, PAGINATION_DEFAULT, ack, { userId: tokenData.userId });
					this.refreshChatBox(io, socket, params, ack, { userId: tokenData.userId });
				
			} else {
				if(tokenData.userType === USER_TYPE.ASSISTANT){
					io.to(`${params.chatId}`).emit(`${SOCKET.LISTNER_TYPE.SOCKET_SERVICE.ONE_TO_ONE_CHAT}`, {
						eventType: SOCKET.LISTNER_TYPE.SOCKET_SERVICE.ONE_TO_ONE_CHAT,
						data: message
					});
				}
				else{
					io.to(`${params.chatId}`).emit(`${params.chatId}`, {
						eventType: SOCKET.LISTNER_TYPE.SOCKET_SERVICE.ONE_TO_ONE_CHAT,
						data: message
					});
				}
				
					this.inboxChat(io, socket, PAGINATION_DEFAULT, ack, { userId: tokenData.userId });
					this.refreshChatBox(io, socket, params, ack, { userId: tokenData.userId });
				
				let IsNotificationMuted = await this.checkforChatNotification(params.contactUserId, params.chatId);
				// const contactUserIdSocket = io.sockets.sockets.get(socket_user);
				const contactUserIdSocket = socket_user ? socket.broadcast.to(socket_user) : undefined;
				const sender = await userDaoV1.findUserById(params.senderId);
				let notification_message = messageTypeInChat(params.messageType) != MESSAGE_TYPE.TEXT ? messageTypeInChat(params.messageType) : data.translatedMessages[`${contactUserId.languageCode}`] ? data.translatedMessages[`${contactUserId.languageCode}`] : params.message;
				console.log('***************************notification_message***************************', notification_message)
				if (contactUserIdSocket) {
						if (socket_user) {
							let roomParams = {
								chatId: params.chatId,
								socketId: socket_user
							};
							let IsNotification = await this.checkUserRoomInSocket(io, roomParams);
							if (!IsNotification) //TODO:notification service 
							{
								let notificationData: ChatRequest.CHAT_NOTIFICATION = {
									type: NOTIFICATION_TYPE.CHAT_NOTIFICATION,
									title: sender?.name,
									message: data.translatedMessages[`${contactUserId.languageCode}`] ? data.translatedMessages[`${contactUserId.languageCode}`] : params.message,
									body: data.translatedMessages[`${contactUserId.languageCode}`] ? data.translatedMessages[`${contactUserId.languageCode}`] : params.message,
									details: {
										chatId: params.chatId,
										senderId: params.senderId,
										receiverId: params.contactUserId,
										receiverIdName: contactUserId?.name,
										messageType: params.messageType,
										profilePicture: sender?.profilePicture,
										countryCode: sender.countryCode,
										mobileNo: sender.mobileNo,
										fullMobileNo: sender?.fullMobileNo,
										type: CHAT_TYPE.ONE_TO_ONE,
										senderName: sender?.name,
										flagCode: sender?.flagCode,
										membersDetails: message.membersDetails ? message.membersDetails : {}
									}
								}
								console.log('***********notificationData*************', notificationData)
								// if (!IsNotificationMuted) await this.sendChatNotification(contactUserIdSocket, notificationData);
							}
						}
						this.inboxChat(io, contactUserIdSocket, PAGINATION_DEFAULT, ack, { userId: params.contactUserId });
						this.refreshChatBox(io, contactUserIdSocket, params, ack, { userId: params.contactUserId });
					
				} else {
					let notificationDataDetails: ChatRequest.CHAT_NOTIFICATION = {
						type: NOTIFICATION_TYPE.CHAT_NOTIFICATION,
						title: sender?.name,
						message: notification_message,
						body: notification_message,
						details: {
							chatId: params.chatId,
							senderId: params.senderId,
							receiverId: params.contactUserId,
							receiverIdName: contactUserId?.name,
							messageType: params.messageType,
							profilePicture: sender?.profilePicture,
							countryCode: sender?.countryCode,
							mobileNo: sender.mobileNo,
							fullMobileNo: sender?.fullMobileNo,
							type: CHAT_TYPE.ONE_TO_ONE,
							senderName: sender?.name,
							flagCode: sender?.flagCode,
							membersDetails: message.membersDetails ? message.membersDetails : {}
						}
					}
					// let contact = await contactDaoV1.findOne("contacts", { userId: notificationDataDetails.details.receiverId, contactUserId: notificationDataDetails.details.senderId }, { name: 1 });
					// notificationDataDetails.title = contact?.name || notificationDataDetails.details.fullMobileNo;
					// notificationDataDetails.details.senderName = contact?.name || notificationDataDetails.details.fullMobileNo;
					// consolelog(`************Push notification details****************`, notificationDataDetails, true);
					// console.log("IsNotificationMutedIsNotificationMutedIsNotificationMutedIsNotificationMuted", IsNotificationMuted);
				}
			}
			return true;
		} catch (error) {
			const errorMessage = error?.message || "Internal server error"
			ack(MESSAGES.ERROR.CHAT_MESSAGE_ERROR(errorMessage, params.chatId, 500))
			throw error;
		}
	}

	// /**
	//  * @function forwardMessage
	//  * forward message to users
	//  */
	// async forwardMessage(io: any, socket: any, params: ChatRequest.FORWARD, ack: any, tokenData: TokenData) {
	// 	try {
	// 		if (!params.contactUserId || !params.messageType || !params.senderId || !params.localMessageId) {
	// 			ack(MESSAGES.ERROR.PARAMS_MISSING)
	// 			return
	// 		}
	// 		if (params.messageType == MESSAGE_TYPE.TEXT && !params.message) {
	// 			ack(MESSAGES.ERROR.PARAMS_MISSING)
	// 			return
	// 		}
	// 		const contactUserId = await userDaoV1.findUserById(params.contactUserId);
	// 		if (!contactUserId) {
	// 			ack(MESSAGES.ERROR.USER_NOT_FOUND)
	// 		}
	// 		const isBlocked = await this.checkUserBlockedStatus(params.contactUserId, tokenData.userId)
	// 		let members = [], isDelivered = [], deletedBy = [], isRead = [], blockedMessage = false;
	// 		members.push(tokenData.userId, params.contactUserId);
	// 		let isExist = await chatDaoV1.isChatExists(members);
	// 		if (!isExist) {
	// 			const data: any = {
	// 				members: members
	// 			}
	// 			isExist = await chatDaoV1.save("chats", data)
	// 		}
	// 		const socket_user = await redisClient.getValue(SERVER.APP_NAME + "_" + (params.contactUserId).toString() + REDIS_KEY_PREFIX.SOCKET_ID);
	// 		if (isBlocked) {
	// 			blockedMessage = true
	// 			deletedBy.push(toObjectId(params.contactUserId))
	// 		} else if (socket_user) {
	// 			if (!isBlocked) {
	// 				isDelivered.push(params.contactUserId);
	// 			}
	// 			const scoketIds = await io.in(socket_user).fetchSockets();
	// 			for (const socket of scoketIds) {
	// 				if (socket?.rooms?.has(`${isExist._id}`)) isRead.push(params.contactUserId);
	// 			}
	// 		}
	// 		isRead.push(params.senderId);
	// 		isDelivered.push(params.senderId);
	// 		let data: any = {
	// 			_id: params.localMessageId,
	// 			type: CHAT_TYPE.ONE_TO_ONE,
	// 			senderId: params.senderId,
	// 			members: members,
	// 			chatId: isExist._id,
	// 			message: params.message,
	// 			mediaUrl: params.mediaUrl,
	// 			messageType: params.messageType,
	// 			isRead: isRead,
	// 			isDelivered: isDelivered,
	// 			thumbnailUrl: params.thumbnailUrl ? params.thumbnailUrl : null,
	// 			location: params.location,
	// 			size: params.size ? params.size : null,
	// 			transcribe: params.transcribe ? params.transcribe : null,
	// 			status: params.status,
	// 			deletedBy: deletedBy,
	// 			blockedMessage: blockedMessage,
	// 			imageRatio: params.imageRatio,
	// 			localUrl: params.localUrl
	// 		}
	// 		const message = await baseDao.save(this.modelMessage, data);
	// 		const Chat = await baseDao.findOneAndUpdate(this.modelChat, {
	// 			_id: isExist._id
	// 		}, {
	// 			lastMsgId: message._id,
	// 			lastMsgCreated: Date.now(),
	// 			deletedBy: []
	// 		}, { new: true });
	// 		const membersDetails = await userDaoV1.find("users", { _id: { $in: members } }, { profilePicture: 1, _id: 1, countryCode: 1, mobileNo: 1, language: 1, status: 1, name: 1, flagCode: 1 });
	// 		message.membersDetails = membersDetails;
	// 		ack(message);
	// 		if (isBlocked) {
	// 			socket.emit(`${isExist._id}`, {
	// 				eventType: SOCKET.LISTNER_TYPE.SOCKET_SERVICE.ONE_TO_ONE_CHAT,
	// 				data: message
	// 			});
	// 				this.inboxChat(io, socket, PAGINATION_DEFAULT, ack, { userId: tokenData.userId });
	// 				this.refreshChatBox(io,socket,{chatId:isExist._id},ack,{userId: tokenData.userId});
	// 		} else {
	// 			io.to(`${isExist._id}`).emit(`${isExist._id}`, {
	// 				eventType: SOCKET.LISTNER_TYPE.SOCKET_SERVICE.ONE_TO_ONE_CHAT,
	// 				data: message
	// 			});
	// 				this.inboxChat(io, socket, PAGINATION_DEFAULT, ack, { userId: tokenData.userId });
	// 				this.refreshChatBox(io,socket,{chatId:isExist._id},ack,{userId: tokenData.userId});
	// 			let IsNotificationMuted = await this.checkforChatNotification(params.contactUserId, isExist._id);
	// 			const contactUserIdSocket = socket_user ? socket.broadcast.to(socket_user) : undefined;//io.sockets.sockets.get(socket_user);
	// 			const sender = await userDaoV1.findUserById(params.senderId);
	// 			let notification_message = messageTypeInChat(params.messageType) != MESSAGE_TYPE.TEXT ? messageTypeInChat(params.messageType) : data.translatedMessages[`${contactUserId.languageCode}`] ? data.translatedMessages[`${contactUserId.languageCode}`] : params.message;
	// 			console.log('***************************notification_message***************************', notification_message)
	// 			if (contactUserIdSocket) {
	// 					//online notification
	// 					if (socket_user) {
	// 						let roomParams = {
	// 							chatId: isExist._id,
	// 							socketId: socket_user
	// 						};
	// 						let IsNotification = await this.checkUserRoomInSocket(io, roomParams);
	// 						if (!IsNotification) //TODO:notification service 
	// 						{
	// 							let notificationData: ChatRequest.CHAT_NOTIFICATION = {
	// 								type: NOTIFICATION_TYPE.CHAT_NOTIFICATION,
	// 								title: sender?.name,
	// 								message: data.translatedMessages[`${contactUserId.languageCode}`] ? data.translatedMessages[`${contactUserId.languageCode}`] : params.message,
	// 								body: data.translatedMessages[`${contactUserId.languageCode}`] ? data.translatedMessages[`${contactUserId.languageCode}`] : params.message,
	// 								details: {
	// 									chatId: isExist._id,
	// 									senderId: params.senderId,
	// 									receiverId: params.contactUserId,
	// 									receiverIdName: contactUserId?.name,
	// 									messageType: params.messageType,
	// 									profilePicture: sender?.profilePicture,
	// 									countryCode: sender.countryCode,
	// 									mobileNo: sender.mobileNo,
	// 									fullMobileNo: sender?.fullMobileNo,
	// 									type: CHAT_TYPE.ONE_TO_ONE,
	// 									senderName: sender?.name,
	// 									flagCode: sender?.flagCode,
	// 									membersDetails: message.membersDetails ? message.membersDetails : {}
	// 								}
	// 							}
	// 							console.log('***********notificationData*************', notificationData)
	// 							// if (!IsNotificationMuted) await this.sendChatNotification(contactUserIdSocket, notificationData);
	// 						}
	// 					}
	// 					this.inboxChat(io, contactUserIdSocket, PAGINATION_DEFAULT, ack, { userId: params.contactUserId });
	// 					this.refreshChatBox(io,contactUserIdSocket,{chatId:isExist._id},ack,{userId: params.contactUserId});
	// 			} else {
	// 				let notificationDataDetails: ChatRequest.CHAT_NOTIFICATION = {
	// 					type: NOTIFICATION_TYPE.CHAT_NOTIFICATION,
	// 					title: sender?.name,
	// 					message: notification_message,
	// 					body: notification_message,
	// 					details: {
	// 						chatId: isExist._id,
	// 						senderId: params.senderId,
	// 						receiverId: params.contactUserId,
	// 						receiverIdName: contactUserId?.name,
	// 						messageType: params.messageType,
	// 						profilePicture: sender?.profilePicture,
	// 						countryCode: sender.countryCode,
	// 						mobileNo: sender.mobileNo,
	// 						fullMobileNo: sender?.fullMobileNo,
	// 						type: CHAT_TYPE.ONE_TO_ONE,
	// 						senderName: sender?.name,
	// 						flagCode: sender?.flagCode,
	// 						membersDetails: message.membersDetails ? message.membersDetails : {}
	// 					}
	// 				}
	// 				// let contact = await contactDaoV1.findOne("contacts", { userId: notificationDataDetails.details.receiverId, contactUserId: notificationDataDetails.details.senderId }, { name: 1 });
	// 				// notificationDataDetails.title = contact?.name || notificationDataDetails.details.fullMobileNo;
	// 				// notificationDataDetails.details.senderName = contact?.name || notificationDataDetails.details.fullMobileNo;
	// 				// consolelog(`************Push notification details****************`, notificationDataDetails, true);
	// 				// const isSubscribedUser = await this.checkUserSubscription(notificationDataDetails.details.receiverId);
	// 				// if (isSubscribedUser.isSubscribed || isSubscribedUser?.expiryTime < Date.now()) {
	// 				// 	if (!IsNotificationMuted) await sendNotification(notificationDataDetails, socket.accessToken);
	// 				// }
	// 			}
	// 		}
	// 		return true;
	// 	} catch (error) {
	// 		throw error;
	// 	}
	// }
	/**
	 

 * @function checkUserRoomInSocket
 * check user is present in a room or not
 * 
 */
	async checkUserRoomInSocket(io: any, params) {
		try {
			const scoketIds = await io.in(params.socketId).fetchSockets();
			for (const socket of scoketIds) {
				consolelog(`*********[checkUserRoomInSocket] params in room true************`, params, true);
				if (socket?.rooms?.has(`${params.chatId}`)) return true;
			}
			return false
		} catch (error) {

		}
	}

	/**
	* @function messageModelDataMapping
	* map "message" model data for saving in schema
	*/

	async messageModelDataMapping(params, details) {
		try {
			let data: any = {
				_id: params.localMessageId,
				type: CHAT_TYPE.ONE_TO_ONE,
				senderId: params.senderId,
				members: details.members,
				chatId: params.chatId,
				message: params.message,
				mediaUrl: params.mediaUrl,
				messageType: params.messageType,
				isRead: details.isRead,
				isDelivered: details.isDelivered,
				thumbnailUrl: params.thumbnailUrl ? params.thumbnailUrl : null,
				location: params.location,
				size: params.size ? params.size : null,
				transcribe: params.transcribe ? params.transcribe : null,
				status: params.status,
				deletedBy: details.deletedBy
			}
			return data
		} catch (error) {
			throw error
		}
	}

	/**
	 * @function RepliedToMessage
	 * replied to a message in a current room
	 */
	async RepliedToMessage(io: any, socket: any, params: ChatRequest.REPLIED, ack: any, tokenData: TokenData) {
		try {
			if (!params.messageId || !params.chatId || !params.contactUserId || !params.messageType || !params.senderId || !params.localMessageId) {
				ack(MESSAGES.ERROR.PARAMS_MISSING)
				return
			}
			const messageId = await baseDao.find(this.modelMessage, { _id: params.messageId }, {});
			if (!messageId) {
				ack(MESSAGES.ERROR.MESSAGE_NOT_FOUND)
			}
			const contactUserId = await userDaoV1.findUserById(params.contactUserId);
			if (!contactUserId) {
				ack(MESSAGES.ERROR.USER_NOT_FOUND)
			}
			let isOnline = false;
			let deletedBy = [], isDelivered = [], isRead = [], members = [], blockedMessage = false;
			const isBlocked = await this.checkUserBlockedStatus(params.contactUserId, tokenData.userId)
			// const isBlocked = await userDaoV1.findOne("users", { _id: params.contactUserId, blocked: { $in: [toObjectId(tokenData.userId)] } });
			const socket_user = await redisClient.getValue(SERVER.APP_NAME + "_" + (params.contactUserId).toString() + REDIS_KEY_PREFIX.SOCKET_ID);
			if (isBlocked) {
				deletedBy.push(toObjectId(params.contactUserId));
				blockedMessage = true
			} else if (socket_user) {
				isOnline = true;
				if (!isBlocked) {
					isDelivered.push(params.contactUserId);
				}
				const scoketIds = await io.in(socket_user).fetchSockets();
				for (const socket of scoketIds) {
					if (socket?.rooms?.has(`${params.chatId}`)) isRead.push(params.contactUserId);
				}
			}
			isRead.push(params.senderId);
			isDelivered.push(params.senderId);
			members.push(tokenData.userId, params.contactUserId);
			let data: any = {
				_id: params.localMessageId,
				type: CHAT_TYPE.ONE_TO_ONE,
				senderId: params.senderId,
				members: members,
				chatId: params.chatId,
				message: params.message,
				mediaUrl: params.mediaUrl,
				messageType: params.messageType,
				isRead: isRead,
				isDelivered: isDelivered,
				thumbnailUrl: params.thumbnailUrl ? params.thumbnailUrl : null,
				location: params.location,
				size: params.size ? params.size : null,
				transcribe: params.transcribe ? params.transcribe : null,
				status: params.status,
				deletedBy: deletedBy,
				messageId: messageId[0]._id,
				blockedMessage: blockedMessage,
				imageRatio: params.imageRatio,
				localUrl: params.localUrl
			}
			let translatedInfo: any = {}
			const message = await baseDao.save(this.modelMessage, data);
			await baseDao.findOneAndUpdate(this.modelChat, {
				_id: params.chatId
			}, {
				lastMsgId: message._id,
				lastMsgCreated: Date.now(),
				deletedBy: []
			}, { new: true });
			const membersDetails = await userDaoV1.find("users", { _id: { $in: members } }, { profilePicture: 1, _id: 1, countryCode: 1, mobileNo: 1, language: 1, status: 1, name: 1, flagCode: 1 });
			message.membersDetails = membersDetails;
			message.messageIdDetails = messageId;
			ack(message);
			if (isBlocked) {
				socket.emit(`${params.chatId}`, {
					eventType: SOCKET.LISTNER_TYPE.MESSAGE.REPLIED,
					data: message
				});
					this.inboxChat(io, socket, PAGINATION_DEFAULT, ack, { userId: tokenData.userId });
					this.refreshChatBox(io, socket, params, ack, { userId: tokenData.userId });
				
			} else {
				io.to(`${params.chatId}`).emit(`${params.chatId}`, {
					eventType: SOCKET.LISTNER_TYPE.MESSAGE.REPLIED,
					data: message
				});
				this.inboxChat(io, socket, PAGINATION_DEFAULT, ack, { userId: tokenData.userId });
				this.refreshChatBox(io, socket, params, ack, { userId: tokenData.userId });
				let IsNotificationMuted = await this.checkforChatNotification(params.contactUserId, params.chatId);
				const contactUserIdSocket = socket_user ? socket.broadcast.to(socket_user) : undefined;// io.sockets.sockets.get(socket_user);
				const sender = await userDaoV1.findUserById(params.senderId);
				let notification_message = messageTypeInChat(params.messageType) != MESSAGE_TYPE.TEXT ? messageTypeInChat(params.messageType) : data.translatedMessages[`${contactUserId.languageCode}`] ? data.translatedMessages[`${contactUserId.languageCode}`] : params.message;
				console.log('***************************notification_message***************************', notification_message)
				if (contactUserIdSocket) {
						if (socket_user) {
							let roomParams = {
								chatId: params.chatId,
								socketId: socket_user
							};
							let IsNotification = await this.checkUserRoomInSocket(io, roomParams);
							if (!IsNotification) //TODO:notification service
							{
								let notificationData: ChatRequest.CHAT_NOTIFICATION = {
									type: NOTIFICATION_TYPE.CHAT_NOTIFICATION,
									title: sender?.name,
									message: data.translatedMessages[`${contactUserId.languageCode}`] ? data.translatedMessages[`${contactUserId.languageCode}`] : params.message,
									body: data.translatedMessages[`${contactUserId.languageCode}`] ? data.translatedMessages[`${contactUserId.languageCode}`] : params.message,
									details: {
										chatId: params.chatId,
										senderId: params.senderId,
										receiverId: params.contactUserId,
										receiverIdName: contactUserId?.name,
										messageType: params.messageType,
										profilePicture: sender?.profilePicture,
										countryCode: sender.countryCode,
										mobileNo: sender.mobileNo,
										fullMobileNo: sender?.fullMobileNo,
										type: CHAT_TYPE.ONE_TO_ONE,
										senderName: sender?.name,
										flagCode: sender?.flagCode,
										membersDetails: message.membersDetails ? message.membersDetails : {}
									}
								}
								console.log('***********notificationData*************', notificationData)
								// if (!IsNotificationMuted) await this.sendChatNotification(contactUserIdSocket, notificationData);
							}
						}
						this.inboxChat(io, contactUserIdSocket, PAGINATION_DEFAULT, ack, { userId: params.contactUserId });
						this.refreshChatBox(io, contactUserIdSocket, params, ack, { userId: params.contactUserId });
				} else {
					let notificationDataDetails: ChatRequest.CHAT_NOTIFICATION = {
						type: NOTIFICATION_TYPE.CHAT_NOTIFICATION,
						title: sender?.name,
						message: notification_message,
						body: notification_message,
						details: {
							chatId: params.chatId,
							senderId: params.senderId,
							receiverId: params.contactUserId,
							receiverIdName: contactUserId?.name,
							messageType: params.messageType,
							profilePicture: sender?.profilePicture,
							countryCode: sender?.countryCode,
							mobileNo: sender?.mobileNo,
							fullMobileNo: sender?.fullMobileNo,
							type: CHAT_TYPE.ONE_TO_ONE,
							senderName: sender?.name,
							flagCode: sender?.flagCode,
							membersDetails: message.membersDetails ? message.membersDetails : {}
						}
					}

					// let contact = await contactDaoV1.findOne("contacts", { userId: notificationDataDetails.details.receiverId, contactUserId: notificationDataDetails.details.senderId }, { name: 1 });
					// notificationDataDetails.title = contact?.name || notificationDataDetails.details.fullMobileNo;
					// notificationDataDetails.details.senderName = contact?.name || notificationDataDetails.details.fullMobileNo;
					// consolelog(`************Push notification details****************`, notificationDataDetails, true);
					// const isSubscribedUser = await this.checkUserSubscription(notificationDataDetails.details.receiverId);
					// if (isSubscribedUser.isSubscribed || isSubscribedUser?.expiryTime < Date.now()) {
					// 	if (!IsNotificationMuted) await sendNotification(notificationDataDetails, socket.accessToken);
					// }
				}
			}
			return true;
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @function leftRoom
	 * remove a user from existing room when he left a particular chat
	*/
	async leftRoom(io: any, socket: any, params: ChatRequest.REPLIED, ack: any, tokenData: TokenData) {
		try {
			if (!params.chatId) {
				ack(MESSAGES.ERROR.PARAMS_MISSING)
				return
			}
			const chatId = await baseDao.findOne(this.modelChat, { _id: params.chatId });
			if (!chatId) {
				ack(MESSAGES.ERROR.CHAT_NOT_FOUND)
			}
			socket.leave(`${params.chatId}`);
			ack(chatId);
			return true;
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @function chatList
	 */
	async chatList(params: ListingRequest, tokenData: TokenData) {
		try {
			const userId = tokenData.userId;
			const data = await chatDaoV1.chatList(params, userId);
			return MESSAGES.SUCCESS.LIST({ data });
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @function refreshCuurentInboxChat
	 * refresh current background chat box list when someone message 
	*/
	async refreshChatBox(io: any, socket: any, params: ChatRequest.chatBox, ack: any, tokenData: TokenData, accessData: boolean = false) {
		try {
			consolelog(`${tokenData.userId} refreshChatBox emit timer`, Date.now(), true);
			const userId = tokenData.userId;
			const data: any = await chatDaoV1.chatBox(params, userId,);
			const unread_messages = await baseDao.aggregate(this.modelMessage, [{
				$match: {
					chatId: toObjectId(params.chatId), members: toObjectId(tokenData.userId), "isRead": { $nin: [toObjectId(tokenData.userId)] }, deletedBy: { $nin: [toObjectId(userId)] }
				}
			}, {
				$group: {
					_id: "$chatId",
					countId: { $sum: 1 }
				}
			}]);
			if (data) {
				delete data.pageNo; delete data.totalPage; delete data.total;
			}
			const blockedMembers = await userDaoV1.findOne("users", { _id: tokenData.userId });
			const members = await chatDaoV1.distinct("chats", "overallMembers", { members: tokenData.userId, _id: params.chatId });
			// const contacts = await contactDaoV1.find("contacts", { userId: tokenData.userId, contactUserId: { $in: members } }, { contactUserId: 1, name: 1 });
			if (unread_messages?.length && data.data?.length) {
				data.data.forEach((list: any) => {
					unread_messages.forEach((unread: any) => {
						if (list._id.toString() === unread._id.toString()) {
							list.unread_messages = unread.countId;
						}
					})
				})
			}
			if (data.data?.length) {
				for (const element of data.data) {
					for (const user of element.users) {
						if (blockedMembers?.blocked.length) {
							for (let block of blockedMembers.blocked) {
								if (block.toString() == user._id.toString()) {
									user.status = STATUS.BLOCKED
								}
							}
						}
					}
					for (const user of element.overAllMembersDetails) {
						if (blockedMembers?.blocked.length) {
							for (let block of blockedMembers.blocked) {
								if (block.toString() == user._id.toString()) {
									user.status = STATUS.BLOCKED
								}
							}
						}
					}
				}
			}

			data.status = STATUS.ACTIVE //chat status for not archived
			data.chat_type = STATUS.ACTIVE
			const notify_read = await baseDao.updateMany(this.modelMessage, { members: toObjectId(tokenData.userId), deletedBy: { $nin: [toObjectId(tokenData.userId)] }, isDelivered: { $nin: [toObjectId(tokenData.userId)] } }, { $addToSet: { isDelivered: toObjectId(tokenData.userId) } }, {});
			if (notify_read?.modifiedCount > 0) {
				socket.broadcast.emit(SOCKET.LISTNER_TYPE.MESSAGE.READ, {
					userId: tokenData.userId
				})
			}
			socket.emit(SOCKET.LISTNER_TYPE.CHAT.REFRESH.INBOX_CHAT, MESSAGES.SUCCESS.LIST(data));
			consolelog(`${tokenData.userId} refreshChatBox delivered timer`, Date.now(), true);
			return
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @function inboxChat
	 * get chat listing in home section for current users who he has chatted so far
	*/
	async inboxChat(io: any, socket: any, params: any, ack: any, tokenData: TokenData, accessData: boolean = false) {
		try {
			consolelog(`${tokenData.userId} inboxChat emit timer`, Date.now(), true);
			if (!params.type ) {
				ack(MESSAGES.ERROR.PARAMS_MISSING)
				return
			}
			params.pageNo = PAGINATION_DEFAULT.pageNo;
			params.limit = params.limit ? params.limit : PAGINATION_DEFAULT.limit;
			const userId = tokenData.userId;
			const data: any = await chatDaoV1.chatList(params, userId,);
			const unread_messages = await baseDao.aggregate(this.modelMessage, [{
				$match: {
					members: toObjectId(tokenData.userId), "isRead": { $nin: [toObjectId(tokenData.userId)] }, deletedBy: { $nin: [toObjectId(userId)] }
				}
			}, {
				$group: {
					_id: "$chatId",
					countId: { $sum: 1 }
				}
			}]);
			let members;
			if(params.type == CHAT_TYPE.GROUP){
				members = await chatDaoV1.distinct("chats", "overallMembers", { members: tokenData.userId });
			}
			// const contacts= await contactDaoV1.find("contacts", { userId: tokenData.userId, contactUserId: {$in:members} }, { contactUserId:1,name: 1 });
			if (unread_messages?.length && data.data?.length) {
				data.data.forEach((list: any) => {
					unread_messages.forEach((unread: any) => {
						if (list._id.toString() === unread._id.toString()) {
							list.unread_messages = unread.countId;
						}
					})
				})
			}
			data.status = params.status || STATUS.ACTIVE //chat status archived
			data.chat_type = params.type || STATUS.ACTIVE //chat broadcast case
			const notify_read = await baseDao.updateMany(this.modelMessage, { members: toObjectId(tokenData.userId), deletedBy: { $nin: [toObjectId(tokenData.userId)] }, isDelivered: { $nin: [toObjectId(tokenData.userId)] } }, { $addToSet: { isDelivered: toObjectId(tokenData.userId) } }, {});
			if (notify_read?.modifiedCount > 0) {
				socket.broadcast.emit(SOCKET.LISTNER_TYPE.MESSAGE.READ, {
					userId: tokenData.userId
				})
			}
			socket.emit(SOCKET.LISTNER_TYPE.CHAT.LISTING, MESSAGES.SUCCESS.LIST(data));
			consolelog(`${tokenData.userId} inboxChat delivered timer`, Date.now(), true);
			if (accessData) {
				return
			}
			return ack(MESSAGES.SUCCESS.LIST(data))
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @function updateDeliveredStatus
	 * update delivered message status when user comes online to other users
	*/
	async updateDeliveredStatus(socket: any, userId: string) {
		try {
			const notify_read = await baseDao.updateMany(this.modelMessage, { members: { $in: [toObjectId(userId)] }, deletedBy: { $nin: [toObjectId(userId)] }, isDelivered: { $nin: [toObjectId(userId)] } }, { $addToSet: { isDelivered: toObjectId(userId) } }, {});
			// const notify_read_broadcast=await baseDao.updateMany("broadcast_messages", {members: {$in:[toObjectId(userId)]},deletedBy: { $nin: [toObjectId(userId)] }, isDelivered: { $nin: [toObjectId(userId)] } }, { $addToSet: { isDelivered: toObjectId(userId) } }, {});
			console.log('notify_read userId', notify_read, userId)
			if (notify_read?.nModified > 0) {
				socket.broadcast.emit(SOCKET.LISTNER_TYPE.MESSAGE.READ, {
					userId: userId
				})
			}
			socket.broadcast.emit(SOCKET.LISTNER_TYPE.MESSAGE.READ, {
				userId: userId
			})
			return
		} catch (error) {
			throw error
		}
	}

	/**
	 * @function liveTracking
	 * send live texting and audio recording events to user whom is chatting
	*/
	async liveTracking(io: any, socket: any, params: ChatRequest.Tracking, ack: any, tokenData: TokenData) {
		try {
			if (!params.chatId) {
				ack(MESSAGES.ERROR.PARAMS_MISSING)
				return
			}
			if (!params.isText) params.isText = false;
			const isChatExist = await chatDaoV1.findChatById(params.chatId);
			if (!isChatExist) {
				ack(MESSAGES.ERROR.CHAT_NOT_FOUND)
				return
			}
			const user = await userDaoV1.findUserById(tokenData.userId, { profilePicture: 1, name: 1, mobileNo: 1, countryCode: 1, about: 1, status: 1, flagCode: 1 })
			let contactUserId: string;
			if (isChatExist.members?.length) {
				isChatExist.members.forEach((id) => {
					if (id.toString() !== tokenData.userId.toString()) contactUserId = id;
				})
			}
			consolelog('__live_tracking contactUserId', contactUserId, false);
			const socket_user = await redisClient.getValue(SERVER.APP_NAME + "_" + (contactUserId).toString() + REDIS_KEY_PREFIX.SOCKET_ID);
			consolelog('__live_tracking contactUserId in cache', contactUserId, false);
			const contactUserIdSocket = socket_user ? socket.broadcast.to(socket_user) : undefined;//io.sockets.sockets.get(socket_user);
			consolelog('__live_tracking contactUserId in scoket adapter', contactUserId, false);
			if (contactUserIdSocket) contactUserIdSocket.emit(SOCKET.LISTNER_TYPE.CHAT.TRACKING, {
				chatId: params.chatId,
				isText: params.isText,
				user: user
			});
			return
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @function blockedUser
	 * block a user and update blocked list of existing users
	*/
	async blockedUser(io: any, socket: any, params: ChatRequest.Blocked, ack: any, tokenData: TokenData) {
		try {
			if (!params.contactUserId) {
				ack(MESSAGES.ERROR.PARAMS_MISSING)
				return
			}
			const step1 = await userDaoV1.findUserById(params.contactUserId)
			if (!step1) {
				ack(MESSAGES.ERROR.USER_NOT_FOUND)
				return
			}
			let user;
			if (params.blocked) {
				user = await userDaoV1.findByIdAndUpdate("users", tokenData.userId, { $addToSet: { blocked: toObjectId(params.contactUserId) } }, { new: true })
				await redisClient.storeValue(SERVER.APP_NAME + "_" + tokenData.userId + "_" + params.contactUserId + REDIS_KEY_PREFIX.BLOCKED, Date.now());
			} else {
				user = await userDaoV1.findByIdAndUpdate("users", tokenData.userId, { $pull: { blocked: toObjectId(params.contactUserId) } }, { new: true })
				await redisClient.deleteKey(SERVER.APP_NAME + "_" + tokenData.userId + "_" + params.contactUserId + REDIS_KEY_PREFIX.BLOCKED);
			}
			ack(MESSAGES.SUCCESS.DETAILS(user));
			let members = [];
			members.push(tokenData.userId, params.contactUserId);
			const isExist = await chatDaoV1.isChatExists(members);
			if (params.blocked) {
				if (isExist) await chatDaoV1.findByIdAndUpdate(this.modelChat, isExist._id, { lastBlockedMsgId: isExist.lastMsgId }, {})
			}
			let listing = {}
				this.inboxChat(io, socket, listing, ack, { userId: tokenData.userId });
				this.refreshChatBox(io,socket,{chatId: isExist._id},ack,{userId: tokenData.userId});
			
			let oneToOneData = await this.chatFormation(io, socket, {
				contactUserId: params.contactUserId,
				accessData: true
			}, ack, tokenData);
			socket.emit(`${isExist._id}`, {
				eventType: SOCKET.LISTNER.ONE_TO_ONE,
				oneToOneData: oneToOneData
			});
			const socket_user = await redisClient.getValue(SERVER.APP_NAME + "_" + params.contactUserId + REDIS_KEY_PREFIX.SOCKET_ID);
			if (socket_user) {
				const contactUserIdSocket = socket_user ? socket.broadcast.to(socket_user) : undefined;//io.sockets.sockets.get(socket_user);
				const contactUserId = await userDaoV1.findUserById(tokenData.userId);
				const isBlocked = await this.checkUserBlockedStatus(params.contactUserId, tokenData.userId)
				const isReceiverBlocked = await this.checkUserBlockedStatus(tokenData.userId, params.contactUserId);
				let oneToOneDataDetails = {
					chatId: isExist._id,
					isBlocked: isBlocked ? true : false,
					lastSeen: contactUserId?.lastSeen || 0,
					countryCode: contactUserId?.countryCode,
					mobileNo: contactUserId?.mobileNo,
					language: contactUserId?.language,
					profilePicture: contactUserId?.profilePicture,
					flagCode: contactUserId?.flagCode,
					name: contactUserId?.name,
					isReceiverBlocked: isReceiverBlocked ? true : false,
					isOnline: false
				}
				contactUserIdSocket.emit(`${isExist._id}`, {
					eventType: SOCKET.LISTNER.ONE_TO_ONE,
					oneToOneData: oneToOneDataDetails
				});
			}
			return
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @function checkUserOnlineStatus
	 * check for a user if its online or not
	*/
	async checkUserOnlineStatus(userId: string) {
		try {
			const socket_user = await redisClient.getValue(SERVER.APP_NAME + "_" + userId + REDIS_KEY_PREFIX.SOCKET_ID);
			return socket_user
		} catch (error) {
			throw error;
		}
	}

	/**
 * @function checkUserOfflineOverallStatus
 * check for a user if its offline privacy on or not if yes both user will get offline status
*/
	async checkUserOfflineOverallStatus(userId: string, contactUserId: string) {
		try {
			consolelog(`${userId} ******************checkUserOfflineOverallStatus****************`, contactUserId, true);
			let userOfflineStatus = await redisClient.getValue(SERVER.APP_NAME + "_" + userId + REDIS_KEY_PREFIX.OFFLINE);
			let contactUserIdOfflineStatus = await redisClient.getValue(SERVER.APP_NAME + "_" + contactUserId + REDIS_KEY_PREFIX.OFFLINE);
			if (userOfflineStatus || contactUserIdOfflineStatus) {
				return true;
			}
			return false;
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @function checkUserBlockedStatus
	 * check for a user if contact user is blocked or not
	*/
	async checkUserBlockedStatus(userId: string, contactUserId: string) {
		try {
			consolelog(`${userId} *****************checkUserBlockedStatus****************`, contactUserId, true);
			let blockedStatus = await redisClient.getValue(SERVER.APP_NAME + "_" + userId + "_" + contactUserId + REDIS_KEY_PREFIX.BLOCKED);
			if (blockedStatus) {
				return true;
			}
			return false;
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @function findSocketForUser
	 * find socket of a user if its present
	*/
	async findSocketForUser(io: any, socket_user: string) {
		try {
			const contactUserIdSocket = io.sockets.sockets.get(socket_user);
			return contactUserIdSocket
		} catch (error) {
			throw error;
		}
	}

	/**
 * @function sendSocketEvents
 * emit socket events to a user
*/
	async sendSocketEvents(socket: any, eventName: string, data: any) {
		try {
			return socket.emit(eventName, data);
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @function createGroup
	 * create a group for coming users in params
	 * created group user joined the room and default admin of group
	 * notify other members for group creation in chat list
	*/
	async createGroup(io: any, socket: any, params: ChatRequest.CREATE_GROUP, ack: any, tokenData: TokenData) {
		try {
			if (!params.contactUserIds) {
				ack(MESSAGES.ERROR.PARAMS_MISSING)
				return
			}
			let admins = [];
			admins.push(tokenData.userId);
			params.contactUserIds.push(tokenData.userId);
			let data: any = {
				type: CHAT_TYPE.GROUP,
				members: params.contactUserIds,
				overallMembers: params.contactUserIds,
				createdBy: tokenData.userId,
				name: params.name,
				description: params.description,
				groupProfilePicture: params.groupProfilePicture,
				admins: admins
			}
			let group = await chatDaoV1.save("chats", data);
			socket.join(`${group._id}`);
			/*save header msg */
			let details: any = {}, taggedUser = [];
			details.languageCode = LANGUAGE_CODE.EN;
			details.message = CHAT_HEADERS.GROUP.CREATE(tokenData.userId, params.name);
			taggedUser.push(tokenData.userId)
			let isRead = [], isDelivered = [];
			isRead.push(tokenData.userId);
			isDelivered.push(tokenData.userId);
			let save: any = {
				type: CHAT_TYPE.GROUP,
				senderId: tokenData.userId,
				members: group.members,
				chatId: group._id,
				message: details.message,
				mediaUrl: null,
				messageType: MESSAGE_TYPE.HEADING,
				isRead: isRead,
				isDelivered: isDelivered,
				thumbnailUrl: details.thumbnailUrl ? details.thumbnailUrl : null,
				location: null,
				size: details.size ? details.size : null,
				transcribe: details.transcribe ? details.transcribe : null,
				status: STATUS.ACTIVE,
				taggedUser: taggedUser,
			}
			let translatedInfo: any = {}

			const header_messages = await baseDao.save(this.modelMessage, save);
			/*end of saving header msg*/
			group = await baseDao.findOneAndUpdate(this.modelChat, {
				_id: group._id
			}, {
				lastMsgId: header_messages._id,
				lastMsgCreated: Date.now()
			}, { new: true });
			delete group.overallMembers;
			let membersDetails = await userDaoV1.find("users", { _id: { $in: group.members } }, { profilePicture: 1, _id: 1, countryCode: 1, mobileNo: 1, language: 1, status: 1, name: 1, flagCode: 1 });
			const assistantDetails = await userDaoV1.find("admins", { _id: { $in: group.members } }, { profilePicture: 1, _id: 1, countryCode: 1, mobileNo: 1, language: 1, status: 1, name: 1, flagCode: 1 });
			membersDetails = membersDetails.concat(assistantDetails);
			group.membersDetails = membersDetails;
			ack(MESSAGES.SUCCESS.DETAILS(group));
			this.inboxChat(io, socket, {}, ack, { userId: tokenData.userId });
			// this.refreshChatBox(io,socket,{chatId: group._id},ack,{userId: tokenData.userId});
			const sender = await userDaoV1.findUserById(tokenData.userId);
			let message = CHAT_HEADERS.GROUP.ADD_NOTIFY(tokenData.userId);
			for (let user of params.contactUserIds) {
				let IsNotificationMuted = await this.checkforChatNotification(user, group._id);
				const socket_user = await redisClient.getValue(SERVER.APP_NAME + "_" + user + REDIS_KEY_PREFIX.SOCKET_ID);
				if (socket_user) {
					const contactUserIdSocket = socket_user ? socket.broadcast.to(socket_user) : undefined;//io.sockets.sockets.get(socket_user);
					if (contactUserIdSocket) {
						if (user.toString() !== tokenData.userId.toString()) {
							// await this.triggerGroupNotification(true, params, socket_user, sender, user, io, group, save, socket, contactUserIdSocket, IsNotificationMuted)
						}
						this.inboxChat(io, contactUserIdSocket, PAGINATION_DEFAULT, ack, { userId: user });
						this.refreshChatBox(io,contactUserIdSocket,{chatId: group._id},ack,{userId: user});
					}
				} else {
					if (user.toString() !== tokenData.userId.toString()) {
						// await this.triggerGroupNotification(false, params, socket_user, sender, user, io, group, save, socket, {}, IsNotificationMuted)
					}
				}
			}
			return
		} catch (error) {
			throw error;
		}
	}


	// async triggerGroupNotification(online: boolean, params: any, socket_user: any, sender: any, user: any, io: any, group: any, data: any, socket: any, contactUserIdSocket: any, IsNotificationMuted: boolean) {
	// 	try {
	// 		if (online) {
	// 			let roomParams: ChatRequest.SOKCET_ROOM = {
	// 				chatId: group._id,
	// 				socketId: socket_user
	// 			};
	// 			let IsNotification = await this.checkUserRoomInSocket(io, roomParams);
	// 			if (!IsNotification) //TODO:notification service
	// 			{
	// 				let contact = await contactDaoV1.findOne("contacts", { userId: user, contactUserId: socket.userId }, { name: 1 });
	// 				let senderName = contact?.name || sender?.name;
	// 				const contactUserId = await userDaoV1.findUserById(user);
	// 				let notificationData: ChatRequest.CHAT_NOTIFICATION = {
	// 					type: NOTIFICATION_TYPE.CHAT_NOTIFICATION,
	// 					title: senderName,
	// 					subtitle: group?.name,
	// 					message: data.translatedMessages[`${contactUserId.languageCode}`] ? senderName + " " + data.translatedMessages[`${contactUserId.languageCode}`] : senderName + "" + params.message,
	// 					body: data.translatedMessages[`${contactUserId.languageCode}`] ? senderName + " " + data.translatedMessages[`${contactUserId.languageCode}`] : senderName + "" + params.message,
	// 					details: {
	// 						chatId: group._id,
	// 						senderId: socket.userId,
	// 						receiverId: user.toString(),
	// 						receiverIdName: contactUserId?.name,
	// 						messageType: MESSAGE_TYPE.TEXT,
	// 						profilePicture: group?.groupProfilePicture,
	// 						countryCode: sender.countryCode,
	// 						mobileNo: sender.mobileNo,
	// 						fullMobileNo: sender?.fullMobileNo,
	// 						type: CHAT_TYPE.GROUP,
	// 						senderName: group?.name,
	// 						flagCode: sender?.flagCode,
	// 						membersDetails: group.membersDetails ? group.membersDetails : {}
	// 					}
	// 				}
	// 				console.log('********** sendGroupMessage notificationData*************', notificationData);
	// 				if (!IsNotificationMuted) await this.sendSocketEvents(contactUserIdSocket, SOCKET.LISTNER_TYPE.NOTIFY.NOTIFICATION, notificationData)
	// 			}
	// 		} else {
	// 			// let contact = await contactDaoV1.findOne("contacts", { userId: user, contactUserId: socket.userId }, { name: 1 });
	// 			let senderName = contact?.name || sender?.fullMobileNo
	// 			const contactUserId = await userDaoV1.findUserById(user);
	// 			let notificationData: ChatRequest.CHAT_NOTIFICATION = {
	// 				type: NOTIFICATION_TYPE.CHAT_NOTIFICATION,
	// 				title: senderName,
	// 				subtitle: group?.name,
	// 				message: data.translatedMessages[`${contactUserId.languageCode}`] ? senderName + " " + data.translatedMessages[`${contactUserId.languageCode}`] : senderName + "" + params.message,
	// 				body: data.translatedMessages[`${contactUserId.languageCode}`] ? senderName + " " + data.translatedMessages[`${contactUserId.languageCode}`] : senderName + "" + params.message,
	// 				details: {
	// 					chatId: group?._id,
	// 					senderId: socket.userId,
	// 					receiverId: user.toString(),
	// 					receiverIdName: contactUserId?.name,
	// 					messageType: MESSAGE_TYPE.TEXT,
	// 					profilePicture: group?.groupProfilePicture,
	// 					countryCode: sender.countryCode,
	// 					mobileNo: sender.mobileNo,
	// 					fullMobileNo: sender?.fullMobileNo,
	// 					type: CHAT_TYPE.GROUP,
	// 					senderName: group?.name,
	// 					flagCode: sender?.flagCode,
	// 					membersDetails: group.membersDetails ? group.membersDetails : {}
	// 				}
	// 			}
	// 			console.log('********** sendGroupMessage push notificationData*************', notificationData);
	// 		}
	// 	} catch (error) {
	// 		throw error
	// 	}
	// }

	/**
	 * @function createGroup
	 * edit name, description, groupProfilePicture with groupId
	 * edit a group for new coming users in params
	*/
	async editGroup(io: any, socket: any, params: ChatRequest.EDIT_GROUP, ack: any, tokenData: TokenData) {
		try {
			if (!params.groupId) {
				return ack(MESSAGES.ERROR.PARAMS_MISSING)
			}
			let group, members = [];
			group = await chatDaoV1.findOne("chats", { _id: params.groupId, type: CHAT_TYPE.GROUP, deletedBy: { $nin: [tokenData.userId] } }, {});
			if (!group) return ack(MESSAGES.ERROR.GROUP_NOT_FOUND);
			let data = {
				name: params.name ? params.name : group.name,
				description: params.description ? params.description : group.description,
				groupProfilePicture: params.groupProfilePicture != "" ? params.groupProfilePicture : ""
			}
			if (params.name && params.name !== group.name) {
				await this.updateHeaderForGroup(io, params, group, tokenData, CHAT_MODE_TYPE.NAME, socket, ack)
			}
			if (params.description && params.description !== group.description) {
				await this.updateHeaderForGroup(io, params, group, tokenData, CHAT_MODE_TYPE.DESCRIPTION, socket, ack)
			}
			if (params.groupProfilePicture && params.groupProfilePicture !== group.groupProfilePicture) {
				await this.updateHeaderForGroup(io, params, group, tokenData, CHAT_MODE_TYPE.ICON, socket, ack)
			}
			if (params.groupProfilePicture == "" && params.groupProfilePicture !== group.groupProfilePicture) {
				await this.updateHeaderForGroup(io, params, group, tokenData, CHAT_MODE_TYPE.REMOVE_ICON, socket, ack)
			}
			group = await chatDaoV1.findOneAndUpdate("chats", { _id: params.groupId }, data, { new: true });
			if (params.contactUserIds?.length) {
				const isAdmin = await chatDaoV1.findOne("chats", { _id: params.groupId, admins: { $in: [tokenData.userId] } });
				if (!isAdmin) return ack(MESSAGES.ERROR.UNAUTHORIZE_ADMIN_MEMBERS);
				const updated_group_members = await chatDaoV1.findOneAndUpdate("chats", { _id: params.groupId }, { $addToSet: { members: params.contactUserIds, overallMembers: params.contactUserIds } }, { new: true });
				/* save header message */
				for (let i = 0; i < group.members.length; i++) {
					members.push(group.members[i].toString())
				}
				console.log('members', members)
				let addedMembers = diffBw2Arrays(params.contactUserIds, members);
				console.log('editGroup addedMembers list', addedMembers)
				let details: any = {}, taggedUser: any = [];
				details.languageCode = LANGUAGE_CODE.EN;
				taggedUser.push(...addedMembers, tokenData.userId);
				let contactUserIds = addedMembers.map(i => ' @' + i)
				console.log('********editGroup contactUserIds ********', contactUserIds);
				details.message = CHAT_HEADERS.GROUP.ADD(tokenData.userId, contactUserIds.join(" ,"));
				let isRead = [], isDelivered = [];
				isRead.push(tokenData.userId);
				isDelivered.push(tokenData.userId);
				let save: any = {
					type: CHAT_TYPE.GROUP,
					senderId: tokenData.userId,
					members: updated_group_members.members,
					chatId: group._id,
					message: details.message,
					mediaUrl: null,
					messageType: MESSAGE_TYPE.HEADING,
					isRead: isRead,
					isDelivered: isDelivered,
					thumbnailUrl: details.thumbnailUrl ? details.thumbnailUrl : null,
					location: null,
					size: details.size ? details.size : null,
					transcribe: details.transcribe ? details.transcribe : null,
					status: STATUS.ACTIVE,
					taggedUser: taggedUser
				}
				let translatedInfo: any = {}
				const header_messages = await baseDao.save(this.modelMessage, save);
				/*end of saving header msg*/
				group = await baseDao.findOneAndUpdate(this.modelChat, {
					_id: group._id
				}, {
					lastMsgId: header_messages._id,
					lastMsgCreated: Date.now(),
					$pull: { deletedBy: { $in: addedMembers }, exitedBy: { $in: addedMembers } }
				}, { new: true });
				let membersDetails = await userDaoV1.find("users", { _id: { $in: group.members } }, { profilePicture: 1, _id: 1, countryCode: 1, mobileNo: 1, language: 1, status: 1, name: 1, flagCode: 1 });
				const assistantDetails = await userDaoV1.find("admins", { _id: { $in: group.members } }, { profilePicture: 1, _id: 1, countryCode: 1, mobileNo: 1, language: 1, status: 1, name: 1, flagCode: 1 });
				membersDetails = membersDetails.concat(assistantDetails);
				header_messages.membersDetails = membersDetails;
				ack(MESSAGES.SUCCESS.DETAILS(updated_group_members));
				io.to(`${params.groupId}`).emit(`${params.groupId}`, {
					eventType: SOCKET.LISTNER_TYPE.GROUP.MESSAGES,
					data: header_messages
				});
				group.membersDetails = membersDetails;
				io.to(`${params.groupId}`).emit(`${params.groupId}`, {
					eventType: SOCKET.LISTNER_TYPE.GROUP.GROUP_INFO,
					groupDetails: group
				});
				/*NOTIFY USERS*/
				let message = CHAT_HEADERS.GROUP.ADD_NOTIFY(tokenData.userId);
				const sender = await userDaoV1.findUserById(tokenData.userId);
				for (let user of addedMembers) {
					let IsNotificationMuted = await this.checkforChatNotification(user, group._id);
					const socket_user = await redisClient.getValue(SERVER.APP_NAME + "_" + user + REDIS_KEY_PREFIX.SOCKET_ID);
					if (socket_user) {
						const contactUserIdSocket = socket_user ? socket.broadcast.to(socket_user) : undefined;// io.sockets.sockets.get(socket_user);
						if (contactUserIdSocket) {
							if (user.toString() !== tokenData.userId.toString()) {
								// await this.triggerGroupNotification(true, params, socket_user, sender, user, io, group, save, socket, contactUserIdSocket, IsNotificationMuted)
							}
							this.inboxChat(io, contactUserIdSocket, PAGINATION_DEFAULT, ack, { userId: user });
							this.refreshChatBox(io,contactUserIdSocket,{chatId: group._id},ack,{userId: user});
						}
					} else {
						if (user.toString() !== tokenData.userId.toString()) {
							// await this.triggerGroupNotification(false, params, socket_user, sender, user, io, group, save, socket, {}, IsNotificationMuted)
						}
					}
				}
				/*END NOTIFY USERS*/
				this.refreshGroupChatInboxList(params.groupId, tokenData.userId, updated_group_members.members, io, socket, ack);
				return
			}
			const membersDetails = await userDaoV1.find("users", { _id: { $in: group.members } }, { profilePicture: 1, _id: 1, countryCode: 1, mobileNo: 1, language: 1, status: 1, name: 1, flagCode: 1 });
			group.membersDetails = membersDetails;
			ack(MESSAGES.SUCCESS.DETAILS(group));
			io.to(`${params.groupId}`).emit(`${params.groupId}`, {
				eventType: SOCKET.LISTNER_TYPE.GROUP.GROUP_INFO,
				groupDetails: group
			});
		} catch (error) {
			throw error;
		}
	}


	async updateHeaderForGroup(io: any, params, group, tokenData: TokenData, mode, socket: any, ack: any) {
		try {
			let details: any = {}, taggedUser = [];
			details.languageCode = LANGUAGE_CODE.EN;
			if (mode == CHAT_MODE_TYPE.NAME) {
				details.message = CHAT_HEADERS.GROUP.UPDATE.NAME(tokenData.userId, params.name);
			} else if (mode == CHAT_MODE_TYPE.DESCRIPTION) {
				details.message = CHAT_HEADERS.GROUP.UPDATE.DESCRIPTION(tokenData.userId);
			} else if (mode == CHAT_MODE_TYPE.ICON) {
				details.message = CHAT_HEADERS.GROUP.UPDATE.ICON(tokenData.userId);
			} else {
				details.message = CHAT_HEADERS.GROUP.UPDATE.REMOVE_ICON(tokenData.userId);
			}
			taggedUser.push(tokenData.userId);
			let isRead = [], isDelivered = [];
			isRead.push(tokenData.userId);
			isDelivered.push(tokenData.userId);
			let save: any = {
				type: CHAT_TYPE.GROUP,
				senderId: tokenData.userId,
				members: group.members,
				chatId: group._id,
				message: details.message,
				mediaUrl: null,
				messageType: MESSAGE_TYPE.HEADING,
				isRead: isRead,
				isDelivered: isDelivered,
				thumbnailUrl: details.thumbnailUrl ? details.thumbnailUrl : null,
				location: null,
				size: details.size ? details.size : null,
				transcribe: details.transcribe ? details.transcribe : null,
				status: STATUS.ACTIVE,
				taggedUser: taggedUser
			}
			let translatedInfo: any = {}
			const header_messages = await baseDao.save(this.modelMessage, save);
			/*end of saving header msg*/
			group = await baseDao.findOneAndUpdate(this.modelChat, {
				_id: group._id
			}, {
				lastMsgId: header_messages._id,
				lastMsgCreated: Date.now()
			}, { new: true });
			const membersDetails = await userDaoV1.find("users", { _id: { $in: group.members } }, { profilePicture: 1, _id: 1, countryCode: 1, mobileNo: 1, language: 1, status: 1, name: 1, flagCode: 1 });
			header_messages.membersDetails = membersDetails;
			io.to(`${params.groupId}`).emit(`${params.groupId}`, {
				eventType: SOCKET.LISTNER_TYPE.GROUP.MESSAGES,
				data: header_messages
			});
			this.refreshGroupChatInboxList(params.groupId, tokenData.userId, group.members, io, socket, ack);
		} catch (error) {
			throw error
		}
	}

	/**
	 * @function viewGroupDetails
	 * view group details along with media details
	*/
	async viewGroupDetails(params: ChatRequest.Id, tokenData: TokenData) {
		try {
			if (!params.groupId) {
				return MESSAGES.ERROR.PARAMS_MISSING
			}
			let group = await chatDaoV1.findOne("chats", { _id: params.groupId, type: CHAT_TYPE.GROUP, deletedBy: { $nin: [tokenData.userId] } }, { type: 1, members: 1, overallMembers: 1, status: 1, admins: 1, createdBy: 1, name: 1, description: 1, groupProfilePicture: 1, created: 1, totalMembers: { $cond: { if: { $isArray: "$members" }, then: { $size: "$members" }, else: 0 } }, });
			if (!group) return MESSAGES.ERROR.GROUP_NOT_FOUND;
			const membersDetails = await userDaoV1.find("users", { _id: { $in: group.members } }, { profilePicture: 1, _id: 1, countryCode: 1, mobileNo: 1, language: 1, status: 1, name: 1, flagCode: 1, email:1, isAdmin: { $literal: false } });
			group.membersDetails = membersDetails;
			const overAllMembersDetails = await userDaoV1.find("users", { _id: { $in: group.overallMembers } }, { profilePicture: 1, _id: 1, countryCode: 1, mobileNo: 1, language: 1, status: 1, name: 1, flagCode: 1, email: 1, isAdmin: { $literal: false } });
			group.overAllMembersDetails = overAllMembersDetails;
			for (let user of group.membersDetails) {
				for (let admin of group.admins) {
					if (admin.toString() == user._id.toString()) {
						user.isAdmin = true;
						break;
					}
				}
			}
			delete group.members;
			delete group.admins;
			return MESSAGES.SUCCESS.GROUP_DETAILS(group);
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @function exitGroup
	 * exit from a group
	 * if only admin left from the group then assign new random admin to existing group
	*/
	async exitGroup(io: any, socket: any, params: ChatRequest.Id, ack: any, tokenData: TokenData) {
		try {
			if (!params.groupId) {
				return ack(MESSAGES.ERROR.PARAMS_MISSING)
			}
			let group = await chatDaoV1.findOne("chats", { _id: params.groupId, type: CHAT_TYPE.GROUP, deletedBy: { $nin: [tokenData.userId] } }, {});
			if (!group) return ack(MESSAGES.ERROR.GROUP_NOT_FOUND);
			const groupUser = await chatDaoV1.findOne("chats", { _id: params.groupId, members: { $in: tokenData.userId } });
			if (!groupUser) return ack(MESSAGES.ERROR.USER_NOT_FOUND);
			const members = group.members;
			const admins = group.admins;;
			if(admins.length === 1){
				if (admins[0].toString() === tokenData.userId.toString()) {
					return ack(MESSAGES.ERROR.FIRST_ASSIGN_ADMIN);
				}
			}
			await chatDaoV1.findOneAndUpdate("chats", { _id: params.groupId }, { $pull: { members: tokenData.userId, admins: tokenData.userId }, $push: { exitedBy: tokenData.userId } }, { new: true });
			/*save header message*/
			let details: any = {}, taggedUser = [];
			details.languageCode = LANGUAGE_CODE.EN;
			details.message = CHAT_HEADERS.GROUP.LEFT(tokenData.userId);
			taggedUser.push(tokenData.userId)
			let isRead = [], isDelivered = [];
			isRead.push(tokenData.userId);
			isDelivered.push(tokenData.userId);
			let save: any = {
				type: CHAT_TYPE.GROUP,
				senderId: tokenData.userId,
				members: members,
				chatId: group._id,
				message: details.message,
				mediaUrl: null,
				messageType: MESSAGE_TYPE.HEADING,
				isRead: isRead,
				isDelivered: isDelivered,
				thumbnailUrl: details.thumbnailUrl ? details.thumbnailUrl : null,
				location: null,
				size: details.size ? details.size : null,
				transcribe: details.transcribe ? details.transcribe : null,
				status: STATUS.ACTIVE,
				taggedUser: taggedUser
			}
			const header_messages = await baseDao.save(this.modelMessage, save);
			/*end of saving header msg*/
			group = await baseDao.findOneAndUpdate(this.modelChat, {
				_id: group._id
			}, {
				lastMsgId: header_messages._id,
				lastMsgCreated: Date.now()
			}, { new: true });
			let membersDetails = await userDaoV1.find("users", { _id: { $in: members } }, { profilePicture: 1, _id: 1, countryCode: 1, mobileNo: 1, language: 1, status: 1, name: 1, flagCode: 1 });
			const assistantDetails = await userDaoV1.find("admins", { _id: { $in: members } }, { profilePicture: 1, _id: 1, countryCode: 1, mobileNo: 1, language: 1, status: 1, name: 1, flagCode: 1 });
			membersDetails = membersDetails.concat(assistantDetails);
			header_messages.membersDetails = membersDetails;
			/*after exited members details*/
			let removedMembersDetails = await userDaoV1.find("users", { _id: { $in: group.members } }, { profilePicture: 1, _id: 1, countryCode: 1, mobileNo: 1, language: 1, status: 1, name: 1, flagCode: 1 });
			const removedAssistantDetails = await userDaoV1.find("admins", { _id: { $in: group.members } }, { profilePicture: 1, _id: 1, countryCode: 1, mobileNo: 1, language: 1, status: 1, name: 1, flagCode: 1 });
			removedMembersDetails = removedMembersDetails.concat(removedAssistantDetails);
			group.membersDetails = removedMembersDetails;
			ack(MESSAGES.SUCCESS.DEFAULT);
			io.to(`${params.groupId}`).emit(`${params.groupId}`, {
				eventType: SOCKET.LISTNER_TYPE.GROUP.MESSAGES,
				data: header_messages
			});
			io.to(`${params.groupId}`).emit(`${params.groupId}`, {
				eventType: SOCKET.LISTNER_TYPE.GROUP.GROUP_INFO,
				groupDetails: group
			});
			return
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @function deleteGroup
	 * delete user from a group only after he exited from a group
	*/
	async deleteGroup(io: any, socket: any, params: ChatRequest.Id, ack: any, tokenData: TokenData) {
		try {
			if (!params.groupId) {
				return ack(MESSAGES.ERROR.PARAMS_MISSING)
			}
			const group = await chatDaoV1.findOne("chats", { _id: params.groupId, type: CHAT_TYPE.GROUP, deletedBy: { $nin: [tokenData.userId] } }, {});
			if (!group) return ack(MESSAGES.ERROR.GROUP_NOT_FOUND);
			const groupUser = await chatDaoV1.findOne("chats", { _id: params.groupId, members: { $in: tokenData.userId } });
			if (groupUser) return ack(MESSAGES.ERROR.MEMEBERS_ALREADY_EXIST);
			const deleteGroup = await chatDaoV1.findOneAndUpdate("chats", { _id: params.groupId }, { $addToSet: { deletedBy: tokenData.userId }, $pull: { exitedBy: tokenData.userId } }, { new: true });
			ack(MESSAGES.SUCCESS.DEFAULT);
			await baseDao.updateMany(this.modelMessage, { chatId: params.groupId }, { $addToSet: { deletedBy: tokenData.userId } }, {})
			return
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @function removeGroupMember
	 * remove user from a group only by admins
	*/
	async removeGroupMember(io: any, socket: any, params: ChatRequest.Id, ack: any, tokenData: TokenData) {
		try {
			if (!params.groupId) {
				return ack(MESSAGES.ERROR.PARAMS_MISSING)
			}
			if(tokenData.userId.toString() === params.contactUserId.toString()){
				return ack(MESSAGES.ERROR.REMOVE_USER)
			}
			let group = await chatDaoV1.findOne("chats", { _id: params.groupId, type: CHAT_TYPE.GROUP, deletedBy: { $nin: [tokenData.userId] } }, {});
			if (!group) return ack(MESSAGES.ERROR.GROUP_NOT_FOUND);
			const groupUser = await chatDaoV1.findOne("chats", { _id: params.groupId, members: { $in: params.contactUserId } });
			if (!groupUser) return ack(MESSAGES.ERROR.USER_NOT_FOUND);
			const isAdmin = await chatDaoV1.findOne("chats", { _id: params.groupId, admins: { $in: tokenData.userId } });
			if (!isAdmin) return ack(MESSAGES.ERROR.UNAUTHORIZE_ADMIN);
			const removeGroupMember = await chatDaoV1.findOneAndUpdate("chats", { _id: params.groupId }, { $pull: { members: params.contactUserId, admins: params.contactUserId }, $addToSet: { exitedBy: params.contactUserId } }, { new: true });
			/*save header message*/
			let details: any = {}, taggedUser = [];
			details.languageCode = LANGUAGE_CODE.EN;
			details.message = CHAT_HEADERS.GROUP.REMOVE(tokenData.userId, params.contactUserId);
			taggedUser.push(tokenData.userId, params.contactUserId)
			let isRead = [], isDelivered = [];
			isRead.push(tokenData.userId);
			isDelivered.push(tokenData.userId);
			let save: any = {
				type: CHAT_TYPE.GROUP,
				senderId: tokenData.userId,
				members: group.members,
				chatId: group._id,
				message: details.message,
				mediaUrl: null,
				messageType: MESSAGE_TYPE.HEADING,
				isRead: isRead,
				isDelivered: isDelivered,
				thumbnailUrl: details.thumbnailUrl ? details.thumbnailUrl : null,
				location: null,
				size: details.size ? details.size : null,
				transcribe: details.transcribe ? details.transcribe : null,
				status: STATUS.ACTIVE,
			}
			let translatedInfo: any = {}
			const header_messages = await baseDao.save(this.modelMessage, save);
			/*end of saving header msg*/
			group = await baseDao.findOneAndUpdate(this.modelChat, {
				_id: group._id
			}, {
				lastMsgId: header_messages._id,
				lastMsgCreated: Date.now()
			}, { new: true });
			let membersDetails = await userDaoV1.find("users", { _id: { $in: save.members } }, { profilePicture: 1, _id: 1, countryCode: 1, mobileNo: 1, language: 1, status: 1, name: 1, flagCode: 1 });
			const assistantDetails = await userDaoV1.find("admins", { _id: { $in: save.members } }, { profilePicture: 1, _id: 1, countryCode: 1, mobileNo: 1, language: 1, status: 1, name: 1, flagCode: 1 });
			membersDetails = membersDetails.concat(assistantDetails);
			header_messages.membersDetails = membersDetails; //save full members details
			/*remove current removed members details*/
			let removedMembersDetails = await userDaoV1.find("users", { _id: { $in: removeGroupMember.members } }, { profilePicture: 1, _id: 1, countryCode: 1, mobileNo: 1, language: 1, status: 1, name: 1, flagCode: 1 });
			const removedAssistantDetails = await userDaoV1.find("admins", { _id: { $in: removeGroupMember.members } }, { profilePicture: 1, _id: 1, countryCode: 1, mobileNo: 1, language: 1, status: 1, name: 1, flagCode: 1 });
			removedMembersDetails = removedMembersDetails.concat(removedAssistantDetails);
			group.membersDetails = removedMembersDetails;
			await this.notifyRemovedUser(io, {
				userId: params.contactUserId,
				groupId: params.groupId
			});
			/** */
			ack(MESSAGES.SUCCESS.DEFAULT);
			io.to(`${params.groupId}`).emit(`${params.groupId}`, {
				eventType: SOCKET.LISTNER_TYPE.GROUP.MESSAGES,
				data: header_messages
			});
			io.to(`${params.groupId}`).emit(`${params.groupId}`, {
				eventType: SOCKET.LISTNER_TYPE.GROUP.GROUP_INFO,
				groupDetails: group
			});
			this.refreshGroupChatInboxList(params.groupId, tokenData.userId, save.members, io, socket, ack);
			return
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @function notifyRemovedUser
	 * notify user when removed from group
	*/
	async notifyRemovedUser(io, data) {
		try {
			const socket_user = await redisClient.getValue(SERVER.APP_NAME + "_" + data.userId + REDIS_KEY_PREFIX.SOCKET_ID);
			if (socket_user) {
				const contactUserIdSocket = io.sockets.sockets.get(socket_user);
				if (contactUserIdSocket) contactUserIdSocket.emit(SOCKET.LISTNER_TYPE.NOTIFY.REMOVED_FROM_GROUP, {
					userId: data.userId,
					groupId: data.groupId
				})
			}
			return
		} catch (error) {
			throw error
		}
	}

	/**
	 * @function makeGroupAdmin
	 * assign admin role in a group by an admin
	*/
	async makeGroupAdmin(io: any, socket: any, params: ChatRequest.Id, ack: any, tokenData: TokenData) {
		try {
			if (!params.groupId) {
				return ack(MESSAGES.ERROR.PARAMS_MISSING)
			}
			const group = await chatDaoV1.findOne("chats", { _id: params.groupId, type: CHAT_TYPE.GROUP, deletedBy: { $nin: [tokenData.userId] } }, {});
			if (!group) return ack(MESSAGES.ERROR.GROUP_NOT_FOUND);
			const groupUser = await chatDaoV1.findOne("chats", { _id: params.groupId, members: { $in: params.contactUserId } });
			if (!groupUser) return ack(MESSAGES.ERROR.USER_NOT_FOUND);
			const isAdmin = await chatDaoV1.findOne("chats", { _id: params.groupId, admins: { $in: tokenData.userId } });
			if (!isAdmin) return ack(MESSAGES.ERROR.UNAUTHORIZE_ADMIN);
			const makeGroupAdmin = await chatDaoV1.findOneAndUpdate("chats", { _id: params.groupId }, { $addToSet: { admins: params.contactUserId } }, { new: true });
			let membersDetails = await userDaoV1.find("users", { _id: { $in: makeGroupAdmin.members } }, { profilePicture: 1, _id: 1, countryCode: 1, mobileNo: 1, language: 1, status: 1, name: 1, flagCode: 1 });
			const assistantDetails = await userDaoV1.find("admins", { _id: { $in: makeGroupAdmin.members } }, { profilePicture: 1, _id: 1, countryCode: 1, mobileNo: 1, language: 1, status: 1, name: 1, flagCode: 1 });
			membersDetails = membersDetails.concat(assistantDetails);
			makeGroupAdmin.membersDetails = membersDetails;
			ack(MESSAGES.SUCCESS.DEFAULT);
			/*save header message*/
			let details: any = {}, taggedUser = [];
			details.languageCode = LANGUAGE_CODE.EN;
			details.message = CHAT_HEADERS.GROUP.UPDATE.ADMIN(params.contactUserId);
			taggedUser.push(tokenData.userId)
			let isRead = [], isDelivered = [], deletedBy = [];
			isRead.push(tokenData.userId);
			isDelivered.push(tokenData.userId);
			deletedBy = group.members.filter(x => x.toString() !== params.contactUserId.toString());
			let save: any = {
				type: CHAT_TYPE.GROUP,
				senderId: tokenData.userId,
				members: group.members,
				chatId: group._id,
				message: details.message,
				mediaUrl: null,
				messageType: MESSAGE_TYPE.HEADING,
				isRead: isRead,
				isDelivered: isDelivered,
				deletedBy: deletedBy,
				thumbnailUrl: details.thumbnailUrl ? details.thumbnailUrl : null,
				location: null,
				size: details.size ? details.size : null,
				transcribe: details.transcribe ? details.transcribe : null,
				status: STATUS.ACTIVE,
			}
			let translatedInfo: any = {}
			const header_messages = await baseDao.save(this.modelMessage, save);
			/*end of saving header msg*/
			header_messages.membersDetails = membersDetails;
			const socket_user = await redisClient.getValue(SERVER.APP_NAME + "_" + params.contactUserId + REDIS_KEY_PREFIX.SOCKET_ID);
			if (socket_user) {
				const contactUserIdSocket = socket_user ? socket.broadcast.to(socket_user) : undefined;//io.sockets.sockets.get(socket_user);
				if (contactUserIdSocket) {
					contactUserIdSocket.emit(`${params.groupId}`, {
						eventType: SOCKET.LISTNER_TYPE.GROUP.MESSAGES,
						data: header_messages
					});
					this.inboxChat(io, contactUserIdSocket, PAGINATION_DEFAULT, ack, { userId: params.contactUserId });
				}
			}
			io.to(`${params.groupId}`).emit(`${params.groupId}`, {
				eventType: SOCKET.LISTNER_TYPE.GROUP.GROUP_INFO,
				groupDetails: makeGroupAdmin
			});
			this.refreshGroupChatInboxList(params.groupId, tokenData.userId, save.members, io, socket, ack);
			return
		} catch (error) {
			throw error;
		}
	}

	/**
 * @function removeGroupAdmin
 * remove admin role in a group by an admin
*/
	async removeGroupAdmin(io: any, socket: any, params: ChatRequest.Id, ack: any, tokenData: TokenData) {
		try {
			if (!params.groupId) {
				return ack(MESSAGES.ERROR.PARAMS_MISSING)
			}
			if(tokenData.userId.toString() === params.contactUserId.toString()){
				return ack(MESSAGES.ERROR.REMOVE_USER)
			}
			const group = await chatDaoV1.findOne("chats", { _id: params.groupId, type: CHAT_TYPE.GROUP, deletedBy: { $nin: [tokenData.userId] } }, {});
			if (!group) return ack(MESSAGES.ERROR.GROUP_NOT_FOUND);
			const groupUser = await chatDaoV1.findOne("chats", { _id: params.groupId, members: { $in: params.contactUserId } });
			if (!groupUser) return ack(MESSAGES.ERROR.USER_NOT_FOUND);
			const isAdmin = await chatDaoV1.findOne("chats", { _id: params.groupId, admins: { $in: tokenData.userId } });
			if (!isAdmin) return ack(MESSAGES.ERROR.UNAUTHORIZE_ADMIN);
			const removeGroupAdmin = await chatDaoV1.findOneAndUpdate("chats", { _id: params.groupId }, { $pull: { admins: params.contactUserId } }, { new: true });
			ack(MESSAGES.SUCCESS.DEFAULT);
			let membersDetails = await userDaoV1.find("users", { _id: { $in: removeGroupAdmin.members } }, { profilePicture: 1, _id: 1, countryCode: 1, mobileNo: 1, language: 1, status: 1, name: 1, flagCode: 1 });
			const assistantDetails = await userDaoV1.find("admins", { _id: { $in: removeGroupAdmin.members } }, { profilePicture: 1, _id: 1, countryCode: 1, mobileNo: 1, language: 1, status: 1, name: 1, flagCode: 1 });
			membersDetails = membersDetails.concat(assistantDetails);
			removeGroupAdmin.membersDetails = membersDetails
			ack(MESSAGES.SUCCESS.DEFAULT);
			/*save header message*/
			let details: any = {}, taggedUser = [];
			details.languageCode = LANGUAGE_CODE.EN;
			details.message = CHAT_HEADERS.GROUP.UPDATE.REVOKE_ADMIN(params.contactUserId);
			taggedUser.push(tokenData.userId)
			let isRead = [], isDelivered = [], deletedBy = [];
			isRead.push(tokenData.userId);
			isDelivered.push(tokenData.userId);
			deletedBy = group.members.filter(x => x.toString() !== params.contactUserId.toString());
			let save: any = {
				type: CHAT_TYPE.GROUP,
				senderId: tokenData.userId,
				members: group.members,
				chatId: group._id,
				message: details.message,
				mediaUrl: null,
				messageType: MESSAGE_TYPE.HEADING,
				isRead: isRead,
				isDelivered: isDelivered,
				deletedBy: deletedBy,
				thumbnailUrl: details.thumbnailUrl ? details.thumbnailUrl : null,
				location: null,
				size: details.size ? details.size : null,
				transcribe: details.transcribe ? details.transcribe : null,
				status: STATUS.ACTIVE,
			}
			let translatedInfo: any = {}
			const header_messages = await baseDao.save(this.modelMessage, save);
			/*end of saving header msg*/
			header_messages.membersDetails = membersDetails;
			ack(MESSAGES.SUCCESS.DEFAULT);
			const socket_user = await redisClient.getValue(SERVER.APP_NAME + "_" + params.contactUserId + REDIS_KEY_PREFIX.SOCKET_ID);
			if (socket_user) {
				const contactUserIdSocket = socket_user ? socket.broadcast.to(socket_user) : undefined;//io.sockets.sockets.get(socket_user);
				if (contactUserIdSocket) {
					contactUserIdSocket.emit(`${params.groupId}`, {
						eventType: SOCKET.LISTNER_TYPE.GROUP.MESSAGES,
						data: header_messages
					});
					this.inboxChat(io, contactUserIdSocket, PAGINATION_DEFAULT, ack, { userId: params.contactUserId });
				}
			}
			io.to(`${params.groupId}`).emit(`${params.groupId}`, {
				eventType: SOCKET.LISTNER_TYPE.GROUP.GROUP_INFO,
				groupDetails: removeGroupAdmin
			});
			return
		} catch (error) {
			throw error;
		}
	}

	/**
 * @function joinGroupChat
 * enter in a group chat and allow socket to join a chat-room @:grouId
*/
	async joinGroupChat(io: any, socket: any, params: ChatRequest.Id, ack: any, tokenData: TokenData) {
		try {
			if (!params.groupId) {
				return ack(MESSAGES.ERROR.PARAMS_MISSING)
			}
			const group = await chatDaoV1.findOne("chats", { _id: params.groupId, type: CHAT_TYPE.GROUP, deletedBy: { $nin: [tokenData.userId] } }, {});
			if (!group) return ack(MESSAGES.ERROR.GROUP_NOT_FOUND);
			const groupUser = await chatDaoV1.findOne("chats", { _id: params.groupId, overallMembers: { $in: tokenData.userId } });
			if (!groupUser) return ack(MESSAGES.ERROR.USER_NOT_FOUND);
			let data = {
				chatId: group?._id,
				groupProfilePicture: group?.groupProfilePicture,
				name: group?.name,
				description: group?.description,
				chatType: group?.type,
				mutedBy: group?.mutedBy,
				status: group?.status,
			}
			ack(MESSAGES.SUCCESS.CHAT_FORMATION(data));
			socket.join(`${group._id}`);
			socket.emit(SOCKET.LISTNER_TYPE.GROUP.JOIN, MESSAGES.SUCCESS.CHAT_FORMATION(data));
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @function readAllChat
	 * marked chat readall with chatId
	*/
	async markedReadAllChat(io: any, socket: any, params: ChatRequest.markedReadAll, ack: any, tokenData: TokenData) {
		try {
			if (!params.chatId) {
				ack(MESSAGES.ERROR.PARAMS_MISSING)
				return
			}
			let chat = await chatDaoV1.findOne("chats", { _id: params.chatId, deletedBy: { $nin: [tokenData.userId] } }, {});
			if (!chat) return ack(MESSAGES.ERROR.CHAT_NOT_FOUND);
			await baseDao.updateMany(this.modelMessage, { chatId: params.chatId, isRead: { $nin: [toObjectId(tokenData.userId)] } }, { $addToSet: { isRead: toObjectId(tokenData.userId) } }, {});
			ack(MESSAGES.SUCCESS.DEFAULT);
			this.inboxChat(io, socket, PAGINATION_DEFAULT, ack, { userId: tokenData.userId });
			return
		} catch (error) {
			throw error;
		}
	}

	/** 
	 * @function checkforChatNotification
	 * check whether a user allows for notification for chat or not
	*/
	async checkforChatNotification(userId: string, chatId: string) {
		try {
			consolelog(`${userId} *************checkforChatNotification invoked***************`, chatId, true);
			let chat_notification = await redisClient.getValue(SERVER.APP_NAME + "_" + userId + "_" + chatId + REDIS_KEY_PREFIX.MUTE_CHAT);
			let push_notification = await redisClient.getValue(SERVER.APP_NAME + "_" + userId + REDIS_KEY_PREFIX.MUTE_CHAT);
			if (chat_notification || push_notification) {
				return true;
			}
			return false;
		} catch (error) {
			throw error
		}
	}

	/** 
	 * @function sendGroupMessage
	 * send messages in a group with respective groupId-->chatId
	*/
	async sendGroupMessage(io: any, socket: any, params: ChatRequest.GROUP_MESSAGE, ack: any, tokenData: TokenData) {
		try {
			consolelog(`${params.chatId} sendGroupMessage emit timer`, Date.now(), true);
			if (!params.chatId || !params.messageType || !params.senderId) {
				ack(MESSAGES.ERROR.PARAMS_MISSING)
				return
			}
			if (params.messageType == MESSAGE_TYPE.TEXT && !params.message) {
				ack(MESSAGES.ERROR.PARAMS_MISSING)
				return
			}
			const group = await chatDaoV1.findOne("chats", { _id: params.chatId, members: tokenData.userId, type: CHAT_TYPE.GROUP, deletedBy: { $nin: [tokenData.userId] } }, {});
			if (!group) return ack(MESSAGES.ERROR.GROUP_NOT_FOUND);
			let deletedBy = [], isDelivered = [], isRead = [];
			if (group?.deletedBy && group?.exitedBy) {
				deletedBy = group.deletedBy.concat(group.exitedBy)
			}
			// isRead.push(params.senderId);
			// isDelivered.push(params.senderId);
			for (let memb of group.members) {
				const socket_user = await redisClient.getValue(SERVER.APP_NAME + "_" + memb.toString() + REDIS_KEY_PREFIX.SOCKET_ID);
				if (socket_user) {
					isDelivered.push(memb);
					const scoketIds = await io.in(socket_user).fetchSockets();
					for (const socket of scoketIds) {
						if (socket?.rooms?.has(`${params.chatId}`)) isRead.push(memb);
					}
				}
			}
			let members = [];
			members = group.members;
			let data: any = {
				_id: params.localMessageId,
				type: CHAT_TYPE.GROUP,
				senderId: params.senderId,
				members: members,
				chatId: params.chatId,
				message: params.message,
				mediaUrl: params.mediaUrl,
				messageType: params.messageType,
				isRead: isRead,
				isDelivered: isDelivered,
				thumbnailUrl: params.thumbnailUrl ? params.thumbnailUrl : null,
				location: params.location,
				size: params.size ? params.size : null,
				transcribe: params.transcribe ? params.transcribe : null,
				status: params.status,
				deletedBy: deletedBy,
				taggedUser: params.taggedUser,
				imageRatio: params.imageRatio,
				localUrl: params.localUrl
			}
			let translatedInfo: any = {}
			const message = await baseDao.save(this.modelMessage, data);
			let membersDetails = await userDaoV1.find("users", { _id: { $in: members } }, { profilePicture: 1, _id: 1, countryCode: 1, mobileNo: 1, language: 1, status: 1, name: 1, flagCode: 1 });
			const assistantDetails = await userDaoV1.find("admins", { _id: { $in: members } }, { profilePicture: 1, _id: 1, countryCode: 1, mobileNo: 1, language: 1, status: 1, name: 1, flagCode: 1 });
			membersDetails = membersDetails.concat(assistantDetails);
			message.membersDetails = membersDetails;
			ack(message);
			if(tokenData.userType === USER_TYPE.ASSISTANT){
				io.to(`${params.chatId}`).emit(`${SOCKET.LISTNER_TYPE.GROUP.MESSAGES}`, {
					eventType: SOCKET.LISTNER_TYPE.GROUP.MESSAGES,
					data: message
				});
			}
			else{
				io.to(`${params.chatId}`).emit(`${params.chatId}`, {
					eventType: SOCKET.LISTNER_TYPE.GROUP.MESSAGES,
					data: message
				});
			}
			consolelog(`${params.chatId},sendGroupMessage delivered timer`, Date.now(), true);
			await baseDao.findOneAndUpdate(this.modelChat, {
				_id: params.chatId
			}, {
				lastMsgId: message._id,
				lastMsgCreated: Date.now()
			}, {});
				this.inboxChat(io, socket, PAGINATION_DEFAULT, ack, { userId: tokenData.userId });
				this.refreshChatBox(io, socket, params, ack, { userId: tokenData.userId });
			const sender = await userDaoV1.findUserById(params.senderId);
			for (let user of members) {
				if (params.senderId.toString() !== user.toString()) {
					consolelog(`-------${params.chatId},sendGroupMessage userId`, user, true);
					let IsNotificationMuted = await this.checkforChatNotification(user, group._id);
					const socket_user = await redisClient.getValue(SERVER.APP_NAME + "_" + user + REDIS_KEY_PREFIX.SOCKET_ID);
					if (socket_user) {
						const contactUserIdSocket = socket_user ? socket.broadcast.to(socket_user) : undefined;//io.sockets.sockets.get(socket_user);
						if (contactUserIdSocket) {
								if (socket_user) {
									let roomParams = {
										chatId: params.chatId,
										socketId: socket_user
									};
									let IsNotification = await this.checkUserRoomInSocket(io, roomParams);
									if (!IsNotification) //TODO:notification service
									{
										const contactUserId = await userDaoV1.findUserById(user);
										let notificationData: ChatRequest.CHAT_NOTIFICATION = {
											type: NOTIFICATION_TYPE.CHAT_NOTIFICATION,
											title: sender?.name,
											subtitle: group?.name,
											message: data.translatedMessages[`${contactUserId.languageCode}`] ? data.translatedMessages[`${contactUserId.languageCode}`] : params.message,
											body: data.translatedMessages[`${contactUserId.languageCode}`] ? data.translatedMessages[`${contactUserId.languageCode}`] : params.message,
											details: {
												chatId: params.chatId,
												senderId: params.senderId,
												receiverId: user.toString(),
												receiverIdName: contactUserId?.name,
												messageType: params.messageType,
												profilePicture: group?.groupProfilePicture,
												countryCode: sender.countryCode,
												mobileNo: sender.mobileNo,
												fullMobileNo: sender?.fullMobileNo,
												type: CHAT_TYPE.GROUP,
												senderName: group?.name,
												flagCode: sender?.flagCode,
												membersDetails: message.membersDetails ? message.membersDetails : {}
											}
										}
										console.log('********** sendGroupMessage notificationData*************', notificationData)
										// if (!IsNotificationMuted) await this.sendChatNotification(contactUserIdSocket, notificationData);

									}
								}
								this.inboxChat(io, contactUserIdSocket, PAGINATION_DEFAULT, ack, { userId: user });
								this.refreshChatBox(io, contactUserIdSocket, params, ack, { userId: user });
						}
					} else {
						const contactUserId = await userDaoV1.findUserById(user);
						let notification_message = messageTypeInChat(params.messageType) != MESSAGE_TYPE.TEXT ? messageTypeInChat(params.messageType) : data.translatedMessages[`${contactUserId.languageCode}`] ? data.translatedMessages[`${contactUserId.languageCode}`] : params.message;
						console.log('***************************notification_message***************************', notification_message)
						let notificationData: ChatRequest.CHAT_NOTIFICATION = {
							type: NOTIFICATION_TYPE.CHAT_NOTIFICATION,
							title: sender?.name,
							subtitle: group?.name,
							message: notification_message,
							body: notification_message,
							details: {
								chatId: params.chatId,
								senderId: params.senderId,
								receiverId: user.toString(),
								receiverIdName: contactUserId?.name,
								messageType: params.messageType,
								profilePicture: group?.groupProfilePicture,
								countryCode: sender.countryCode,
								mobileNo: sender.mobileNo,
								fullMobileNo: sender?.fullMobileNo,
								type: CHAT_TYPE.GROUP,
								senderName: group?.name,
								flagCode: sender?.flagCode,
								membersDetails: message.membersDetails ? message.membersDetails : {}
							}
						}
						// let contact = await contactDaoV1.findOne("contacts", { userId: notificationData.details.receiverId, contactUserId: notificationData.details.senderId }, { name: 1 });
						// notificationData.title = contact?.name || sender.fullMobileNo;
						// console.log('********** sendGroupMessage push notificationData*************', notificationData);
					}
				}
			}
			return true;
		} catch (error) {
			throw error;
		}
	}

	async refreshGroupChatInboxList(chatId: string, userId: string, members: Array<string>, io: any, socket: any, ack: any) {
		try {
				this.inboxChat(io, socket, PAGINATION_DEFAULT, ack, { userId: userId }, true);
				this.refreshChatBox(io,socket,{chatId:chatId},ack,{userId: userId}, true);
			for (let user of members) {
				const socket_user = await redisClient.getValue(SERVER.APP_NAME + "_" + user + REDIS_KEY_PREFIX.SOCKET_ID);
				if (socket_user) {
					const contactUserIdSocket = socket_user ? socket.broadcast.to(socket_user) : undefined;//io.sockets.sockets.get(socket_user);
					if (contactUserIdSocket) {
							this.inboxChat(io, contactUserIdSocket, PAGINATION_DEFAULT, ack, { userId: user }, true);
							this.refreshChatBox(io,contactUserIdSocket,{chatId:chatId},ack,{userId: user}, true);
					}
				}
			}
		} catch (error) {
			throw error
		}
	}

	/**
	 * @function updateUserLastSeen
	 * update user last seen when he disconnect his socket
	 */
	async updateUserLastSeen(params: ChatRequest.userId) {
		try {
			const user = await baseDao.findOneAndUpdate("users", {
				_id: params.userId
			}, { lastSeen: Date.now() });
			const assistant = await baseDao.findOneAndUpdate("admins", {
				_id: params.userId
			}, { lastSeen: Date.now() });
			return
		} catch (error) {
			throw error;
		}
	}


	/**
	 * @function messageList
	 */
	async messageList(params: ChatRequest.MessageList, tokenData: TokenData) {
		try {
			const userId = tokenData.userId;
			const data = await chatDaoV1.messageList(params, tokenData.userId);
			return MESSAGES.SUCCESS.LIST({ data });
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @function inboxMessages
	 * get inbox messages for a chat of a user in a room
	 */
	async inboxMessages(io: any, socket: any, params: ChatRequest.MessageList, ack: any, tokenData: TokenData) {
		try {
			consolelog(`${params.chatId} inboxMessages emit timer`, Date.now(), true);
			params.pageNo = PAGINATION_DEFAULT.pageNo;
			if (!params.limit || !params.chatId) {
				ack(MESSAGES.ERROR.PARAMS_MISSING)
				return
			}
			let lastMessageCreated = Date.now();
			if (params.lastMsgId) {
				const lastMessage = await baseDao.findOne("messages", { _id: params.lastMsgId });
				if (lastMessage) lastMessageCreated = lastMessage.created;
			}
			const userId = tokenData.userId;
			params.lastMessageCreated = lastMessageCreated;
			await baseDao.updateMany("messages", { chatId: params.chatId, deletedBy: { $nin: [toObjectId(tokenData.userId)] }, isDelivered: { $nin: [toObjectId(tokenData.userId)] } }, { $addToSet: { isDelivered: toObjectId(tokenData.userId) } }, {})
			await baseDao.updateMany("messages", { chatId: params.chatId, isRead: { $nin: [toObjectId(tokenData.userId)] } }, { $addToSet: { isRead: toObjectId(tokenData.userId) } }, {})
			const data = await chatDaoV1.messageList(params, userId);
			const members = await baseDao.distinct("messages", "members", { chatId: params.chatId });
			console.log(`******** inboxMessages members in messages **********`, members);
			const membersDetails = await userDaoV1.find("users", { _id: { $in: members } }, { profilePicture: 1, _id: 1, countryCode: 1, mobileNo: 1, language: 1, status: 1, name: 1, flagCode: 1 });
			for (const element of data.data) {
				for (const user of element.membersDetails) {
					for (let memb of membersDetails) {
						if (user._id.toString() == memb._id.toString()) {
							user.name = memb.name ? memb.name : user.name
						}
					}

				}
			}
			socket.emit(SOCKET.LISTNER_TYPE.CHAT.MESSAGE, MESSAGES.SUCCESS.LIST(data))
			ack(MESSAGES.SUCCESS.LIST(data));
			socket.broadcast.to(`${params.chatId}`).emit(`${params.chatId}`, {
				eventType: SOCKET.LISTNER_TYPE.MESSAGE.READ,
				data: {}
			});
			consolelog(`${params.chatId} inboxMessages delivered timer`, Date.now(), true);
			return
		} catch (error) {
			throw error;
		}
	}


	/**
	 * @function deleteChat
	 * delete chat for me and clear chat for me
	 */
	async deleteChat(io: any, socket: any, params: ChatRequest.ChatId, ack: any, tokenData: TokenData) {
		try {
			if (!params.chatId) {
				ack(MESSAGES.ERROR.PARAMS_MISSING)
				return
			}
			const isChatExist = await chatDaoV1.findChatById(params.chatId);
			if (!isChatExist) {
				ack(SOCKET.LISTNER_TYPE.CHAT.DELETE, MESSAGES.ERROR.CHAT_NOT_FOUND)
				return
			}
			let listing = {}
			if (params.isClearChat) {
				await chatDaoV1.deleteMessages(params, tokenData)
				ack(MESSAGES.SUCCESS.DELETE_CHAT);
				this.inboxChat(io, socket, listing, ack, { userId: tokenData.userId });
				this.refreshChatBox(io, socket, params, ack, { userId: tokenData.userId });
				return
			}
			await chatDaoV1.deleteChat(params, tokenData)
			await chatDaoV1.deleteMessages(params, tokenData);
			ack(MESSAGES.SUCCESS.DELETE_CHAT)
			this.inboxChat(io, socket, listing, ack, { userId: tokenData.userId });
			this.refreshChatBox(io, socket, params, ack, { userId: tokenData.userId });
			return
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @function lastActiveMsgInChat
	 * check last message for a user in a chat after deletion of message
	 */
	async lastActiveMsgInChatForUser(chatId: string, userId: string) {
		try {
			const messageDetail = await baseDao.findOne("messages", {
				chatId: chatId, deletedBy: { $nin: [toObjectId(userId)] }
			}, {}, {}, { created: -1 });
			return messageDetail
		} catch (error) {
			throw error
		}
	}

	/**
	 * @function updateLastMsgInChat
	 * check last message for a user in a chat after deletion of message if exists update otherwise push to lastMsgIdByUsers for that user
	 */
	async updateLastMsgInChatForUser(messageDetail: any, userId: string) {
		try {
			const update = await baseDao.findOneAndUpdate(this.modelChat, { _id: messageDetail.chatId, lastMsgIdByUsers: { $elemMatch: { userId: userId } } }, { "lastMsgIdByUsers.$.lastMsgId": [messageDetail] });
			if (!update && messageDetail) {
				await baseDao.findOneAndUpdate(this.modelChat, { _id: messageDetail.chatId }, {
					$push: {
						lastMsgIdByUsers: [{
							userId: userId,
							lastMsgId: [messageDetail]
						}]
					}
				});
			}
		} catch (error) {
			throw error
		}
	}


	/**
	 * @function deleteMessages
	 * delete a message for me and everyone in a chat
	 */
	async deleteMessages(io: any, socket: any, params: ChatRequest.DeleteMessages, ack: any, tokenData: TokenData) {
		try {
			if (!params.messageId.length) {
				ack(MESSAGES.ERROR.PARAMS_MISSING)
				return
			}
			if (!params.isDeleteForEveryone) params.isDeleteForEveryone = false;
			let messageId = await baseDao.findOne("messages", { _id: params.messageId }, {});
			consolelog('__delete_message', messageId, false);
			messageId = await chatDaoV1.deleteMessagesById(params, tokenData);
			let membersDetails = await userDaoV1.find("users", { _id: { $in: messageId.members } }, { profilePicture: 1, _id: 1, countryCode: 1, mobileNo: 1, language: 1, status: 1, name: 1, flagCode: 1 });
			const assistantDetails = await userDaoV1.find("admins", { _id: { $in: messageId.members } }, { profilePicture: 1, _id: 1, countryCode: 1, mobileNo: 1, language: 1, status: 1, name: 1, flagCode: 1 });
			membersDetails = membersDetails.concat(assistantDetails);
			messageId.membersDetails = membersDetails;
			ack(MESSAGES.SUCCESS.DELETE_MESSAGE);
			if (params.isDeleteForEveryone) { // send to everyone
				io.to(`${messageId.chatId}`).emit(`${messageId.chatId}`, {
					eventType: SOCKET.LISTNER_TYPE.MESSAGE.DELETE_MESSAGE,
					data: messageId
				});
			} else { //send to only socket who deleted message
				socket.emit(`${messageId.chatId}`, {
					eventType: SOCKET.LISTNER_TYPE.MESSAGE.DELETE_MESSAGE,
					data: messageId
				});
			}
			/*refresh chat list for chatId members*/
			for (let user of messageId.members) {
				const socket_user = await redisClient.getValue(SERVER.APP_NAME + "_" + user + REDIS_KEY_PREFIX.SOCKET_ID);
				if (socket_user) {
					const contactUserIdSocket = socket_user ? socket.broadcast.to(socket_user) : undefined;//io.sockets.sockets.get(socket_user);
					if (contactUserIdSocket) {
						this.inboxChat(io, contactUserIdSocket, PAGINATION_DEFAULT, ack, { userId: user });
						this.refreshChatBox(io, contactUserIdSocket, {chatId: messageId.chatId}, ack, { userId: user });
					}
				}
			}
			return
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @function chatProfile
	 * get chat profile for a user with media details
	 */
	async chatProfile(params: ChatRequest.Id, tokenData: TokenData) {
		try {
			const step1 = await baseDao.findOne("users", {
				_id: toObjectId(params.contactUserId)
			},
				{ profilePicture: 1, name: 1, mobileNo: 1, countryCode: 1, about: 1, status: 1, flagCode: 1 }
			);
			const isBlocked = await this.checkUserBlockedStatus(tokenData.userId, params.contactUserId);
			// const isBlocked = await userDaoV1.findOne("users", { _id: tokenData.userId, blocked: { $in: [toObjectId(params.contactUserId)] } });
			step1.status = isBlocked ? STATUS.BLOCKED : STATUS.UN_BLOCKED;
			// const contactName = await contactDaoV1.findOne("contacts", { userId: tokenData.userId, contactUserId: params.contactUserId }, { name: 1 });
			// step1.name = contactName?.name || step1.name;
			if (!step1) return Promise.reject(MESSAGES.ERROR.USER_NOT_FOUND);
			const step2 = await chatDaoV1.mediaList(params, tokenData.userId);
			let param: any = {};
			param.members = { $all: [toObjectId(params.contactUserId), toObjectId(tokenData.userId)] }
			param.deletedBy = { $nin: [toObjectId(tokenData.userId)] }
			param.status = { $in: [STATUS.ACTIVE, STATUS.FORWARDED, STATUS.REPLIED] }
			param.messageType = { $in: [MESSAGE_TYPE.IMAGE, MESSAGE_TYPE.VIDEO, MESSAGE_TYPE.DOCS, MESSAGE_TYPE.LINK, MESSAGE_TYPE.STICKER] }
			const step3 = await chatDaoV1.countDocuments("messages", param);
			let data = {
				userDetails: step1,
				mediaDetails: step2,
				totalMediaTypes: step3
			}
			return MESSAGES.SUCCESS.LIST({ data: data });
		} catch (error) {
			throw error;
		}
	}

	/** 
	 * @function callInitiate
	 * start call with respective chatId for both groups and personal call
	*/
	async callInitiate(io: any, socket: any, params: ChatRequest.CallInitiate, ack: any, tokenData: TokenData) {
		try {
			if (!params.chatId || !params.mode) {
				ack(MESSAGES.ERROR.PARAMS_MISSING)
				return
			}
			const isUserExist = await userDaoV1.findUserById(tokenData.userId)
			if (!isUserExist) return ack(MESSAGES.ERROR.USER_NOT_FOUND);
			const group = await chatDaoV1.findOne("chats", { _id: params.chatId, deletedBy: { $nin: [tokenData.userId] } }, {});
			if (!group) return ack(MESSAGES.ERROR.CHAT_NOT_FOUND);
			const groupUser: any = await chatDaoV1.findOne("chats", { _id: params.chatId, members: { $in: tokenData.userId } });
			if (!groupUser) return ack(MESSAGES.ERROR.USER_NOT_FOUND);
			let isDelivered = [], isRead = [], members = [];
			isRead.push(params.userId);
			isDelivered.push(params.userId);
			members = group.members;
			const toReturn: any = {};
			const result: any = await imageUtil.createMeeting(tokenData);
			if (!result) return Promise.reject(MESSAGES.ERROR.SOMETHING_WENT_WRONG)

			toReturn.Meeting = result.Meeting,
				toReturn.type = group.type,
				toReturn.mode = params.mode,
				toReturn.members = groupUser.members,
				toReturn.Attendee = result.Attendees[0];
			toReturn.chatId = params.chatId;
			ack(toReturn);
			await redisClient.storeValue(SERVER.APP_NAME + "_" + params.chatId + REDIS_KEY_PREFIX.MEETING, result.Meeting);
			let isBlocked: boolean = false;
			if (group.type === CHAT_TYPE.ONE_TO_ONE) {
				let toCheck = groupUser.members
				toCheck = toCheck.filter((objectId) => objectId.toString() !== tokenData.userId.toString());
				const isBlockedData = await userDaoV1.findOne("users", { _id: toCheck, blocked: { $in: [toObjectId(tokenData.userId)] } });
				if (isBlockedData)
					isBlocked = true;
			}
			if (!isBlocked) {
				const toEmit: any = {};
				toEmit.Meeting = result.Meeting,
					toEmit.type = group.type,
					toEmit.mode = params.mode,
					toEmit.chatId = params.chatId,
					toEmit.userId = tokenData.userId,
					toEmit.members = groupUser.members,
					toEmit.eventType = SOCKET.LISTNER_TYPE.SOCKET_SERVICE.CALL_INITIATE;
				if (group.type == CHAT_TYPE.ONE_TO_ONE) {
					const receiverId = groupUser.members[0].toString() == tokenData.userId.toString() ? groupUser.members[1] : groupUser.members[0]
					// const contactData = await contactDaoV1.findOne("contacts", { contactUserId: tokenData.userId, userId: receiverId })
					// if (contactData) {
					// 	toEmit.name = contactData.name
					// 	toEmit.profilePicture = contactData.profilePicture
					// }
					toEmit.mobileNo = isUserExist.mobileNo
					toEmit.countryCode = isUserExist.countryCode

				}
				else {
					toEmit.name = groupUser.name
				}
				// for (let element of groupUser.members) {
				// 	if (element.toString() !== tokenData.userId.toString()) {
						// const isSubscribedUser = await this.checkUserSubscription(element.toString())
						// if (isSubscribedUser.isSubscribed || isSubscribedUser?.expiryTime < Date.now()) {
						// 	// const socket_user = await redisClient.getValue(SERVER.APP_NAME + "_" + (element).toString()+REDIS_KEY_PREFIX.SOCKET_ID);
						// 	// const contactUserIdSocket = io.sockets.sockets.get((socket_user));
						// 	// if (contactUserIdSocket) contactUserIdSocket.emit(SOCKET.LISTNER_TYPE.SOCKET_SERVICE.CALL_INITIATE, toEmit);
						// 	// else{
						// 	toEmit.receiverId = element;
						// 	let notificationData = {
						// 		type: NOTIFICATION_TYPE.CALL_NOTIFICATION,
						// 		title: toEmit.name || `${toEmit.countryCode} ${toEmit.mobileNo}`,
						// 		message: params.mode,
						// 		body: params.mode,
						// 		details: { ...toEmit, isCall: true }
						// 	}
						// 	await sendNotification(notificationData, socket.accessToken);

						// 	// }
						// }
				// 	}
				// }
			}
			return true;
		} catch (error) {
			throw error;
		}
	}

	/** 
	 * @function callDecline
	 * decline call with respective to chatId
	*/
	async callDecline(io: any, socket: any, params: ChatRequest.CallDecline, ack: any, tokenData: TokenData) {
		try {
			if (!params.chatId) {
				ack(MESSAGES.ERROR.PARAMS_MISSING)
				return
			}
			const isUserExist = await userDaoV1.findUserById(tokenData.userId)
			if (!isUserExist) return ack(MESSAGES.ERROR.USER_NOT_FOUND);
			const group = await chatDaoV1.findOne("chats", { _id: params.chatId, deletedBy: { $nin: [tokenData.userId] } }, {});
			if (!group) return ack(MESSAGES.ERROR.CHAT_NOT_FOUND);
			const groupUser: any = await chatDaoV1.findOne("chats", { _id: params.chatId, members: { $in: tokenData.userId } });
			if (!groupUser) return ack(MESSAGES.ERROR.USER_NOT_FOUND);

			let members = [];
			members = group.members;
			const toEmit: any = {};
			toEmit.type = group.type;
			toEmit.eventType = SOCKET.LISTNER_TYPE.SOCKET_SERVICE.CALL_DECLINE;
			toEmit.userId = tokenData.userId;
			toEmit.chatId = params.chatId;

			ack(toEmit);
			for (let element of groupUser.members) {
				if (element.toString() !== tokenData.userId.toString()) {
					const socket_user = await redisClient.getValue(SERVER.APP_NAME + "_" + (element).toString() + REDIS_KEY_PREFIX.SOCKET_ID);
					const contactUserIdSocket = socket_user ? socket.broadcast.to(socket_user) : undefined;//io.sockets.sockets.get((socket_user));
					if (contactUserIdSocket) contactUserIdSocket.emit(SOCKET.LISTNER_TYPE.SOCKET_SERVICE.CALL_DECLINE, toEmit);
					else {
						toEmit.receiverId = element;
						let notificationData = {
							type: NOTIFICATION_TYPE.DECLINE_NOTIFICATION,
							title: isUserExist.name,
							message: "Call Ended",
							body: "Call Ended",
							details: { ...toEmit, isCall: true }
						}
						// await sendNotification(notificationData, socket.accessToken);
					}
				}
			}

			return true;
		} catch (error) {
			throw error;
		}
	}

	/** 
	 * @function callAccept
	 * receive call
	*/
	async callAccept(io: any, socket: any, params: ChatRequest.CallAccept, ack: any, tokenData: TokenData) {
		try {
			if (!params.chatId) {
				ack(MESSAGES.ERROR.PARAMS_MISSING)
				return
			}
			const isUserExist = await userDaoV1.findUserById(tokenData.userId)
			if (!isUserExist) return ack(MESSAGES.ERROR.USER_NOT_FOUND);
			const group = await chatDaoV1.findOne("chats", { _id: params.chatId, deletedBy: { $nin: [tokenData.userId] } }, {});
			if (!group) return ack(MESSAGES.ERROR.CHAT_NOT_FOUND);
			const toEmit: any = {};
			toEmit.type = group.type;
			toEmit.eventType = SOCKET.LISTNER_TYPE.SOCKET_SERVICE.CALL_ACCEPT;
			toEmit.userId = tokenData.userId;
			toEmit.chatId = params.chatId;

			ack(toEmit);
			return true;
		} catch (error) {
			throw error;
		}
	}

	/** 
	 * @function callEnd
	 * end call
	 * delete meeting details after call ends
	*/
	async callEnd(io: any, socket: any, params: ChatRequest.CallEnd, ack: any, tokenData: TokenData) {
		try {
			if (!params.chatId && !params.meetingId) {
				ack(MESSAGES.ERROR.PARAMS_MISSING)
				return
			}
			const isUserExist = await userDaoV1.findUserById(tokenData.userId)
			if (!isUserExist) return ack(MESSAGES.ERROR.USER_NOT_FOUND);
			const chat = await chatDaoV1.findOne("chats", { _id: params.chatId, deletedBy: { $nin: [tokenData.userId] } }, {});
			if (!chat) return ack(MESSAGES.ERROR.CHAT_NOT_FOUND);

			const toEmit: any = {};
			toEmit.type = chat.type;
			toEmit.eventType = SOCKET.LISTNER_TYPE.SOCKET_SERVICE.CALL_END;
			toEmit.userId = tokenData.userId;
			toEmit.chatId = params.chatId;
			ack(toEmit);
			for (let element of chat.members) {
				if (element.toString() !== tokenData.userId.toString()) {
					const socket_user = await redisClient.getValue(SERVER.APP_NAME + "_" + (element).toString() + REDIS_KEY_PREFIX.SOCKET_ID);
					const contactUserIdSocket = socket_user ? socket.broadcast.to(socket_user) : undefined;//io.sockets.sockets.get((socket_user));
					if (contactUserIdSocket) contactUserIdSocket.emit(SOCKET.LISTNER_TYPE.SOCKET_SERVICE.CALL_END, toEmit);
					else {
						toEmit.receiverId = element;
						let notificationData = {
							type: NOTIFICATION_TYPE.DECLINE_NOTIFICATION,
							title: toEmit.name || `${toEmit.countryCode} ${toEmit.mobileNo}`,
							message: "call end",
							body: "call end",
							details: { ...toEmit, isCall: true }
						}
						// await sendNotification(notificationData, socket.accessToken);
					}
				}
			}
			await redisClient.deleteKey(SERVER.APP_NAME + "_" + params.chatId + REDIS_KEY_PREFIX.MEETING);
			return true;
		} catch (error) {
			throw error;
		}
	}

	/** 
	 * @function removeAttendees
	 * remove attendees from a meetingId wihtin chat call
	*/
	async removeAttendees(io: any, socket: any, params: ChatRequest.removeAttendees, ack: any, tokenData: TokenData) {
		try {
			if (!params.chatId && !params.meetingId && !params.attendeeId) {
				ack(MESSAGES.ERROR.PARAMS_MISSING)
				return
			}
			const chat = await chatDaoV1.findOne("chats", { _id: params.chatId, deletedBy: { $nin: [tokenData.userId] } }, {});
			if (!chat) return ack(MESSAGES.ERROR.CHAT_NOT_FOUND);
			// await imageUtil.deleteAttendees(params.attendeeId, params.meetingId);
			console.log("removeAttendees successfully")
			return ack(MESSAGES.SUCCESS.DELETE_MEETING);
		} catch (error) {
			throw error;
		}
	}


	// async sendChatNotification(socket: any, data: ChatRequest.CHAT_NOTIFICATION) {
	// 	try {
	// 		consolelog(`${data.details.receiverId}---sendChatNotification invoked chatId--->`, data.details.chatId, true)
	// 		let contact = await contactDaoV1.findOne("contacts", { userId: data.details.receiverId, contactUserId: data.details.senderId }, { name: 1 });
	// 		data.title = contact?.name || data.details.fullMobileNo;
	// 		if (data.details.type == CHAT_TYPE.ONE_TO_ONE) {
	// 			data.details.senderName = contact?.name || data.details.fullMobileNo;
	// 		}
	// 		console.log('**********contact***********', contact, data);
	// 		//check for subscription for a receiver user
	// 		// const isSubscribedUser = await this.checkUserSubscription(data.details.receiverId);
	// 		// if (isSubscribedUser.isSubscribed || isSubscribedUser?.expiryTime < Date.now()) {
	// 		// 	await this.sendSocketEvents(socket, SOCKET.LISTNER_TYPE.NOTIFY.NOTIFICATION, data);
	// 		// }
	// 		return true;
	// 	} catch (error) {
	// 		throw error;
	// 	}
	// }

	/** 
	 * @function currentCallStatus
	 * get current call status with params chatId for a user
	*/
	async currentCallStatus(io: any, socket: any, params: ChatRequest.UserCallStatus, ack: any, tokenData: TokenData) {
		try {
			if (!params.chatId) {
				ack(MESSAGES.ERROR.PARAMS_MISSING)
				return
			}
			const isUserExist = await userDaoV1.findUserById(tokenData.userId)
			if (!isUserExist) return ack(MESSAGES.ERROR.USER_NOT_FOUND);
			const chat = await chatDaoV1.findOne("chats", { _id: params.chatId, deletedBy: { $nin: [tokenData.userId] } }, {});
			if (!chat) return ack(MESSAGES.ERROR.CHAT_NOT_FOUND);
			const groupUser: any = await chatDaoV1.findOne("chats", { _id: params.chatId, members: tokenData.userId });
			if (!groupUser) return ack(MESSAGES.ERROR.USER_NOT_FOUND);
			let isCallOngoing = await redisClient.getValue(SERVER.APP_NAME + "_" + params.chatId + REDIS_KEY_PREFIX.MEETING);
			consolelog(`isCallOngoing`, isCallOngoing, true);
			const toEmit: any = {};
			toEmit.type = chat.type;
			toEmit.userId = tokenData.userId;
			toEmit.chatId = params.chatId;
			toEmit.isCallOngoing = isCallOngoing ? true : false
			ack(toEmit);
			return true;
		} catch (error) {
			throw error;
		}
	}

	/** 
	 * @function userCallStatus
	 * user call status is user is busy on another call
	*/
	async userCallStatus(io: any, socket: any, params: ChatRequest.UserCallStatus, ack: any, tokenData: TokenData) {
		try {
			if (!params.chatId) {
				ack(MESSAGES.ERROR.PARAMS_MISSING)
				return
			}
			const isUserExist = await userDaoV1.findUserById(tokenData.userId)
			if (!isUserExist) return ack(MESSAGES.ERROR.USER_NOT_FOUND);
			const group = await chatDaoV1.findOne("chats", { _id: params.chatId, deletedBy: { $nin: [tokenData.userId] } }, {});
			if (!group) return ack(MESSAGES.ERROR.CHAT_NOT_FOUND);
			const groupUser: any = await chatDaoV1.findOne("chats", { _id: params.chatId, members: { $in: tokenData.userId } });
			if (!groupUser) return ack(MESSAGES.ERROR.USER_NOT_FOUND);
			let members = [];
			members = group.members;
			const toEmit: any = {};
			toEmit.type = group.type;
			toEmit.userId = tokenData.userId;
			toEmit.chatId = params.chatId;
			toEmit.eventType = SOCKET.LISTNER_TYPE.SOCKET_SERVICE.USER_CALL_STATUS;

			ack(toEmit);
			for (let element of groupUser.members) {
				if (element.toString() !== tokenData.userId.toString()) {
					const socket_user = await redisClient.getValue(SERVER.APP_NAME + "_" + (element).toString() + REDIS_KEY_PREFIX.SOCKET_ID);
					const contactUserIdSocket = socket_user ? socket.broadcast.to(socket_user) : undefined;//io.sockets.sockets.get((socket_user));
					if (contactUserIdSocket) contactUserIdSocket.emit(SOCKET.LISTNER_TYPE.SOCKET_SERVICE.USER_CALL_STATUS, toEmit);
					else {
						consolelog(`************Push notification for user call status****************`, element, true);
					}
				}
			}
			return true;
		} catch (error) {
			throw error;
		}
	}

	// /**
	//  * @function checkSubscription
	//  * check subscription of a existing user
	// */
	// async checkSubscription(io: any, socket: any, params, ack: any, tokenData: TokenData) {
	// 	try {
	// 		consolelog(`************checkSubscription***************`, tokenData.userId, true);
	// 		let subscription: any = await redisClient.getValue(SERVER.APP_NAME + "_" + tokenData.userId + REDIS_KEY_PREFIX.SUBSCRIBED);
	// 		if (!subscription) {
	// 			subscription = await userDaoV1.findOne("users", { _id: tokenData.userId, isSubscribed: true }, {});
	// 		}
	// 		else {
	// 			subscription = JSON.parse(subscription);
	// 		}
	// 		consolelog(`${tokenData.userId}************checkSubscription***************`, subscription ? true : false, true);
	// 		let data = {
	// 			userId: tokenData.userId,
	// 			isSubscribed: true, // subscription ? true : false,
	// 			expiryTime: subscription?.expiryDate ? subscription?.expiryDate : subscription?.subscriptionExpiryDate
	// 		}
	// 		if (params.accessData) {
	// 			return data;
	// 		}
	// 		ack(data);
	// 		socket.emit(SOCKET.LISTNER_TYPE.USER.SUBSCRIPTION, data);
	// 		return;
	// 	} catch (error) {
	// 		throw error;
	// 	}
	// }

	// /**
	//  * @function checkUserSubscription
	//  * check subscription of a existing user
	// */
	// async checkUserSubscription(userId: string) {
	// 	try {
	// 		consolelog(`************checkSubscription***************`, userId, true);
	// 		let subscription: any = await redisClient.getValue(SERVER.APP_NAME + "_" + userId + REDIS_KEY_PREFIX.SUBSCRIBED);
	// 		if (!subscription) {
	// 			subscription = await userDaoV1.findOne("users", { _id: userId, isSubscribed: true }, {});
	// 		}
	// 		else {
	// 			subscription = JSON.parse(subscription);
	// 		}
	// 		consolelog(`${userId}************checkSubscription***************`, subscription ? true : false, true);
	// 		let data = {
	// 			userId: userId,
	// 			isSubscribed: true, // subscription ? true : false,
	// 			expiryTime: subscription?.expiryDate ? subscription?.expiryDate : subscription?.subscriptionExpiryDate
	// 		}
	// 		return data;

	// 	} catch (error) {
	// 		throw error;
	// 	}
	// }

	// /**
	//  * @function subscriptionExpired
	//  * subscription expired event
	// */
	// async subscriptionExpired(params: ChatRequest.userId) {
	// 	try {
	// 		consolelog(`************subscriptionExpired params***************`, params, true);
	// 		if (params.userId) {
	// 			let socket_user = await this.checkUserOnlineStatus(params.userId);
	// 			consolelog(`************socket_user subscription expired***************`, socket_user, true);
	// 			if (socket_user) {
	// 				const contactUserIdSocket = await SocketIO.io.in(socket_user).fetchSockets()[0];
	// 				if (contactUserIdSocket) {
	// 					let data = {
	// 						userId: params.userId,
	// 						isSubscribed: true // false
	// 					}
	// 					consolelog(`************socket_user subscription emit user***************`, data, true);
	// 					contactUserIdSocket.emit(SOCKET.LISTNER_TYPE.USER.SUBSCRIPTION, data);
	// 				}
	// 			}
	// 		}
	// 		return
	// 	} catch (error) {
	// 		throw error;
	// 	}
	// }
	/**
	 * @function userSetting
	 * userSetting for real offline events
	*/
	async userSetting(params: ChatRequest.userProfile, tokenData: TokenData) {
		try {
			consolelog(`************userSetting params***************`, params, true);
			consolelog(`************userSetting params***************`, tokenData, true);
			let isOnline = true;
			const userId = tokenData?.userId;
			if (userId) {
				let isOnline = params.offlineStatus ? false : true;
				let socket_user = await this.checkUserOnlineStatus(userId);
				consolelog(`************socket_user userSetting***************`, socket_user, true);
				if (socket_user) {
					let offline_status = await this.checkUserOfflineOverallStatus(userId, userId);
					if (offline_status) isOnline = false;
					SocketIO.io.emit(SOCKET.LISTNER_TYPE.USER.USER_STATUS, {
						userId: userId,
						isOnline: isOnline,
						lastSeen: Date.now()
					});
				}
			}
			return
		} catch (error) {
			throw error;
		}
	}
	/**
	 * @function userNotificationCount
	 * notificationCount for lang chat and lang social
	*/
	async userNotificationCount(io: any, socket: any, params: ChatRequest.UserCallStatus, ack: any, tokenData: TokenData) {
		try {
			const toEmit: any = {};
			toEmit.unReadChatMessages = 0;
			toEmit.unReadLangSocial = 0;
			toEmit.eventType = SOCKET.LISTNER_TYPE.SOCKET_SERVICE.HOME_NOTIFICATION_COUNT;
			const [unReadLangChat, unReadLangSocial] = await Promise.all([
				baseDao.count(this.modelMessage, {
					members: toObjectId(tokenData.userId), "isRead": { $nin: [toObjectId(tokenData.userId)] }, deletedBy: { $nin: [toObjectId(tokenData.userId)] }
				}),
				baseDao.findOne("users", { _id: tokenData.userId }, { notificationCount: 1 })
			])
			if (unReadLangChat) {
				toEmit.unReadChatMessages = unReadLangChat;
			}
			if (unReadLangSocial) {
				toEmit.unReadLangSocial = unReadLangSocial.notificationCount;
			}
			ack(toEmit);
			return
		} catch (error) {
			throw error;
		}
	}

	async deleteUserHandling(tokenData: TokenData) {
		try {
			const userId = tokenData.userId;
			console.log('userId', userId)
			let keys: any = await redisClient.getKeys(`*${SERVER.APP_NAME}_${userId}*`);
			console.info("Before [deleteUserHandling] redis keys for deletion ****************************", keys)
			const [deleteChat, removeGroups, deleteMessages, deleteOtherContacts] = await Promise.all([
				await chatDaoV1.updateMany("chats", {
					deletedBy: { $nin: [toObjectId(userId)] },
					"$or": [{
						"members": userId
					}, {
						"exitedBy": userId
					}]
				}, { $addToSet: { deletedBy: userId }, $pull: { exitedBy: userId, admins: userId } }, {}),
				await chatDaoV1.updateMany("chats", {
					type: CHAT_TYPE.GROUP ,
					"$or": [{
						"members": userId
					}, {
						"exitedBy": userId
					}]
				}, { $pull: { members: userId } }, {}),
				await baseDao.updateMany(this.modelMessage, {
					deletedBy: { $nin: [toObjectId(userId)] },
					"members": userId
				}, { $addToSet: { deletedBy: userId } }, {}),
				// contactDaoV1.updateMany("contacts", { contactUserId: tokenData.userId }, { isAppUser: false }, {}),
				// contactDaoV1.deleteMany("contacts", { userId: tokenData.userId }),
				await redisClient.deleteKey(keys)
			]);
			consolelog(`deleteUserHandling deleteChat`, deleteChat, true);
			consolelog(`deleteUserHandling deleteMessages`, deleteMessages, true);
			keys = await redisClient.getKeys(`*${SERVER.APP_NAME}_${userId}*`);
			console.info("After [deleteUserHandling] redis keys for deletion", keys);
			const group_admins = await chatDaoV1.find("chats", { type: CHAT_TYPE.GROUP, admins: [] }, {});
			if (group_admins?.length) {
				for (let i = 0; i < group_admins.length; i++) {
					let admin = group_admins[i].members[0];
					await chatDaoV1.findOneAndUpdate("chats", { _id: group_admins[i]._id }, { $push: { admins: admin } }, {});
				}
			}
		} catch (error) {
			throw error;
		}
	}
}

export const chatController = new ChatController();