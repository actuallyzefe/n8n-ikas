import type { INodeProperties } from 'n8n-workflow';

export const customerSearchProperties: INodeProperties[] = [
	{
		displayName: 'Search Query',
		name: 'searchQuery',
		type: 'string',
		default: '',
		displayOptions: {
			show: {
				resource: ['customer'],
				operation: ['search'],
			},
		},
		description: 'Search term applied to firstName, lastName, email, phone',
	},
	{
		displayName: 'Email',
		name: 'email',
		type: 'string',
		default: '',
		placeholder: 'name@email.com',
		displayOptions: {
			show: {
				resource: ['customer'],
				operation: ['search'],
			},
		},
		description: 'Exact email to filter (eq)',
	},
	{
		displayName: 'Customer ID',
		name: 'id',
		type: 'string',
		default: '',
		displayOptions: {
			show: {
				resource: ['customer'],
				operation: ['search'],
			},
		},
		description: 'Exact ID to filter (eq)',
	},
	{
		displayName: 'Phone Number',
		name: 'phone',
		type: 'string',
		default: '',
		displayOptions: {
			show: {
				resource: ['customer'],
				operation: ['search'],
			},
		},
		description: 'Exact phone to filter (eq)',
	},
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		default: false,
		displayOptions: {
			show: {
				resource: ['customer'],
				operation: ['search'],
			},
		},
		description: 'Whether to return all results or only up to a given limit',
	},
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		typeOptions: { minValue: 1 },
		default: 50,
		displayOptions: {
			show: {
				resource: ['customer'],
				operation: ['search'],
				returnAll: [false],
			},
		},
		description: 'Max number of results to return',
	},
	{
		displayName: 'Page',
		name: 'page',
		type: 'number',
		typeOptions: { minValue: 1 },
		default: 1,
		displayOptions: {
			show: {
				resource: ['customer'],
				operation: ['search'],
				returnAll: [false],
			},
		},
		description: 'Page number for pagination',
	},
	{
		displayName: 'Sort',
		name: 'sort',
		type: 'options',
		default: 'updatedAt',
		options: [
			{ name: 'Updated At (Ascending)', value: 'updatedAt' },
			{ name: 'Updated At (Descending)', value: '-updatedAt' },
		],
		displayOptions: {
			show: {
				resource: ['customer'],
				operation: ['search'],
			},
		},
		description: 'Sort results',
	},
	{
		displayName: 'Updated At (From)',
		name: 'updatedAtFrom',
		type: 'dateTime',
		default: '',
		displayOptions: {
			show: {
				resource: ['customer'],
				operation: ['search'],
			},
		},
		description: 'Filter customers updated after this date',
	},
	{
		displayName: 'Updated At (To)',
		name: 'updatedAtTo',
		type: 'dateTime',
		default: '',
		displayOptions: {
			show: {
				resource: ['customer'],
				operation: ['search'],
			},
		},
		description: 'Filter customers updated before this date',
	},
];
