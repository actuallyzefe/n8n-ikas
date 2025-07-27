import type { INodeProperties } from 'n8n-workflow';

export const productSearchProperties: INodeProperties[] = [
	{
		displayName: 'Search Query',
		name: 'searchQuery',
		type: 'string',
		default: '',
		displayOptions: {
			show: {
				resource: ['product'],
				operation: ['search'],
			},
		},
		description: 'Search term to find products by name, description, or other text fields',
	},
	{
		displayName: 'Product IDs',
		name: 'productIdList',
		type: 'string',
		default: '',
		displayOptions: {
			show: {
				resource: ['product'],
				operation: ['search'],
			},
		},
		description: 'Comma-separated list of product IDs to search for',
	},
	{
		displayName: 'SKU List',
		name: 'skuList',
		type: 'string',
		default: '',
		displayOptions: {
			show: {
				resource: ['product'],
				operation: ['search'],
			},
		},
		description: 'Comma-separated list of SKUs to search for',
	},
	{
		displayName: 'Barcode List',
		name: 'barcodeList',
		type: 'string',
		default: '',
		displayOptions: {
			show: {
				resource: ['product'],
				operation: ['search'],
			},
		},
		description: 'Comma-separated list of barcodes to search for',
	},
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		displayOptions: {
			show: {
				resource: ['product'],
				operation: ['search'],
			},
		},
		default: false,
		description: 'Whether to return all results or only up to a given limit',
	},
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		displayOptions: {
			show: {
				resource: ['product'],
				operation: ['search'],
				returnAll: [false],
			},
		},
		typeOptions: {
			minValue: 1,
		},
		default: 50,
		description: 'Max number of results to return',
	},
	{
		displayName: 'Page',
		name: 'page',
		type: 'number',
		displayOptions: {
			show: {
				resource: ['product'],
				operation: ['search'],
				returnAll: [false],
			},
		},
		typeOptions: {
			minValue: 1,
		},
		default: 1,
		description: 'Page number for pagination',
	},
];
