import { MODULES, REGEX, STATUS, VALIDATION_MESSAGE } from "@config/constant";
import Joi = require("joi");

export const addAssistant = Joi.object({
    name: Joi.string().trim().required(),
    email: Joi.string()
        .email({ minDomainSegments: 2 })
        .regex(REGEX.EMAIL)
        .lowercase()
        .trim()
        .required(),
    permission: Joi.array()
        .items(
            Joi.object({
                module: Joi.string()
                    .trim()
                    .valid(...Object.values(MODULES))
                    .required(),
                view: Joi.boolean().optional().default(false),
                addAndEdit: Joi.boolean().optional().default(false),
                blockAndUnblock: Joi.boolean().optional().default(false),
                delete: Joi.boolean().optional().default(false),
            })
        )
        .required()
        .min(1)
        .custom((permissions, helpers) => {
            const hasPermission = permissions.some(permission =>
                permission.view || permission.addAndEdit || permission.blockAndUnblock || permission.delete
            );
    
            if (!hasPermission) {
                return helpers.error('any.invalid', { message: 'At least one permission must be assigned' });
            }
    
            return permissions;
        }, 'At least one permission check')
        .message('At least one permission must be assigned')
        .description('Choose at least one permission for any module'),
    countryCode: Joi.string().trim().optional(),
    mobileNo: Joi.string()
    .trim()
    .regex(REGEX.MOBILE_NUMBER)
    .optional()
    .messages({
        "string.pattern.base": VALIDATION_MESSAGE.mobileNo.pattern,
    }),
    profilePicture: Joi.string().trim().optional(),
})

export const editAssistant = Joi.object({
    assistantId: Joi.string().trim().regex(REGEX.MONGO_ID).required(),
    email: Joi.string().trim().optional(),
    countryCode: Joi.string().optional().allow(""),
    mobileNo: Joi.string()
        .trim()
        .regex(REGEX.MOBILE_NUMBER)
        .optional()
        .messages({
            "string.pattern.base": VALIDATION_MESSAGE.mobileNo.pattern,
        })
        .allow(""),
    name: Joi.string().trim().optional(),
    permission: Joi.array()
        .items(
            Joi.object({
                module: Joi.string()
                    .trim()
                    .valid(...Object.values(MODULES))
                    .required(),
                view: Joi.boolean().optional().default(false),
                addAndEdit: Joi.boolean().optional().default(false),
                blockAndUnblock: Joi.boolean().optional().default(false),
                delete: Joi.boolean().optional().default(false),
            })
        )
        .optional()
        .min(1)
        .custom((permissions, helpers) => {
            const hasPermission = permissions.some(permission =>
                permission.view || permission.addAndEdit || permission.blockAndUnblock || permission.delete
            );
    
            if (!hasPermission) {
                return helpers.error('any.invalid', { message: 'At least one permission must be assigned' });
            }
    
            return permissions;
        }, 'At least one permission check')
        .message('At least one permission must be assigned')
        .description('Choose at least one permission for any module'),
    profilePicture: Joi.string().trim().optional(),
    // fullMobileNo: Joi.string().optional().allow("").description('Full Mobile Number')
})

export const updateStatus = Joi.object({
    assistantId: Joi.string().trim().regex(REGEX.MONGO_ID).required(),
    status: Joi.string()
        .valid(STATUS.BLOCKED, STATUS.UN_BLOCKED)
        .required()
        .description("BLOCKED-1, UN-BLOCKED-2"),
})

export const assistant = Joi.object({
    assistantId: Joi.string().trim().regex(REGEX.MONGO_ID).required(),
})

export const assistantListing = Joi.object({
    pageNo: Joi.number().min(1).required(),
    limit: Joi.number().min(1).required(),
    searchKey: Joi.string()
        .allow("")
        .optional()
        .description("Search by name, email"),
    sortBy: Joi.string()
        .trim()
        .valid("created")
        .optional()
        .description("Sort by created"),
    sortOrder: Joi.number()
        .valid(1, -1)
        .optional()
        .description("1 for asc, -1 for desc"),
    status: Joi.array()
        .optional()
        .items(Joi.string().min(1))
        .single()
        .description("blocked-1, unblocked-2, pending-3"),
    fromDate: Joi.number().optional().description("in timestamp"),
    toDate: Joi.number().optional().description("in timestamp"),
    roleId: Joi.array()
        .optional()
        .items(Joi.string().min(1).regex(REGEX.MONGO_ID))
        .single(),
    isExport: Joi.boolean().default(false).description("Export data"),
})

export const reInviteAssistant = Joi.object({
    adminId: Joi.string().trim().regex(REGEX.MONGO_ID).required(),
})

export const assignedAssistant = Joi.object({
    assistantId: Joi.string().trim().regex(REGEX.MONGO_ID).required(),
    userId: Joi.string().trim().regex(REGEX.MONGO_ID).required(),

})

export const editProfileSetting = Joi.object({
    offlineStatus: Joi.boolean().optional(),
  })