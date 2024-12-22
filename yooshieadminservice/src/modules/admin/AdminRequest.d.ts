declare namespace AdminRequest {

	export interface Create {
		name: string;
		email: string;
		password: string;
		created?: number;
	}

	export interface Login extends Device {
		email: string;
		password: string;
		salt: string;
		hash: string;
	}

	export interface ForgotPasswordRequest {
		email: string;
	}
	export interface ComposeMail {
		email: string;
		subject: string;
		message: string;
	}

	export interface ChangeForgotPassword {
		email: string;
		password: string;
		hash?: string;
		token?: string;
	}

	export interface Dashboard extends Filter {
		year?: string;
		month?: string;
		type: string;
		dashboardType?: string;
		corporateId?: string;
	}

	export interface EditProfile {
		profilePicture?: string;
		name?: string;
		password?: string;
		countryCode?: string;
		mobileNo?: string;
		fullMobileNo?: string;
	}

	export interface Dashboard {
		fromDate: number;
		toDate: number;
	}

	export interface UserListing extends ListingRequest {
		userType?: string;
		latestUsers: boolean;
		languageCode?:string;
		isExport?:boolean;
		isMigratedUser?: boolean;
		userId?:string
		categoryId?:array;
	}

	// march 14 - natasha
	export interface NotificationsList extends ListingRequest {
		userId?: string;
		platform?: string;
	}
	export interface AddNotifications {
		senderId: string;
		platform: string;
		title: string;
		message:string;
		image?:string;
		status:string;
		deviceId?: string,
		deviceToken?: string,


	}
	export interface BannerList extends ListingRequest {
		userId?: string;
	}
	export interface AddBanner {
		userId: string;
		title: string;
		message:string;
		deviceId?: string,
		deviceToken?: string,


	}
	export interface AddRoles {
		userId: string;
		roles:string;
		deviceId?: string,
		deviceToken?: string,


	}

	export interface RoleList extends ListingRequest {
		userId?: string;
	}

	export interface UserStatus {
		userId?: string,
		status?: string,
		loginType?:string,
	}

	export interface DeletePosts{
		userId: string,
	}
	export interface PreSignedUrl {
		filename:"string",
		fileType:"string"
	}
	export interface RefreshToken extends Device {
		refreshToken: string;
		deviceId: string;
	}
}