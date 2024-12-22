declare namespace ContactRequest {

    export interface addContact{
        name?: string;
        email?: string;
        countryCode?: string;
        mobileNo?: string;
        userId?: string;
        fullMobileNo?: string;
    }

    export interface editContact{
        contactId: string;
        name?: string;
        email?: string;
        countryCode?: string;
        mobileNo?: string;
        userId?: string;
        fullMobileNo?: string;
    }
}