"use strict";

import { BaseDao } from "@modules/baseDao/BaseDao";
import { STATUS, MESSAGE_TYPE, CHAT_TYPE, CHAT_BOX_PAGINATION, } from "@config/constant";
import { escapeSpecialCharacter, toObjectId } from "@utils/appUtils";

export class ChatDao extends BaseDao {

	/**
	 * @function isChatExists
	 * check one to one check existence b/w users on the basic of members ids
	 */
	async isChatExists(members: Array<string>) {
		try {
			const query: any = {
				members: { $all: members },
				type: CHAT_TYPE.ONE_TO_ONE,
			};
			return await this.findOne("chats", query);
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @function findActiveGroup
	 * get active list of a group for a user if he is present in that group 
	 */
	async findActiveGroup(params: ChatRequest.VIEW_GROUP, userId: string) {
		try {
			const query: any = {
				_id: params.groupId,
				type: CHAT_TYPE.GROUP,
				deletedBy: { $nin: [userId] }
			};
			return await this.findOne("chats", query);
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @function findChatById
	 * get chat details with a chat id
	 */
	async findChatById(_id: string) {
		try {
			const query: any = {
				_id: _id,
				status: STATUS.ACTIVE
			};
			return await this.findOne("chats", query);
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @function chatList
	 *  get the list of all inbox chat for a user
	 */
	async chatList(params: ListingRequest, userId: string) {
		try {
			if(params.type == CHAT_TYPE.ONE_TO_ONE){
				const data = await this.oneToOneChatListing(params, userId);
				return data;
			}
			else{
				const data = await this.groupChatListing(params, userId);
				return data;
			}
		} catch (error) {
			throw error;
		}
	}

	async oneToOneChatListing(params: any, userId: string){
		try{
			const aggPipe = [];
			const match: any = {};
			match.deletedBy = { $nin: [toObjectId(userId)] }
			match["$or"] = [{
				"members": toObjectId(userId)
			}, {
				"exitedBy": toObjectId(userId)
			}]
			match.lastMsgId = { $exists: true };//not allowed chat formatted room
			
			if (params.type) { match.type = params.type };
			if (Object.keys(match).length) aggPipe.push({ "$match": match });
			if (params.limit && params.pageNo) {
				const [skipStage, limitStage] = this.addSkipLimit(
					params.limit,
					params.pageNo,
				);
				aggPipe.push(skipStage, limitStage);
			}
			aggPipe.push({
				"$lookup": {
					from: "users",
					let: { userIds: '$members' },
					pipeline: [
						{
							$match: {
								$expr: {
									$and: [
										{ $in: ['$_id', '$$userIds'] },
										{ $ne: ['$_id', toObjectId(userId)] }
									]
								}
							}
						},
						{
							"$project": {
								profilePicture: 1,
								_id: 1,
								countryCode: 1,
								mobileNo: 1,
								language: 1,
								name: 1,
								status: 1,
								flagCode: 1,
								about: 1
							}
						}
					],
					as: "user"
				}
			});
			
			aggPipe.push({
				"$lookup": {
					from: "admins",
					let: { userIds: '$members' },
					pipeline: [
						{
							$match: {
								$expr: {
									$and: [
										{ $in: ['$_id', '$$userIds'] },
										{ $ne: ['$_id', toObjectId(userId)] }
									]
								}
							}
						},
						{
							"$project": {
								profilePicture: 1,
								_id: 1,
								countryCode: 1,
								mobileNo: 1,
								language: 1,
								name: 1,
								status: 1,
								flagCode: 1,
								about: 1
							}
						}
					],
					as: "assistant"
				}
			});

			aggPipe.push({
				$addFields: {
					user: {
						$concatArrays: [
							{ $ifNull: ["$user", []] },
							{ $ifNull: ["$assistant", []] }
						]
					}
				}
			});

			aggPipe.push({
				"$unwind": "$user"
			});
			
			aggPipe.push({
				$unset: ["assistant"]
			});

			aggPipe.push({
				"$lookup": {
					from: "messages",
					let: {
						chatId: "$_id", userId: toObjectId(userId)
					},
					'pipeline': [{
						$match: {
							$expr: {
								$and: [
									{
										$eq: ["$$chatId", "$chatId"]
									},
									{
										$not: {
											$in: ["$$userId", "$deletedBy"]
										}
									}
								],
							}
						}
					},
					{
						$sort: {
							"created": -1
						}
					},
					{ $limit: 1 },
					{
						$project: {
							message: 1,        
							messageType: 1,    
							created: 1         
						}
					}
					],
					as: "last_message"
				}
			});
			aggPipe.push({
				"$unwind": "$last_message"
			});
			// aggPipe.push({
			// 	$addFields: { last_message: { $arrayElemAt: ["$last_message", 0] } }
			// });
			
			// aggPipe.push({
			// 	$addFields: {
			// 		"user.last_message": "$last_message",
			// 	}
			// });
			aggPipe.push({
				$addFields: {
					"lastMsgCreated": {
						"$cond": {
							"if": {
								"$ne": ["$last_message", []]
							},
							"then": "$last_message.created",
							"else": 0
						}
					}
				}
			});
			aggPipe.push({ "$unwind": "$lastMsgCreated" });

			aggPipe.push({
				$addFields: { "unread_messages": 0 }
			});
			const options = { collation: true };
			aggPipe.push({
				"$project": {
					_id: 1, type: 1, created: 1, user: 1, last_message:1, unread_messages: 1, lastMsgCreated: 1, createdBy: 1,
				}
			});
			let sort = {};
			(params.sortBy && params.sortOrder) ? sort = { [params.sortBy]: params.sortOrder } : sort = { lastMsgCreated: -1, created: -1 };
			aggPipe.push({ "$sort": sort });
			return await this.dataPaginate("chats", aggPipe, params.limit, params.pageNo, options, true);
		}
		catch(error){
			throw error;
		}
	}

	async groupChatListing(params:any, userId: string){
		try{
			const aggPipe = [];
			const match: any = {};
			match.deletedBy = { $nin: [toObjectId(userId)] }
			match["$or"] = [{
				"members": toObjectId(userId)
			}, {
				"exitedBy": toObjectId(userId)
			}]
			match.lastMsgId = { $exists: true };//not allowed chat formatted room
			
			if (params.type) { match.type = params.type };
			if (Object.keys(match).length) aggPipe.push({ "$match": match });
			if (params.limit && params.pageNo) {
				const [skipStage, limitStage] = this.addSkipLimit(
					params.limit,
					params.pageNo,
				);
				aggPipe.push(skipStage, limitStage);
			}
			aggPipe.push({
				"$lookup": {
					from: "users",
					let: {
						userIds: '$members'
					},
					'pipeline': [{
						$match: {
							$expr: {
								$in: ['$_id', '$$userIds']
							}
						},
					},
					{ "$project": { profilePicture: 1, _id: 1, countryCode: 1, mobileNo: 1, language: 1, name: 1, status: 1, flagCode: 1, about: 1 } }
					],
					as: "users"
				}
			})
			aggPipe.push({
				"$lookup": {
					from: "admins",
					let: {
						userIds: '$members'
					},
					'pipeline': [{
						$match: {
							$expr: {
								$in: ['$_id', '$$userIds']
							}
						},
					},
					{ "$project": { profilePicture: 1, _id: 1, countryCode: 1, mobileNo: 1, language: 1, name: 1, status: 1, flagCode: 1, about: 1 } }
					],
					as: "assistants"
				}
			})

			aggPipe.push({
				$addFields: {
					users: {
						$concatArrays: [
							{ $ifNull: ["$users", []] },
							{ $ifNull: ["$assistants", []] }
						]
					}
				}
			});

			aggPipe.push({
				$unset: ["assistants"]
			});

			aggPipe.push({
				"$lookup": {
					from: "users",
					let: {
						userIds: '$overallMembers'
					},
					'pipeline': [{
						$match: {
							$expr: {
								$in: ['$_id', '$$userIds']
							}
						},
					},
					{ "$project": { profilePicture: 1, _id: 1, countryCode: 1, mobileNo: 1, language: 1, name: 1, status: 1, flagCode: 1, about: 1 } }
					],
					as: "overAllMembersDetails"
				}
			});

			aggPipe.push({
				"$lookup": {
					from: "admins",
					let: {
						userIds: '$overallMembers'
					},
					'pipeline': [{
						$match: {
							$expr: {
								$in: ['$_id', '$$userIds']
							}
						},
					},
					{ "$project": { profilePicture: 1, _id: 1, countryCode: 1, mobileNo: 1, language: 1, name: 1, status: 1, flagCode: 1, about: 1 } }
					],
					as: "assistantsDetails"
				}
			});

			aggPipe.push({
				$addFields: {
					overAllMembersDetails: {
						$concatArrays: [
							{ $ifNull: ["$overAllMembersDetails", []] },
							{ $ifNull: ["$assistantsDetails", []] }
						]
					}
				}
			});

			aggPipe.push({
				$unset: ["assistantsDetails"]
			});

			aggPipe.push({
				"$lookup": {
					from: "messages",
					let: {
						chatId: "$_id", userId: toObjectId(userId)
					},
					'pipeline': [{
						$match: {
							$expr: {
								$and: [
									{
										$eq: ["$$chatId", "$chatId"]
									},
									{
										$not: {
											$in: ["$$userId", "$deletedBy"]
										}
									}
								],
							}
						}
					},
					{
						$sort: {
							"created": -1
						}
					},
					{ $limit: 1 },
					{
						$project: {
							message: 1,        
							messageType: 1,    
							created: 1         
						}
					}
					],
					as: "last_message"
				}
			});
			aggPipe.push({
				"$lookup": {
					from: "messages",
					localField: 'last_message.messageId',
					foreignField: '_id',
					as: "messageIdDetails"
				}
			});
			aggPipe.push({
				$addFields: { "last_message.messageIdDetails": "$messageIdDetails" }
			});
			aggPipe.push({
				$addFields: {
					"lastMsgCreated": {
						"$cond": {
							"if": {
								"$ne": ["$last_message", []]
							},
							"then": "$last_message.created",
							"else": 0
						}
					}
				}
			});
			aggPipe.push({ "$unwind": "$lastMsgCreated" });

			aggPipe.push({
				$addFields: { "unread_messages": 0 }
			});
			const options = { collation: true };
			aggPipe.push({
				"$project": {
					_id: 1, type: 1, created: 1, exitedBy: 1, last_message: 1, users: 1, overAllMembersDetails: 1, unread_messages: 1, name: 1, lastMsgCreated: 1, lastMsgIdByUsers: 1, groupProfilePicture: 1, admins: 1, createdBy: 1, description: 1, mutedBy: 1
				}
			});
			let sort = {};
			(params.sortBy && params.sortOrder) ? sort = { [params.sortBy]: params.sortOrder } : sort = { lastMsgCreated: -1, created: -1 };
			aggPipe.push({ "$sort": sort });
			return await this.dataPaginate("chats", aggPipe, params.limit, params.pageNo, options, true);
		}
		catch(error){
			throw error;
		}
	}

	/**
	 * @function chatBox
	 * get current chatId details for chatList box
	 */
	async chatBox(params: ChatRequest.chatBox, userId: string) {
		try {
			const aggPipe = [];
			const match: any = {};
			match.status = { "$ne": STATUS.DELETED }
			match.lastMsgId = { $exists: true };
			match._id = toObjectId(params.chatId);
			match["$or"] = [{
				"members": toObjectId(userId)
			}, {
				"exitedBy": toObjectId(userId)
			}]
			match.type = { $in: [CHAT_TYPE.ONE_TO_ONE, CHAT_TYPE.GROUP] }
			match.deletedBy = { $nin: [toObjectId(userId)] }
			if (Object.keys(match).length) aggPipe.push({ "$match": match });
			aggPipe.push({
				"$lookup": {
					from: "users",
					let: {
						userIds: '$members'
					},
					'pipeline': [{
						$match: {
							$expr: {
								$in: ['$_id', '$$userIds']
							}
						},
					},
					{ "$project": { profilePicture: 1, _id: 1, countryCode: 1, mobileNo: 1, language: 1, name: 1, status: 1, flagCode: 1, about: 1 } }
					],
					as: "users"
				}
			})
			aggPipe.push({
				"$lookup": {
					from: "users",
					let: {
						userIds: '$overallMembers'
					},
					'pipeline': [{
						$match: {
							$expr: {
								$in: ['$_id', '$$userIds']
							}
						},
					},
					{ "$project": { profilePicture: 1, _id: 1, countryCode: 1, mobileNo: 1, language: 1, name: 1, status: 1, flagCode: 1, about: 1 } }
					],
					as: "overAllMembersDetails"
				}
			})
			aggPipe.push({
				"$lookup": {
					from: "messages",
					let: {
						chatId: "$_id", userId: toObjectId(userId)
					},
					'pipeline': [{
						$match: {
							$expr: {
								$and: [
									{
										$eq: ["$$chatId", "$chatId"]
									},
									{
										$not: {
											$in: ["$$userId", "$deletedBy"]
										}
									}
								],
							}
						}
					},
					{
						$sort: {
							"created": -1
						}
					},
					{ $limit: 1 }
					],
					as: "last_message"
				}
			});
			aggPipe.push({
				"$lookup": {
					from: "messages",
					localField: 'last_message.messageId',
					foreignField: '_id',
					as: "messageIdDetails"
				}
			});
			aggPipe.push({
				$addFields: { "last_message.messageIdDetails": "$messageIdDetails" }
			});
			aggPipe.push({
				$addFields: { "unread_messages": 0 }
			});
			const options = { collation: true };
			aggPipe.push({
				"$project": {
					_id: 1, type: 1, created: 1, exitedBy: 1, last_message: 1, users: 1, overAllMembersDetails: 1, unread_messages: 1, name: 1, lastMsgCreated: 1, lastMsgIdByUsers: 1, groupProfilePicture: 1, admins: 1, createdBy: 1, description: 1, mutedBy: 1
				}
			});
			return await this.paginate("chats", aggPipe, CHAT_BOX_PAGINATION.limit, CHAT_BOX_PAGINATION.pageNo, options);
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @function messageList
	 * get inbox message details with chatId for a user
	 */
	async messageList(params: ChatRequest.MessageList, userId: string) {
		try {
			const aggPipe = [];
			const match: any = {};
			match.chatId = toObjectId(params.chatId);
			match.deletedBy = { $nin: [toObjectId(userId)] };
			match.members = { $in: [toObjectId(userId)] };
			match.status = { $in: [STATUS.ACTIVE, STATUS.FORWARDED, STATUS.REPLIED, STATUS.DELETED] };//deleted messages also seen at both end
			match.created = { $lt: params.lastMessageCreated };
			if (params.searchKey) {
				params.searchKey = escapeSpecialCharacter(params.searchKey);
				match.message = { "$regex": params.searchKey, "$options": "-i" };
			}
			if (Object.keys(match).length) aggPipe.push({ "$match": match });
			let sort = {};
			sort = { createdAt: -1 };
			aggPipe.push({ "$sort": sort });
			if (params.limit && params.pageNo) {
				const [skipStage, limitStage] = this.addSkipLimit(
					params.limit,
					params.pageNo,
				);
				aggPipe.push(skipStage, limitStage);
			}
			aggPipe.push({
				"$project": {
					_id: 1,
					type: 1,
					created: 1,
					members: 1,
					isRead: 1,
					isDelivered: 1,
					senderId: 1,
					message: 1,
					mediaUrl: 1,
					messageType: 1,
					reaction: 1,
					createdAt: 1,
					location: 1,
					userLang: 1,
					translatedMessages: 1,
					size: 1,
					thumbnailUrl: 1,
					transcribe: 1,
					status: 1,
					messageId: 1,
					taggedUser: 1,
					blockedMessage: 1,
					imageRatio: 1,
					localUrl: 1,
					chatId: 1
				}
			});
			aggPipe.push({
				"$lookup": {
					from: "users",
					let: {
						userIds: '$members'
					},
					'pipeline': [{
						$match: {
							$expr: {
								$in: ['$_id', '$$userIds']
							}
						},
					},
					{ "$project": { profilePicture: 1, _id: 1, countryCode: 1, mobileNo: 1, language: 1, status: 1, name: 1, flagCode: 1, about: 1 } }
					],
					as: "membersDetails"
				}
			})
			aggPipe.push({
				"$lookup": {
					from: "admins",
					let: {
						userIds: '$members'
					},
					'pipeline': [{
						$match: {
							$expr: {
								$in: ['$_id', '$$userIds']
							}
						},
					},
					{ "$project": { profilePicture: 1, _id: 1, countryCode: 1, mobileNo: 1, language: 1, status: 1, name: 1, flagCode: 1, about: 1 } }
					],
					as: "assistantDetails"
				}
			})
			aggPipe.push({
				$addFields: {
					membersDetails: {
						$concatArrays: [
							{ $ifNull: ["$membersDetails", []] },
							{ $ifNull: ["$assistantDetails", []] }
						]
					}
				}
			});

			aggPipe.push({
				$unset: ["assistantDetails"]
			});

			aggPipe.push({
				"$lookup": {
					from: "messages",
					localField: 'messageId',
					foreignField: '_id',
					as: "messageIdDetails"
				}
			})
			const options = { collation: true };
			return await this.paginate("messages", aggPipe, params.limit, params.pageNo, options);
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @function mediaList
	 * get media list for a chat
	 */
	async mediaList(params: ChatRequest.Id, userId: string) {
		try {
			const aggPipe = [];
			const match: any = {};
			if (params.groupId) {
				match.chatId = toObjectId(params.groupId)
			} else {
				match.members = { $all: [toObjectId(params.contactUserId), toObjectId(userId)] }
			}
			match.messageType = { $in: [params.type] }
			if (params.type == MESSAGE_TYPE.MEDIA) match.messageType = { $in: [MESSAGE_TYPE.IMAGE, MESSAGE_TYPE.VIDEO] }
			match.deletedBy = { $nin: [toObjectId(userId)] }
			match.status = { $in: [STATUS.ACTIVE, STATUS.FORWARDED, STATUS.REPLIED] }
			if (Object.keys(match).length) aggPipe.push({ "$match": match });
			let sort = {};
			sort = { createdAt: -1 };
			aggPipe.push({ "$sort": sort });
			if (params.limit && params.pageNo) {
				const [skipStage, limitStage] = this.addSkipLimit(
					params.limit,
					params.pageNo,
				);
				aggPipe.push(skipStage, limitStage);
			}
			aggPipe.push({
				"$project": {
					_id: 1,
					type: 1,
					created: 1,
					members: 1,
					isRead: 1,
					isDelivered: 1,
					senderId: 1,
					message: 1,
					mediaUrl: 1,
					messageType: 1,
					reaction: 1,
					createdAt: 1,
					thumbnailUrl: 1,
					size: 1,
					transcribe: 1,
					location: 1,
					status: 1,
					blockedMessage: 1,
					chatId: 1,
					imageRatio: 1,
					localUrl: 1
				}
			});
			const options = { collation: true };
			return await this.paginate("messages", aggPipe, params.limit, params.pageNo, options, true);
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @function deleteChat
	 * delete a chat for a user from the chat-list with ChatId
	 */
	async deleteChat(params: ChatRequest.ChatId, tokenData: TokenData) {
		try {
			const update = {};
			update["$addToSet"] = { deletedBy: [tokenData.userId] };
			return await this.findOneAndUpdate("chats", { _id: params.chatId }, update);
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @function deleteMessages
	 * clear all messages for a chat of a user with chatId but chat room will exits in chat list
	 */
	async deleteMessages(params: ChatRequest.ChatId, tokenData: TokenData) {
		try {
			const update = {};
			update["$addToSet"] = { deletedBy: [tokenData.userId] };
			return await this.updateMany("messages", { chatId: params.chatId }, update, {});
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @function deleteMessagesById
	 * delete (for me / for everyone) a message from the chat room with messageId 
	 */
	async deleteMessagesById(params: ChatRequest.DeleteMessages, tokenData: TokenData) {
		try {
			const update: any = {};
			if (!params.isDeleteForEveryone) {
				update["$addToSet"] = { deletedBy: [tokenData.userId] };
			}
			const query: any = {}
			query._id = params.messageId
			if (params.isDeleteForEveryone) {
				update.status = STATUS.DELETED
			}
			return await this.findOneAndUpdate("messages", query, update, { new: true });
		} catch (error) {
			throw error;
		}
	}
}

export const chatDao = new ChatDao();