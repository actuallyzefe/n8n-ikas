import type { INodeProperties } from 'n8n-workflow';

export const orderOperationProperty: INodeProperties = {
	displayName: 'Operation',
	name: 'operation',
	type: 'options',
	noDataExpression: true,
	displayOptions: {
		show: {
			resource: ['order'],
		},
	},
	options: [
		{
			name: 'Get Many',
			value: 'getMany',
			description: 'Get multiple orders',
			action: 'Get many orders',
		},
		{
			name: 'Fulfill',
			value: 'fulfill',
			description: 'Fulfill order lines',
			action: 'Fulfill an order',
		},
		{
			name: 'Update Package Status',
			value: 'updatePackageStatus',
			description: 'Update order package status',
			action: 'Update package status',
		},
		{
			name: 'Delete Product Orders',
			value: 'deleteOrderList',
			description: 'Delete multiple product orders',
			action: 'Delete product orders',
		},
	],
	default: 'getMany',
};
