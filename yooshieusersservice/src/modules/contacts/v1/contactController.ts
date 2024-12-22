"use strict";

import {
    MESSAGES,
    USER_TYPE
} from "@config/index";
import { userDaoV1 } from "@modules/user/index";
import { contactDaoV1 } from "..";

export class ContactController {
    async addContact(params: ContactRequest.addContact, tokenData: TokenData) {
        try {
            const isUserExist = await userDaoV1.findUserById(tokenData.userId);
            if (!isUserExist) return Promise.reject(MESSAGES.ERROR.USER_NOT_FOUND);
            params.userId = tokenData.userId;
            const isMobileExists = await contactDaoV1.isMobileExists(params);
            if (isMobileExists) return Promise.reject(MESSAGES.ERROR.MOBILE_NO_ALREADY_EXIST_IN_CONTACTS)

            const isEmailExists = await contactDaoV1.isEmailExists(params);
            if (isEmailExists) return Promise.reject(MESSAGES.ERROR.EMAIL_ALREADY_EXIST_IN_CONTACTS)

            await contactDaoV1.addContact(params);
            return MESSAGES.SUCCESS.CONTACT_ADDED
        }
        catch (error) {
            throw error;
        }
    }

    async editContact(params: ContactRequest.editContact, tokenData: TokenData) {
        try {
            const isContactExists = await contactDaoV1.isContactExists(params.contactId);
            if (!isContactExists) return Promise.reject(MESSAGES.ERROR.CONTACT_NOT_FOUND)

            params.userId = tokenData.userId;
            if (params.email) {
                const isEmailExists = await contactDaoV1.isEmailExists(params);
                if (isEmailExists) return Promise.reject(MESSAGES.ERROR.EMAIL_ALREADY_EXIST_IN_CONTACTS)
            }
            if (params.countryCode || params.mobileNo) {
                if (!params.mobileNo) {
                    params.mobileNo = isContactExists.mobileNo;
                }
                else if (!params.countryCode) {
                    params.countryCode = isContactExists.countryCode;
                }
                const isMobileExists = await contactDaoV1.isMobileExists(params);
                if (isMobileExists) return Promise.reject(MESSAGES.ERROR.MOBILE_NO_ALREADY_EXIST_IN_CONTACTS);
            }

            await contactDaoV1.editContact(params);
            return MESSAGES.SUCCESS.CONTACT_UPDATED
        }
        catch (error) {
            throw error;
        }
    }

    async deleteContact(contactId: string) {
        try {
            const isContactExists = await contactDaoV1.isContactExists(contactId);
            if (!isContactExists) return Promise.reject(MESSAGES.ERROR.CONTACT_NOT_FOUND)

            await contactDaoV1.deleteContact(contactId);
            return MESSAGES.SUCCESS.CONTACT_DELETED;
        }
        catch (error) {
            throw error;
        }
    }

    async getContactListing(params: ListingRequest, tokenData: TokenData) {
        try {
            if (tokenData.userType === USER_TYPE.USER) {
                params.userId = tokenData.userId;
            }
            const data = await contactDaoV1.getContactListing(params);
            return MESSAGES.SUCCESS.DETAILS(data);
        }
        catch (error) {
            throw error;
        }
    }
}

export const contactController = new ContactController();
