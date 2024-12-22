"use strict";

import { BaseDao } from "@modules/baseDao/BaseDao";
import { STATUS, DB_MODEL_REF } from "@config/constant";
import { toObjectId } from "@utils/appUtils";

export class ContactDao extends BaseDao {
    private modelContact: any;
    constructor() {
        super();
        this.modelContact = DB_MODEL_REF.CONTACT;
    }

    async isMobileExists(params: any) {
        try {
            const query: any = {};
            query.countryCode = params.countryCode;
            query.mobileNo = params.mobileNo;
            query.userId = params.userId;
            query.status = { $ne: STATUS.DELETED };

            const projection = { updatedAt: 0 };

            return await this.findOne(this.modelContact, query, projection);
        }
        catch (error) {
            throw error;
        }
    }

    /**
   * @function isEmailExists
   */
    async isEmailExists(params) {
        try {
            const query: any = {};
            query.email = params.email;
            query.userId = params.userId;
            query.status = { $ne: STATUS.DELETED };

            const projection = { updatedAt: 0 };

            return await this.findOne(this.modelContact, query, projection);
        } catch (error) {
            throw error;
        }
    }

    async isContactExists(contactId: string) {
        try {
            const query: any = {};
            query._id = contactId;
            query.status = { $ne: STATUS.DELETED };

            const projection = { updatedAt: 0 };

            return await this.findOne(this.modelContact, query, projection);
        }
        catch (error) {
            throw error;
        }
    }

    async addContact(params: ContactRequest.addContact) {
        try {
            return await this.save(this.modelContact, params);
        }
        catch (error) {
            throw error;
        }
    }

    async editContact(params: ContactRequest.editContact) {
        try {
            const query: any = {};
            query._id = params.contactId;
            query.userId = params.userId;
            const update = {};
            if (Object.values(params).length) update["$set"] = params;
            const options = { new: true };

            return await this.findOneAndUpdate(this.modelContact, query, update, options);
        }
        catch (error) {
            throw error;
        }
    }

    async deleteContact(contactId: string) {
        try {
            return await this.deleteOne(this.modelContact, { _id: contactId });
        }
        catch (error) {
            throw error;
        }
    }


    async getContactListing(params: ListingRequest) {
        try {
            let { pageNo, limit, userId } = params;
            const aggPipe = [];

            const match: any = {};
            match.userId = toObjectId(userId);
            match.status = { $ne: STATUS.DELETED };

            aggPipe.push({ $match: match });

            aggPipe.push({ $sort: { created: -1 } });

            if (params.limit && params.pageNo) {
                const [skipStage, limitStage] = this.addSkipLimit(
                    params.limit,
                    params.pageNo
                );
                aggPipe.push(skipStage, limitStage);
            }

            let project: any = {
                _id: 1,
                name: 1,
                userId:1,
                email: 1,
                status: 1,
                created: 1,
                mobileNo: 1,
                countryCode: 1,
            };
            aggPipe.push({ $project: project });

            return await this.dataPaginate(this.modelContact, aggPipe, limit, pageNo, {}, true);
        }
        catch (error) {
            throw error;
        }
    }
}

export const contactDao = new ContactDao();
