import type { INodeProperties } from 'n8n-workflow';

export const productOperationProperty: INodeProperties = {
	displayName: 'Operation',
	name: 'operation',
	type: 'options',
	noDataExpression: true,
	displayOptions: {
		show: {
			resource: ['product'],
		},
	},
	options: [
		{
			name: 'Create',
			value: 'create',
			description: 'Create a new product',
			action: 'Create a product',
		},
		{
			name: 'Delete',
			value: 'delete',
			description: 'Delete multiple products',
			action: 'Delete products',
		},
		{
			name: 'Get Many',
			value: 'getMany',
			description: 'Get multiple products',
			action: 'Get many products',
		},
		{
			name: 'Search',
			value: 'search',
			description: 'Search products with filters',
			action: 'Search products',
		},
		{
			name: 'Update',
			value: 'update',
			description: 'Update an existing product',
			action: 'Update a product',
		},
		{
			name: 'Upload Image',
			value: 'uploadImage',
			description: 'Upload image to product variants',
			action: 'Upload image to product',
		},
	],
	default: 'getMany',
};
