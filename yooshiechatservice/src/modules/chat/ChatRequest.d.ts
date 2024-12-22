declare namespace ChatRequest {

	export interface Id extends Pagination {
		contactUserId: string;
		type?:string;
		groupId?:string;
		reason?:string;
	}

	export interface Text extends Pagination {
		searchKey: string;
	}
	export interface Add {
		contactUserId: string;
		accessData?:boolean
	}
	export interface ONE_TO_ONE_CHAT_MESSAGE {
		contactUserId: string;
		senderId: string;
		chatId: string;
		message?: string;
		mediaUrl?: string;
		messageType: string;
		languageCode: string;
		localMessageId?: string;
		thumbnailUrl?:string;
		location?: {
			lat: Number,
			long: Number
		},
		size?: string;
		transcribe?:string;
		status?: string;	
		imageRatio?:number
		localUrl?:string;	
	}

	export interface FORWARD {
		contactUserId: string;
		senderId: string;
		message?: string;
		mediaUrl?: string;
		messageType: string;
		languageCode: string;
		localMessageId?: string;
		thumbnailUrl?:string;
		location?: {
			lat: Number,
			long: Number
		},
		size?: string;
		transcribe?:string;
		status?: string;	
		imageRatio?:number;
		localUrl?:string;			
	}

	export interface INTERACTIONS {
		contactUserId: string;
		localMessageId?: string;
	}

	export interface SOKCET_ROOM {
		chatId: string;
		socketId?: string;
	}

	export interface CHAT_NOTIFICATION {
		type?: string;
		subtitle?: string,
		title: string;
		body: string;
		message: string;
		details: {
			chatId: string;
			senderId: string;
			receiverId: string;
			receiverIdName:string;
			messageType:string;
			profilePicture: string;
			countryCode: string;
			mobileNo: string;
			fullMobileNo?: string;
			type: string;
			senderName?: string;
			flagCode?: string;
			membersDetails?:object;
		};
	}
	export interface GROUP_MESSAGE {
		senderId: string;
		chatId: string;
		message?: string;
		mediaUrl?: string;
		messageType: string;
		localMessageId?: string;
		thumbnailUrl?:string;
		location?: {
			lat: Number,
			long: Number
		},
		size?: string;
		status?: string;	
		transcribe?:string;	
		taggedUser?: Array<string>
		languageCode?:string;
		imageRatio?:number;
		localUrl?:string;	
	
	}

	export interface REPLIED {
		messageId: string;
		contactUserId?: string;
		senderId: string;
		chatId: string;
		message?: string;
		languageCode?:string;
		mediaUrl?: string;
		messageType: string;
		localMessageId?: string;
		thumbnailUrl?:string;
		location?: {
			lat: Number,
			long: Number
		},
		size?: string
		status?:string;
		transcribe?:string;
		taggedUser?:Array<string>
		imageRatio?:number;
		localUrl?:string;		
	}

	export interface CHAT_REACTION {
		messageId: string;
		reaction: string;
	}

	export interface MESSAGE {
		messageId: string;
	}

	export interface ARCHIVE {
		chatId: string;
		isArchive: boolean
	}

	export interface WALLPAPER {
		chatId?: string;
		url: string;
		overall: boolean
	}

	export interface CREATE_GROUP {
		contactUserIds: Array<string>;
		name?:string;
		description?:string;
		groupProfilePicture?:string;
	}

	export interface EDIT_GROUP {
		groupId: string;
		contactUserIds?: Array<string>;
		name?:string;
		description?:string;
		groupProfilePicture?:string;
	}

	export interface VIEW_GROUP extends ListingRequest {
		groupId: string;
	}

	export interface CREATE_BROADCAST {
		contactUserIds: Array<string>;
	}

	export interface EDIT_BROADCAST {
		contactUserIds?: Array<string>;
		name?: string;
		broadCastId: string;
		isDelete:boolean
	}

	export interface VIEW_BROADCAST {
		broadCastId: string;
	}

	export interface SEND_BROADCAST extends ONE_TO_ONE_CHAT_MESSAGE {
		broadCastId: string;
		languageCode?:string;
	}

	export interface REPORT {
		contactUserId: string;
		reason: string;
	}

	export interface Delete extends Id {
		status: string;
	}

	export interface userId {
		userId: string;
	}

	export interface userProfile {
		offlineStatus: boolean;
	}
	export interface MessageList {
		chatId: string;
		pageNo: number;
		limit: number;
		searchKey?: string;
		lastMsgId?: string;
		lastMessageCreated?:number
	}

	export interface BroadCastMessage {
		broadCastId: string;
		pageNo: number;
		limit: number;
		searchKey?: string;
		lastMsgId?: string;
		lastMessageCreated?:number
	}

	export interface ChatId {
		chatId: string;
		isClearChat:boolean
	}

	export interface Blocked {
		contactUserId: string;
		blocked:boolean
	}

	export interface Tracking {
		chatId: string;
		isText:boolean
	}

	export interface DeleteMessages {
		messageId: string;
		isDeleteForEveryone?: boolean;
	}
	export interface TranslateMessages {
		message: string;
		sourceLanguageCode:string;
		targetLanguages:Array<string>;
	}
	export interface CallInitiate {
		userId?: string;
		chatId: string;
		mode:string;	
	}
	export interface CallDecline {
		userId?: string;
		chatId: string;
	}
	export interface CallAccept {
		userId?: string;
		chatId: string;
	}
	export interface CallEnd {
		userId?: string;
		chatId: string;
		meetingId: string;
	}
	export interface removeAttendees {
		chatId: string;
		meetingId: string;
		attendeeId: string;
	}
	export interface VideoCallRequest extends CallDecline {}
	export interface VideoCallStatus {
		chatId: string;
		isAccept: boolean;
	}
	export interface UserCallStatus {
		chatId: string;
	}
	export interface muteChat {
		chatId: string;
		isMute: boolean
	}
	export interface markedReadAll {
		chatId: string;
	}
	export interface TranscriptionRequest{
		sourceLanguageCode: string;
		chatId: string;
		transcript: string;
	}
	declare interface chatBox {
		chatId:string;
	}
	
}