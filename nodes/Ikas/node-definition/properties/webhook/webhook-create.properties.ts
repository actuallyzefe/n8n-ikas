import type { INodeProperties } from 'n8n-workflow';

export const webhookCreateProperties: INodeProperties[] = [
	{
		displayName: 'Endpoint URL',
		name: 'endpoint',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['webhook'],
				operation: ['create'],
			},
		},
		default: '',
		placeholder: 'https://your-webhook-endpoint.com/webhook',
		description: 'The URL where IKAS will send webhook notifications',
	},
	{
		displayName: 'Event Scope',
		name: 'scope',
		type: 'options',
		required: true,
		displayOptions: {
			show: {
				resource: ['webhook'],
				operation: ['create'],
			},
		},
		options: [
			{
				name: 'Customer Created',
				value: 'store/customer/created',
				description: 'Triggers when a new customer is created',
			},
			{
				name: 'Customer Favorite Products Created',
				value: 'store/customerFavoriteProducts/created',
				description: 'Triggers when a customer adds a product to favorites',
			},
			{
				name: 'Customer Favorite Products Updated',
				value: 'store/customerFavoriteProducts/updated',
				description: 'Triggers when customer favorite products are updated',
			},
			{
				name: 'Customer Updated',
				value: 'store/customer/updated',
				description: 'Triggers when a customer is updated',
			},
			{
				name: 'Order Created',
				value: 'store/order/created',
				description: 'Triggers when a new order is created',
			},
			{
				name: 'Order Updated',
				value: 'store/order/updated',
				description: 'Triggers when an order is updated',
			},
			{
				name: 'Product Created',
				value: 'store/product/created',
				description: 'Triggers when a new product is created',
			},
			{
				name: 'Product Updated',
				value: 'store/product/updated',
				description: 'Triggers when a product is updated',
			},
			{
				name: 'Stock Created',
				value: 'store/stock/created',
				description: 'Triggers when new stock is created',
			},
			{
				name: 'Stock Updated',
				value: 'store/stock/updated',
				description: 'Triggers when stock is updated',
			},
		],
		default: 'store/order/created',
		description: 'The event that will trigger the webhook',
	},
];
