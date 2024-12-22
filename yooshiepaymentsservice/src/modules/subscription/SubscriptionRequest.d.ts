declare namespace SubscriptionRequest {
    export interface VerifyIosInAppToken {
        receipt: string;
        deviceId?: string;
    }

    export interface VerifyAndroidInAppToken {
        receipt: string;
        deviceId?: string;
        subscriptionId: string;
        basePlanId: string;
    }

    export interface Listing {
        pageNo: number;
        limit: number;
    }

    export interface Subscriptions extends Listing, Device {
        userId: string
    }

    export interface TransactionListing extends ListingRequest {
        isExport?: boolean,
        amount?: string,
        subscriptionPlan?: string,
        type?: string,
        paymentStatus?: string
    }

    export interface SubscriptionListing extends ListingRequest {
        isExport?: boolean,
        subscriptionPlan?: string,
        type?: string,
        subscriptionStatus?: string,
        startFromDate?: number | date,
        startToDate?: number | date,
        renewalFromDate?: number | date,
        renewalToDate?: number | data
      }
}

