import type { INodeProperties } from 'n8n-workflow';

export const customerCreateUpdateProperties: INodeProperties[] = [
	// Customer ID for update operation
	{
		displayName: 'Customer ID',
		name: 'customerId',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['customer'],
				operation: ['update'],
			},
		},
		default: '',
		description: 'ID of the customer to update',
		required: true,
	},
	// First Name - Required field
	{
		displayName: 'First Name',
		name: 'firstName',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['customer'],
				operation: ['create', 'update'],
			},
		},
		default: '',
		description: 'First name of the customer',
		required: true,
	},
	// Last Name - Optional but commonly used
	{
		displayName: 'Last Name',
		name: 'lastName',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['customer'],
				operation: ['create', 'update'],
			},
		},
		default: '',
		description: 'Last name of the customer',
	},
	// Email - Important field
	{
		displayName: 'Email',
		name: 'email',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['customer'],
				operation: ['create', 'update'],
			},
		},
		default: '',
		placeholder: 'customer@example.com',
		description: 'Email address of the customer',
	},
	// Phone - Important field
	{
		displayName: 'Phone',
		name: 'phone',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['customer'],
				operation: ['create', 'update'],
			},
		},
		default: '',
		placeholder: '+1234567890',
		description: 'Phone number of the customer',
	},
	// Additional Fields Section
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['customer'],
				operation: ['create', 'update'],
			},
		},
		options: [
			{
				displayName: 'Account Status',
				name: 'accountStatus',
				type: 'options',
				default: 'ACTIVE_ACCOUNT',
				description: 'Account status of the customer',
				options: [
					{ name: 'Active Account', value: 'ACTIVE_ACCOUNT' },
					{ name: 'Declined Account Invitation', value: 'DECLINED_ACCOUNT_INVITATION' },
					{ name: 'Disabled Account', value: 'DISABLED_ACCOUNT' },
					{ name: 'Invited to Create Account', value: 'INVITED_TO_CREATE_ACCOUNT' },
				],
			},
			{
				displayName: 'B2B Status',
				name: 'b2bStatus',
				type: 'options',
				default: 'B2C',
				description: 'B2B status of the customer',
				options: [
					{ name: 'B2B', value: 'B2B' },
					{ name: 'B2C', value: 'B2C' },
				],
			},
			{
				displayName: 'Birth Date',
				name: 'birthDate',
				type: 'dateTime',
				default: '',
				description: 'Birth date of the customer',
			},
			{
				displayName: 'Customer Group IDs',
				name: 'customerGroupIds',
				type: 'string',
				default: '',
				description: 'Comma-separated list of customer group IDs',
				placeholder: 'group1,group2,group3',
			},
			{
				displayName: 'Email Subscription Status',
				name: 'subscriptionStatus',
				type: 'options',
				default: 'NOT_SUBSCRIBED',
				options: [
					{ name: 'Subscribed', value: 'SUBSCRIBED' },
					{ name: 'Not Subscribed', value: 'NOT_SUBSCRIBED' },
					{ name: 'Pending Confirmation', value: 'PENDING_CONFIRMATION' },
				],
			},
			{
				displayName: 'Full Name',
				name: 'fullName',
				type: 'string',
				default: '',
				description: 'Full name of the customer (overrides firstName + lastName combination)',
			},
			{
				displayName: 'Gender',
				name: 'gender',
				type: 'options',
				default: 'OTHER',
				description: 'Gender of the customer',
				options: [
					{ name: 'Male', value: 'MALE' },
					{ name: 'Female', value: 'FEMALE' },
					{ name: 'Other', value: 'OTHER' },
				],
			},
			{
				displayName: 'Note',
				name: 'note',
				type: 'string',
				default: '',
				description: 'Internal note about the customer',
				typeOptions: {
					rows: 3,
				},
			},
			{
				displayName: 'Phone Subscription Status',
				name: 'phoneSubscriptionStatus',
				type: 'options',
				default: 'NOT_SUBSCRIBED',
				description: 'Phone subscription status for the customer',
				options: [
					{ name: 'Subscribed', value: 'SUBSCRIBED' },
					{ name: 'Not Subscribed', value: 'NOT_SUBSCRIBED' },
					{ name: 'Pending Confirmation', value: 'PENDING_CONFIRMATION' },
				],
			},
			{
				displayName: 'Preferred Language',
				name: 'preferredLanguage',
				type: 'string',
				default: '',
				placeholder: 'en',
				description: 'Preferred language code (e.g., en, tr, de)',
			},
			{
				displayName: 'Price List ID',
				name: 'priceListId',
				type: 'string',
				default: '',
				description: 'Price list ID for the customer',
			},
			{
				displayName: 'Registration Source',
				name: 'registrationSource',
				type: 'options',
				default: 'CREDENTIALS',
				description: 'Source of customer registration',
				options: [
					{ name: 'Apple', value: 'APPLE' },
					{ name: 'Credentials', value: 'CREDENTIALS' },
					{ name: 'Facebook', value: 'FACEBOOK' },
					{ name: 'Google', value: 'GOOGLE' },
					{ name: 'Twitch', value: 'TWITCH' },
				],
			},
			{
				displayName: 'SMS Subscription Status',
				name: 'smsSubscriptionStatus',
				type: 'options',
				default: 'NOT_SUBSCRIBED',
				description: 'SMS subscription status for the customer',
				options: [
					{ name: 'Subscribed', value: 'SUBSCRIBED' },
					{ name: 'Not Subscribed', value: 'NOT_SUBSCRIBED' },
					{ name: 'Pending Confirmation', value: 'PENDING_CONFIRMATION' },
				],
			},
			{
				displayName: 'Tag IDs',
				name: 'tagIds',
				type: 'string',
				default: '',
				description: 'Comma-separated list of tag IDs',
				placeholder: 'tag1,tag2,tag3',
			},
		],
	},
];
