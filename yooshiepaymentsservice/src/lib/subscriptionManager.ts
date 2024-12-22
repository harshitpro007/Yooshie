import { SERVER } from "@config/environment";
import { consolelog } from "@utils/appUtils";
import axios from "axios";
import { google } from 'googleapis';


const publisherClient = async function () {
    try {
        // Create a JWT client
        const auth = new google.auth.JWT(
            SERVER.CLIENT_EMAIL,
            null,
            SERVER.PRIVATE_KEY,
            SERVER.SUBSCRIPTION.SCOPE
       );
        await auth.authorize();
        // Create the Android Publisher client
        const androidPublisher = google.androidpublisher({ version: 'v3', auth: auth });
        return androidPublisher;
    }
    catch (error) {
        console.error(error);
        throw error;
    }
}

async function getSubscriptionData(subscriptionId, purchaseToken) {
    const androidPublisher = await publisherClient();
    return new Promise((resolve, reject) => {
        const packageName = SERVER.PACKAGE_NAME;
        androidPublisher.purchases.subscriptions.get({
            packageName,
            subscriptionId,
            token: purchaseToken,
        }, (error, result) => {
            if (error) {
                reject(error);
            } else {
                resolve(result);
            }
        });
    });
}

async function acknowledgeSub(subscriptionId, purchaseToken) {
    const androidPublisher = await publisherClient();
    return new Promise((resolve, reject) => {
        const packageName = SERVER.PACKAGE_NAME;
        androidPublisher.purchases.subscriptions.acknowledge({
            packageName,
            subscriptionId,
            token: purchaseToken,
        }, (error, result) => {
            if (error) {
                reject(error);
            } else {
                resolve(result);
            }
        });
    });
}


const verifyAndroidInAppToken = async function (params: any) {

    try {
        // Validate the purchase
        let response:any = await getSubscriptionData(params.subscriptionId, params.receipt || params.purchaseToken);

        await acknowledgeSub(params.subscriptionId, params.receipt || params.purchaseToken);

        return { "flag": true, "data": response.data };
    } catch (error) {
        consolelog("Error", error.response ? error?.response?.data : error, false);
        return { "flag": false, "data": error };
    }
}

const verifyIosInAppToken = async function (receipt: string) {
	try {
		const body = {
			"receipt-data": receipt,
			"password": SERVER.IOS_SHARED_SECRET
		};
		const response = await axios.post(SERVER.IOS_LIVE_URL, body, {
			headers: {
				"Content-Type": "application/json"
			}
		});
		if (response.data && response.data.status && response.data.status === 21007) { //NOSONAR
			const response = await axios.post(SERVER.IOS_SANDBOX_URL, body, {
				headers: {
					"Content-Type": "application/json"
				}
			});
			return { "flag": true, "data": response.data };
		}
		return { "flag": true, "data": response.data };
	} catch (error) {
		consolelog("Error", error.response ? error?.response?.data : error, false);
		return { flag: false, error };
	}
};


export {
    verifyAndroidInAppToken,
    getSubscriptionData,
    verifyIosInAppToken
}
