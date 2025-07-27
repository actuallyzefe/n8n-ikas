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
	// Product Structure
	{
		displayName: 'Product Structure',
		name: 'productStructure',
		type: 'options',
		displayOptions: {
			show: {
				resource: ['product'],
				operation: ['create', 'update'],
			},
		},
		options: [
			{
				name: 'Simple Product',
				value: 'simple',
			},
		],
		default: 'simple',
		description:
			'Currently only simple products are supported. Variable products are under development.',
		required: true,
	},
	// Pricing fields for create
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
		description: 'Selling price for the simple product',
		typeOptions: {
			numberPrecision: 2,
			minValue: 0,
		},
	},
	{
		displayName: 'Buy Price',
		name: 'buyPrice',
		type: 'number',
		displayOptions: {
			show: {
				resource: ['product'],
				operation: ['create'],
				productStructure: ['simple'],
			},
		},
		default: 0,
		description: 'Cost/buy price for the simple product',
		typeOptions: {
			numberPrecision: 2,
			minValue: 0,
		},
	},
	{
		displayName: 'Discount Price',
		name: 'discountPrice',
		type: 'number',
		displayOptions: {
			show: {
				resource: ['product'],
				operation: ['create'],
				productStructure: ['simple'],
			},
		},
		default: null,
		description: 'Discount price for the simple product (optional)',
		typeOptions: {
			numberPrecision: 2,
			minValue: 0,
		},
	},
	// Pricing fields for update
	{
		displayName: 'Price',
		name: 'price',
		type: 'number',
		displayOptions: {
			show: {
				resource: ['product'],
				operation: ['update'],
				productStructure: ['simple'],
			},
		},
		default: null,
		description: 'Selling price for the simple product (leave empty to keep current price)',
		typeOptions: {
			numberPrecision: 2,
			minValue: 0,
		},
	},
	{
		displayName: 'Buy Price',
		name: 'buyPrice',
		type: 'number',
		displayOptions: {
			show: {
				resource: ['product'],
				operation: ['update'],
				productStructure: ['simple'],
			},
		},
		default: null,
		description: 'Cost/buy price for the simple product (leave empty to keep current price)',
		typeOptions: {
			numberPrecision: 2,
			minValue: 0,
		},
	},
	{
		displayName: 'Discount Price',
		name: 'discountPrice',
		type: 'number',
		displayOptions: {
			show: {
				resource: ['product'],
				operation: ['update'],
				productStructure: ['simple'],
			},
		},
		default: null,
		description: 'Discount price for the simple product (leave empty to keep current price)',
		typeOptions: {
			numberPrecision: 2,
			minValue: 0,
		},
	},
	// SKU fields
	{
		displayName: 'SKU',
		name: 'sku',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['product'],
				operation: ['create'],
				productStructure: ['simple'],
			},
		},
		default: '',
		description: 'SKU for the simple product (optional)',
	},
	{
		displayName: 'SKU',
		name: 'sku',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['product'],
				operation: ['update'],
				productStructure: ['simple'],
			},
		},
		default: '',
		description: 'SKU for the simple product (leave empty to keep current SKU)',
	},
	// Variant ID for update
	{
		displayName: 'Variant ID',
		name: 'variantId',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['product'],
				operation: ['update'],
				productStructure: ['simple'],
			},
		},
		default: '',
		description: 'ID of the variant to update (required for updating pricing/SKU)',
	},
	// Stock related fields
	{
		displayName: 'Stock Count',
		name: 'stockCount',
		type: 'number',
		displayOptions: {
			show: {
				resource: ['product'],
				operation: ['create', 'update'],
				productStructure: ['simple'],
			},
		},
		default: 0,
		description: 'Initial stock count for the simple product',
		typeOptions: {
			minValue: 0,
		},
	},
	{
		displayName: 'Stock Location',
		name: 'stockLocationId',
		type: 'options',
		typeOptions: {
			loadOptionsMethod: 'getStockLocations',
		},
		displayOptions: {
			show: {
				resource: ['product'],
				operation: ['create', 'update'],
				productStructure: ['simple'],
			},
		},
		default: '',
		description:
			'Select the stock location where the stock will be stored. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
	},
	// Description fields
	{
		displayName: 'Description',
		name: 'description',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['product'],
				operation: ['create'],
			},
		},
		default: '',
		description: 'Product description',
	},
	{
		displayName: 'Description',
		name: 'description',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['product'],
				operation: ['update'],
			},
		},
		default: '',
		description: 'Product description (leave empty to keep current description)',
	},
	{
		displayName: 'Short Description',
		name: 'shortDescription',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['product'],
				operation: ['create', 'update'],
			},
		},
		default: '',
		description: 'Short description of the product',
	},
	// Weight fields
	{
		displayName: 'Weight',
		name: 'weight',
		type: 'number',
		displayOptions: {
			show: {
				resource: ['product'],
				operation: ['create'],
			},
		},
		default: 0,
		description: 'Weight of the product',
	},
	{
		displayName: 'Weight',
		name: 'weight',
		type: 'number',
		displayOptions: {
			show: {
				resource: ['product'],
				operation: ['update'],
			},
		},
		default: null,
		description: 'Weight of the product (leave empty to keep current weight)',
	},
	// Other common fields
	{
		displayName: 'Max Quantity Per Cart',
		name: 'maxQuantityPerCart',
		type: 'number',
		displayOptions: {
			show: {
				resource: ['product'],
				operation: ['create', 'update'],
			},
		},
		default: 0,
		description: 'Maximum quantity allowed per cart',
	},
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
			'Select the sales channels where this product will be available. Choose from the list. Choose from the list, or specify IDs using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
	},
];
