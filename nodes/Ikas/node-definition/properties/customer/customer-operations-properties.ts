import type { INodeProperties } from 'n8n-workflow';

export const customerOperationProperty: INodeProperties = {
	displayName: 'Operation',
	name: 'operation',
	type: 'options',
	noDataExpression: true,
	displayOptions: {
		show: {
			resource: ['customer'],
		},
	},
	options: [
		{
			name: 'Get Many',
			value: 'getMany',
			description: 'Get multiple customers',
			action: 'Get many customers',
		},
	],
	default: 'getMany',
};
