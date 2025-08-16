import type { INodeProperties } from 'n8n-workflow';

export const orderDeleteProperties: INodeProperties[] = [
	{
		displayName: 'Order List IDs',
		name: 'orderListIds',
		type: 'fixedCollection',
		typeOptions: {
			multipleValues: true,
		},
		displayOptions: {
			show: {
				resource: ['order'],
				operation: ['deleteOrderList'],
			},
		},
		default: {},
		placeholder: 'Add Order List ID',
		options: [
			{
				name: 'orderListIds',
				displayName: 'Order List ID',
				values: [
					{
						displayName: 'Order List ID',
						name: 'orderListId',
						type: 'string',
						default: '',
						placeholder: 'e.g., 12345',
						description: 'The ID of the product order list to delete',
						required: true,
					},
				],
			},
		],
		description: 'The IDs of the product order lists to delete',
		required: true,
	},
];
