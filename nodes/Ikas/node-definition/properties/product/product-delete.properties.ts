import type { INodeProperties } from 'n8n-workflow';

export const productDeleteProperties: INodeProperties[] = [
	{
		displayName: 'Product IDs',
		name: 'productIds',
		type: 'fixedCollection',
		typeOptions: {
			multipleValues: true,
		},
		displayOptions: {
			show: {
				resource: ['product'],
				operation: ['delete'],
			},
		},
		default: {},
		placeholder: 'Add Product ID',
		options: [
			{
				name: 'productIds',
				displayName: 'Product ID',
				values: [
					{
						displayName: 'Product ID',
						name: 'productId',
						type: 'string',
						default: '',
						placeholder: 'e.g., 12345',
						description: 'The ID of the product to delete',
						required: true,
					},
				],
			},
		],
		description: 'The IDs of the products to delete',
		required: true,
	},
];
