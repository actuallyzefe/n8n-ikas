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
			name: 'Delete Product Order Lists',
			value: 'deleteOrderList',
			description: 'Delete product order lists',
			action: 'Delete product order lists',
		},
	],
	default: 'getMany',
};
