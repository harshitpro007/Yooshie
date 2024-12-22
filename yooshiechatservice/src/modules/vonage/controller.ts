import { DB_MODEL_REF, MESSAGES, USER_TYPE } from "@config/constant";
import { BaseDao } from "@modules/baseDao";
import { userDaoV1 } from "@modules/user";
import { generateRandomString } from "@utils/appUtils";
import { readFile } from "fs";
import { promisify } from "util";

const Nexmo = require('nexmo');
const { Vonage } = require('@vonage/server-sdk')
const VONAGE_PRIVATE_KEY_PATH = process.cwd() + "/keys/private.key";
export class SmsProxy extends BaseDao {
    public nexmo: any;
    public chat: { userA: any; userB: any; };

    constructor() {

        super();
        this.nexmo = new Nexmo({
            apiKey: "a5d555b1",
            apiSecret: "Yooshie@1"
        }, {
                debug: true
            });
    }

    async createChat(userANumber, userBNumber) {
        this.chat = {
            userA: userANumber,
            userB: userBNumber
        };
    
        await this.sendSMS();
    }

    async sendSMS() {
        /*
            Send a message from userA to the virtual number
        */
        await this.nexmo.message.sendSms(process.env.VIRTUAL_NUMBER,
                                    this.chat.userA,
                                    'Reply to this SMS to talk to UserA');
    
        /*
            Send a message from userB to the virtual number
        */
        await this.nexmo.message.sendSms(process.env.VIRTUAL_NUMBER,
                                    this.chat.userB,
                                    'Reply to this SMS to talk to UserB');

        await this.proxySms(this.chat.userA, "sghdfydrsgtyjgku")
    }

    async proxySms(from, text) {
        // Determine which real number to send the SMS to
        const destinationRealNumber = await this.getDestinationRealNumber(from);
    
        if (destinationRealNumber  === null) {
            console.log(`No chat found for this number`);
            return;
        }
        
        console.log(destinationRealNumber);
        // Send the SMS from the virtual number to the real number
        await this.nexmo.message.sendSms(process.env.VIRTUAL_NUMBER,
                                    destinationRealNumber,
                                    text);
    }

    async getDestinationRealNumber(from) {
        let destinationRealNumber = null;
    
        // Use `from` numbers to work out who is sending to whom
        const fromUserA = (from === this.chat.userA);
        const fromUserB = (from === this.chat.userB);
    
        if (fromUserA || fromUserB) {
            destinationRealNumber = fromUserA ? this.chat.userB : this.chat.userA;
        }
    
        return destinationRealNumber;
    }

    async readPrivateKey(): Promise<string> {
		return promisify(readFile)(VONAGE_PRIVATE_KEY_PATH, "utf8");
	}

    async vonageSend(parmas) {
        const modelUser:any = DB_MODEL_REF.USER;
        const modelConversation:any = DB_MODEL_REF.CONVERSATION;
        const modelEvent: any = DB_MODEL_REF.EVENTS;
		const VONAGE_APPLICATION_ID = "bd0a65c3-4a57-4db9-ba67-568ca7850330";
		const fromUserDetails = await this.findOne(modelUser,{_id:parmas.fromId, vonageUserId : {$exists: true}});
        const toUserDetails = await this.findOne(modelUser,{_id:parmas.toId, vonageUserId : {$exists: true}});
        if(!fromUserDetails || !toUserDetails){
            return Promise.reject(MESSAGES.ERROR.USER_NOT_FOUND);
        }
        const memberIds = [fromUserDetails.vonageUserId,toUserDetails.vonageUserId];
        let conversationDetails = await this.findOne(modelConversation, {users: {$in: [fromUserDetails.vonageUserId,toUserDetails.vonageUserId]}});
        if(!conversationDetails){
            conversationDetails = await this.createGroup(memberIds);
        }
		// Load the private key as a string
		const privateKey = await this.readPrivateKey();

		// Initialize Vonage SDK
		const vonage = new Vonage({
			applicationId: VONAGE_APPLICATION_ID,
			privateKey: privateKey, // Pass the private key string
			apiKey: "a5d555b1",
      		apiSecret: "Yooshie@1",
		});

		try {
			// const token = jwt.sign(
			// 	{
			// 		application_id: VONAGE_APPLICATION_ID,
			// 	},
			// 	privateKey,
			// 	{ algorithm: 'RS256', expiresIn: '2h' }
			// );

			// console.log(token);
			const response = await vonage.sms.send({
				to: toUserDetails.fullMobileNo,
				from: fromUserDetails.fullMobileNo,
				text: parmas.message,
				message_type: 'text',
				channel: 'sms'
			  });
			console.log(response);
            const newMessage = {
                conversationId: conversationDetails?.conversationId ? conversationDetails?.conversationId : conversationDetails?.conversation.id ,
                senderId: parmas.fromId,
                message: parmas.message,
                members: conversationDetails.members,
                users: memberIds,
                type: 'text',
                timestamp: new Date(),
            };
    
            await this.save(modelEvent, newMessage);
            console.log("Message saved to database: ", newMessage);
            return response;
		} catch (error) {
			console.error('Error sending SMS:', error);
		}
	}


    async createUser(userId){
        const modelUser:any = DB_MODEL_REF.USER
        const modelAdmin: any = DB_MODEL_REF.ADMIN;
        const privateKey = await this.readPrivateKey();
        const vonage = new Vonage({
            applicationId: "bd0a65c3-4a57-4db9-ba67-568ca7850330",
            privateKey: privateKey
        });
        console.log(userId);
        try{
            const userData = await userDaoV1.findUserById(userId);
            const name = userData?.name || generateRandomString(10)
            let user;
            if(!userData.vonageUserId){
                user = await vonage.users.createUser({ name });
                if(userData.userType == USER_TYPE.USER){
                    await this.findOneAndUpdate(modelUser, {_id: userId}, {vonageUserId: user.id})
                }
                else{
                    await this.findOneAndUpdate(modelAdmin, {_id: userId}, {vonageUserId: user.id})
                }
            }
            else{
                return Promise.reject(MESSAGES.ERROR.USER_ALREADY_EXISTS);
            }
            console.log("$$$$$$$$$", user);
            return user;
        }   
        catch(error){
            throw error;
        }
    }

    async createGroup(memberIds){
        // const model:any = DB_MODEL_REF.CONVERSATION;
        const privateKey = await this.readPrivateKey();
        const vonage = new Vonage({
            applicationId: "bd0a65c3-4a57-4db9-ba67-568ca7850330",
            privateKey: privateKey
        });
        const groupName = generateRandomString(10)
        try{
            const conversation = await vonage.conversations.createConversation({ name: groupName });
            console.log("$$$$$$$$", conversation);
            // let groupChats = {};
            // groupChats[conversation.id] = { groupName, members: memberIds };
            const conversationId = conversation.id;
            console.log("Id", conversationId);
            const members = [];
            for (const memberId of memberIds) {
                console.log("$$$$$$$", memberId);
                try{
                    const member = await vonage.conversations.createMember(conversationId, {
                        state: 'JOINED',
                        "user": { "id": memberId},
                        channel: {
                            type: 'app',
                        },
                    });
                    members.push(member.id);
                }
                catch(error){
                    console.log("Error", error);
                }
            }
            // const newConversation = {
            //     conversationId: conversationId,
            //     groupName,
            //     members: members,
            //     users: memberIds
            // };
    
            // await this.save(model, newConversation);
            // console.log("Conversation saved to database: ", newConversation);
    
            return {conversation:conversation, members:members};
        }
        catch(error){
            throw error;
        }
    }

    async createEvents(params){
        const model:any = DB_MODEL_REF.EVENTS;
        const modelConversation:any = DB_MODEL_REF.CONVERSATION;
        const privateKey = await this.readPrivateKey();
        const vonage = new Vonage({
            applicationId: "bd0a65c3-4a57-4db9-ba67-568ca7850330",
            privateKey: privateKey
        });
        try{
            const conversation = await this.findOne(modelConversation, {conversationId: params.conversationId});
            if(!conversation){
                throw new Error("Conversation not found");
            }
            console.log("%%%%%%%%", conversation);
            let event;
            try{
                event = await vonage.conversations.createEvent(
                    params.conversationId,
                    {
                        'type': 'text',
                        'from': params.memberId,
                        'body': {
                            'text': params.message,
                        },
                    },
                )
                console.log(event);
            }
            catch(error){
                console.log("Error", error);
            }

            const newMessage = {
                conversationId: params.conversationId,
                senderId: params.memberId,
                message: params.message,
                members: conversation.members,
                type: 'text',
            };
    
            await this.save(model,newMessage);
            console.log("Message saved to database: ", newMessage);
    
            return event;
        }
        catch(error){
            throw error;
        }
    }

    async getMessagesListing(conversationId){
        try{
            const model:any = DB_MODEL_REF.EVENTS;
            const messages = await this.find(model, {conversationId: conversationId}, {}, {sort: {created:-1}});
            return MESSAGES.SUCCESS.DETAILS(messages);
        }
        catch(error){
            throw error;
        }
    }

    async createCall(params, tokenData){
        const privateKey = await this.readPrivateKey();
		const vonage = new Vonage({
			apiKey: "a5d555b1",
			apiSecret: "Yooshie@1",
			applicationId: "bd0a65c3-4a57-4db9-ba67-568ca7850330",
			privateKey: privateKey
		});

		const callData = {
			to: [{ type: "app", user: params.receiverId }],
			from: { type: "app", user: tokenData.userId },
			ncco: [
				{
					action: "talk",
					text: `Incoming call`
				},
				{
					action: "connect",
					endpoint: [
						{
							type: "app",
							user: params.receiverId
						}
					]
				}
			]
		};
		vonage.calls.create(callData, (err, response) => {
			if (err) {
				console.error('Vonage call initiation error:', err);
			} else {
				console.log('Vonage call initiated:', response);
			}
		});
	}
}

export const smsProxy = new SmsProxy();