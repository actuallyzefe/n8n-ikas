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
			name: 'Create',
			value: 'create',
			description: 'Create a new customer',
			action: 'Create a customer',
		},
		{
			name: 'Get Many',
			value: 'getMany',
			description: 'Get multiple customers',
			action: 'Get many customers',
		},
		{
			name: 'Update',
			value: 'update',
			description: 'Update an existing customer',
			action: 'Update a customer',
		},
	],
	default: 'getMany',
};
