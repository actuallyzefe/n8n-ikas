import type { INodeProperties } from 'n8n-workflow';

export const webhookDeleteProperties: INodeProperties[] = [
	{
		displayName: 'Event Scopes',
		name: 'scopes',
		type: 'multiOptions',
		required: true,
		displayOptions: {
			show: {
				resource: ['webhook'],
				operation: ['delete'],
			},
		},
		options: [
			{
				name: 'Customer Created',
				value: 'store/customer/created',
			},
			{
				name: 'Customer Favorite Products Created',
				value: 'store/customerFavoriteProducts/created',
			},
			{
				name: 'Customer Favorite Products Updated',
				value: 'store/customerFavoriteProducts/updated',
			},
			{
				name: 'Customer Updated',
				value: 'store/customer/updated',
			},
			{
				name: 'Order Created',
				value: 'store/order/created',
			},
			{
				name: 'Order Updated',
				value: 'store/order/updated',
			},
			{
				name: 'Product Created',
				value: 'store/product/created',
			},
			{
				name: 'Product Updated',
				value: 'store/product/updated',
			},
			{
				name: 'Stock Created',
				value: 'store/stock/created',
			},
			{
				name: 'Stock Updated',
				value: 'store/stock/updated',
			},
		],
		default: [],
		description: 'The event scopes of webhooks to delete',
	},
];
