/**
 * Customer Account Status Enum
 * Customer Account Statuses
 */
export enum CustomerAccountStatusEnum {
	ACTIVE_ACCOUNT = 'ACTIVE_ACCOUNT',
	DECLINED_ACCOUNT_INVITATION = 'DECLINED_ACCOUNT_INVITATION',
	DISABLED_ACCOUNT = 'DISABLED_ACCOUNT',
	INVITED_TO_CREATE_ACCOUNT = 'INVITED_TO_CREATE_ACCOUNT',
}

/**
 * Customer Attribute Permission Types
 */
export enum CustomerAttributePermissionEnum {
	INVISIBLE = 'INVISIBLE',
	READ = 'READ',
	WRITE = 'WRITE',
}

/**
 * Customer Attribute Register Page Requirement Types
 */
export enum CustomerAttributeRegisterPageRequirementEnum {
	INVISIBLE = 'INVISIBLE',
	MANDATORY = 'MANDATORY',
	OPTIONAL = 'OPTIONAL',
}

/**
 * CustomerAttribute Types
 */
export enum CustomerAttributeTypeEnum {
	BOOLEAN = 'BOOLEAN',
	CHOICE = 'CHOICE',
	DATETIME = 'DATETIME',
	MULTIPLE_CHOICE = 'MULTIPLE_CHOICE',
	NUMERIC = 'NUMERIC',
	TEXT = 'TEXT',
}

/**
 * Customer Email Subscription Statuses
 */
export enum CustomerEmailSubscriptionStatusesEnum {
	NOT_SUBSCRIBED = 'NOT_SUBSCRIBED',
	PENDING_CONFIRMATION = 'PENDING_CONFIRMATION',
	SUBSCRIBED = 'SUBSCRIBED',
}

/**
 * Customer Price List Rule Filter Type Enum
 */
export enum CustomerPriceListRuleFilterTypeEnum {
	CATEGORY = 'CATEGORY',
	PRODUCT = 'PRODUCT',
	PRODUCT_BRAND = 'PRODUCT_BRAND',
	PRODUCT_TAG = 'PRODUCT_TAG',
}

/**
 * Customer Price List Rule Value Type Enum
 */
export enum CustomerPriceListRuleValueTypeEnum {
	DISCOUNT_AMOUNT = 'DISCOUNT_AMOUNT',
	DISCOUNT_RATE = 'DISCOUNT_RATE',
	FIXED_PRICE = 'FIXED_PRICE',
}

/**
 * Customer Registration Source Enum
 */
export enum CustomerRegistrationSourceEnum {
	APPLE = 'APPLE',
	CREDENTIALS = 'CREDENTIALS',
	FACEBOOK = 'FACEBOOK',
	GOOGLE = 'GOOGLE',
	TWITCH = 'TWITCH',
}

/**
 * Customer B2B Status Enum (referenced in input but not defined)
 */
export enum CustomerB2BStatusEnum {
	B2B = 'B2B',
	B2C = 'B2C',
}

/**
 * Customer Gender Type Enum (referenced in input but not defined)
 */
export enum CustomerGenderTypeEnum {
	MALE = 'MALE',
	FEMALE = 'FEMALE',
	OTHER = 'OTHER',
}

/**
 * Customer Address Input Interface
 */
export interface CustomerAddressInput {
	id?: string;
	addressLine1: string;
	addressLine2?: string;
	firstName: string;
	lastName: string;
	company?: string;
	phone?: string;
	postalCode?: string;
	identityNumber?: string;
	taxNumber?: string;
	taxOffice?: string;
	title: string;
	isDefault?: boolean;
	cityId?: string;
	districtId?: string;
	stateId?: string;
	countryId?: string;
	regionId?: string;
}

/**
 * Customer Attribute Value Input Interface
 */
export interface CustomerAttributeValueInput {
	attributeId: string;
	value: string;
}

/**
 * Customer Price List Rule Input Interface
 */
export interface CustomerPriceListRuleInput {
	id?: string;
	priceListId: string;
	filterType: CustomerPriceListRuleFilterTypeEnum;
	filterValue: string;
	valueType: CustomerPriceListRuleValueTypeEnum;
	value: number;
	minQuantity?: number;
	maxQuantity?: number;
}

/**
 * Customer Input Interface (based on the GraphQL CustomerInput type)
 */
export interface CustomerInput {
	id?: string;
	firstName: string;
	lastName?: string;
	email?: string;
	phone?: string;
	fullName?: string;
	note?: string;
	preferredLanguage?: string;
	priceListId?: string;
	accountStatus?: CustomerAccountStatusEnum;
	subscriptionStatus?: CustomerEmailSubscriptionStatusesEnum;
	phoneSubscriptionStatus?: CustomerEmailSubscriptionStatusesEnum;
	smsSubscriptionStatus?: CustomerEmailSubscriptionStatusesEnum;
	registrationSource?: CustomerRegistrationSourceEnum;
	b2bStatus?: CustomerB2BStatusEnum;
	gender?: CustomerGenderTypeEnum;
	birthDate?: number; // Timestamp
	customerGroupIds?: string[];
	tagIds?: string[];
	addresses?: CustomerAddressInput[];
	attributes?: CustomerAttributeValueInput[];
	priceListRules?: CustomerPriceListRuleInput[];
	deleted?: boolean;
	createdAt?: number; // Timestamp
	updatedAt?: number; // Timestamp
}

/**
 * Customer Interface (based on the GraphQL Customer type)
 */
export interface Customer {
	id: string;
	firstName: string;
	lastName?: string;
	email?: string;
	phone?: string;
	fullName?: string;
	note?: string;
	preferredLanguage?: string;
	priceListId?: string;
	accountStatus?: CustomerAccountStatusEnum;
	subscriptionStatus?: CustomerEmailSubscriptionStatusesEnum;
	phoneSubscriptionStatus?: CustomerEmailSubscriptionStatusesEnum;
	smsSubscriptionStatus?: CustomerEmailSubscriptionStatusesEnum;
	registrationSource?: CustomerRegistrationSourceEnum;
	b2bStatus?: CustomerB2BStatusEnum;
	gender?: CustomerGenderTypeEnum;
	customerSequence?: number;
	firstOrderDate?: number; // Timestamp
	lastOrderDate?: number; // Timestamp
	lastPriceListId?: string;
	lastStorefrontRoutingId?: string;
	orderCount?: number;
	passwordUpdateDate?: number; // Timestamp
	totalOrderPrice?: number;
	customerGroupIds?: string[];
	customerSegmentIds?: string[];
	tagIds?: string[];
	addresses?: CustomerAddress[];
	attributes?: CustomerAttributeValue[];
	priceListRules?: CustomerPriceListRule[];
	emailVerifiedDate?: number; // Timestamp
	phoneVerifiedDate?: number; // Timestamp
	isEmailVerified?: boolean;
	isPhoneVerified?: boolean;
	ip?: string;
	userAgent?: string;
	createdAt?: number; // Timestamp
	updatedAt?: number; // Timestamp
}

/**
 * Supporting interfaces
 */
export interface CustomerAddress {
	id: string;
	addressLine1: string;
	addressLine2?: string;
	firstName: string;
	lastName: string;
	company?: string;
	phone?: string;
	postalCode?: string;
	identityNumber?: string;
	taxNumber?: string;
	taxOffice?: string;
	title: string;
	isDefault?: boolean;
	city?: {
		id: string;
		code?: string;
		name: string;
	};
	district?: {
		id: string;
		code?: string;
		name?: string;
	};
	state?: {
		id: string;
		code?: string;
		name?: string;
	};
	country?: {
		id: string;
		code?: string;
		iso2?: string;
		iso3?: string;
		name: string;
	};
	region?: {
		id: string;
		code?: string;
		name?: string;
	};
}

export interface CustomerAttributeValue {
	attributeId: string;
	attributeName?: string;
	attributeType?: CustomerAttributeTypeEnum;
	value: string;
}

export interface CustomerPriceListRule {
	id: string;
	priceListId: string;
	filterType: CustomerPriceListRuleFilterTypeEnum;
	filterValue: string;
	valueType: CustomerPriceListRuleValueTypeEnum;
	value: number;
	minQuantity?: number;
	maxQuantity?: number;
}
