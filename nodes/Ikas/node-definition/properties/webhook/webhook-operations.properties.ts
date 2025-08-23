import type { INodeProperties } from 'n8n-workflow';

export const webhookOperationProperty: INodeProperties = {
	displayName: 'Operation',
	name: 'operation',
	type: 'options',
	noDataExpression: true,
	displayOptions: {
		show: {
			resource: ['webhook'],
		},
	},
	options: [
		{
			name: 'Create',
			value: 'create',
			description: 'Create a new webhook',
			action: 'Create a webhook',
		},
		{
			name: 'Delete',
			value: 'delete',
			description: 'Delete webhooks by scope',
			action: 'Delete webhooks',
		},
		{
			name: 'Get Many',
			value: 'getMany',
			description: 'List all webhooks',
			action: 'Get many webhooks',
		},
	],
	default: 'getMany',
};
