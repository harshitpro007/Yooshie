"use strict";
import { BaseDao } from "@modules/baseDao";
import { DB_MODEL_REF, STATUS } from "@config/constant";
import { escapeSpecialCharacter, toObjectId } from "@utils/appUtils";

export class NotificationDao extends BaseDao {

    private modelNotification: any;
	constructor(){
		super();
		this.modelNotification = DB_MODEL_REF.NOTIFICATION;
	}

    async createNotification(params: NotificationRequest.CreateNotification){
        try{
            return await this.save(this.modelNotification, params);
        }
        catch(error){
            throw error;
        }
    }

    /**
	 * @function notificationList
	 * @description function will give the list of notification
	 */
	async notificationList(params: ListingRequest) {
		try {
			let { pageNo, limit, sortBy, sortOrder } = params;
			const aggPipe = [];

			const match: any = {};
			match.status = { "$eq": STATUS.UN_BLOCKED };
			
			if (params.searchKey) {
				params.searchKey = escapeSpecialCharacter(params.searchKey);
				match.title = { "$regex": params.searchKey, "$options": "-i" };
			}
			aggPipe.push({ "$match": match });
			
			let sort: any = {};
			(sortBy && sortOrder) ? sort = { [sortBy]: sortOrder } : sort = { "created": -1 };
			aggPipe.push({ "$sort": sort });

			if (params.limit && params.pageNo) {
                const [skipStage, limitStage] = this.addSkipLimit(
                    params.limit,
                    params.pageNo,
                );
                aggPipe.push(skipStage, limitStage);
            }

			let project: any = {
				_id: 1,
				title: 1,
				description: 1,
				userType: 1,
				created:1
			};
			aggPipe.push({ "$project": project });

			return await this.dataPaginate(this.modelNotification, aggPipe, limit, pageNo, {}, true);
		} catch (error) {
			throw (error);
		}
	}

    /**
	  * @function notificationDelete
	  * @description function will soft delete the notification event
	  */
	async notificationDelete(notificationId: string) {
		try {
			const query: any = {};
			query._id = toObjectId(notificationId);

			const update = {};
			update["$set"] = { status: STATUS.DELETED };
			return await this.updateOne(this.modelNotification, query, update, {});
		} catch (error) {
			throw error;
		}
	}

    async editNotification(params: NotificationRequest.CreateNotification){
        try {   
            const query: any = {};
			query._id = params.notificationId;

			const update = {};
			update["$set"] = {...params};
			const options = { new: true };
			return await this.findOneAndUpdate(this.modelNotification, query, update, options);
        }
        catch(error){
            throw error;
        }
    }
}

export const notificationDao = new NotificationDao();