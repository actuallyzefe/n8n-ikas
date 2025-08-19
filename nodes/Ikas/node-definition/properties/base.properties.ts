import type { INodeProperties } from 'n8n-workflow';

export const resourceProperty: INodeProperties = {
	displayName: 'Resource',
	name: 'resource',
	type: 'options',
	noDataExpression: true,
	options: [
		{
			name: 'Product',
			value: 'product',
			description: 'Work with products in your IKAS store',
		},
		{
			name: 'Order',
			value: 'order',
			description: 'Work with orders in your IKAS store',
		},
		{
			name: 'Customer',
			value: 'customer',
			description: 'Work with customers in your IKAS store',
		},
	],
	default: 'product',
};
