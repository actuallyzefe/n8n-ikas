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
			name: 'Create',
			value: 'create',
			description: 'Create a new product',
			action: 'Create a product',
		},
		{
			name: 'Update',
			value: 'update',
			description: 'Update an existing product',
			action: 'Update a product',
		},
	],
	default: 'getMany',
};
