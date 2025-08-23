import type { INodeProperties } from 'n8n-workflow';

export const productCreateUpdateProperties: INodeProperties[] = [
	// Product ID for update operation
	{
		displayName: 'Product ID',
		name: 'productId',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['product'],
				operation: ['update'],
			},
		},
		default: '',
		description: 'ID of the product to update',
		required: true,
	},
	// Product Name
	{
		displayName: 'Product Name',
		name: 'productName',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['product'],
				operation: ['create'],
			},
		},
		default: '',
		description: 'Name of the product',
		required: true,
	},
	{
		displayName: 'Product Name',
		name: 'productName',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['product'],
				operation: ['update'],
			},
		},
		default: '',
		description: 'Name of the product (required by IKAS API)',
		required: true,
	},
	// Product Type
	{
		displayName: 'Product Type',
		name: 'productType',
		type: 'options',
		displayOptions: {
			show: {
				resource: ['product'],
				operation: ['create'],
			},
		},
		options: [
			{
				name: 'Physical',
				value: 'PHYSICAL',
			},
			{
				name: 'Digital',
				value: 'DIGITAL',
			},
			{
				name: 'Bundle',
				value: 'BUNDLE',
			},
			{
				name: 'Membership',
				value: 'MEMBERSHIP',
			},
		],
		default: 'PHYSICAL',
		description: 'Type of the product',
		required: true,
	},
	{
		displayName: 'Product Type',
		name: 'productType',
		type: 'options',
		displayOptions: {
			show: {
				resource: ['product'],
				operation: ['update'],
			},
		},
		options: [
			{
				name: 'Physical',
				value: 'PHYSICAL',
			},
			{
				name: 'Digital',
				value: 'DIGITAL',
			},
			{
				name: 'Bundle',
				value: 'BUNDLE',
			},
			{
				name: 'Membership',
				value: 'MEMBERSHIP',
			},
		],
		default: 'PHYSICAL',
		description: 'Type of the product (required by IKAS API)',
		required: true,
	},
	// Product Structure (only for create operation)
	{
		displayName: 'Product Structure',
		name: 'productStructure',
		type: 'options',
		displayOptions: {
			show: {
				resource: ['product'],
				operation: ['create'],
			},
		},
		options: [
			{
				name: 'Simple Product',
				value: 'simple',
				description: 'Simple product (no variants)',
			},
		],
		default: 'simple',
		description: 'Choose the product structure type. For updates, this is automatically detected.',
		required: true,
	},
	// Product Structure - Automatically detected based on variant count for updates
	{
		displayName: 'Price',
		name: 'price',
		type: 'number',
		displayOptions: {
			show: {
				resource: ['product'],
				operation: ['create'],
				productStructure: ['simple'],
			},
		},
		default: 0,
		description: 'Selling price for the product (for simple products only)',
		typeOptions: {
			numberPrecision: 2,
			minValue: 0,
		},
		required: true,
	},
	// Sales Channels - Required by IKAS API
	{
		displayName: 'Sales Channel Names',
		name: 'salesChannelIds',
		type: 'multiOptions',
		typeOptions: {
			loadOptionsMethod: 'getSalesChannels',
		},
		displayOptions: {
			show: {
				resource: ['product'],
				operation: ['create', 'update'],
			},
		},
		default: [],
		description:
			'Select the sales channels where this product will be available. Choose from the list, or specify IDs using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
		required: true,
	},
];
