declare namespace NotificationRequest {

  export interface Notification{
    type?: string;
    userId?: any;
    details?: object;
    userType?: string;
    title?: string;
    description?: string;
    notificationId?: string;
  }

  export interface CreateNotification extends Id{
    title?: string;
    description?: string;
    userType?: string;
  }

  export interface Id {
		notificationId?: string;
	}
}