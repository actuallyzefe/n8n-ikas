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
					{ name: 'Inactive Account', value: 'INACTIVE_ACCOUNT' },
					{ name: 'Disabled Account', value: 'DISABLED_ACCOUNT' },
				],
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
					{ name: 'Unsubscribed', value: 'UNSUBSCRIBED' },
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
				default: 'STOREFRONT',
				description: 'Source of customer registration',
				options: [
					{ name: 'Storefront', value: 'STOREFRONT' },
					{ name: 'Admin Panel', value: 'ADMIN_PANEL' },
					{ name: 'API', value: 'API' },
					{ name: 'Import', value: 'IMPORT' },
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
