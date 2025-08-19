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
	],
	default: 'product',
};

/**
 * Creates pagination properties for getMany operations
 * @param resource - The resource name (e.g., 'product', 'order')
 * @param operation - The operation name (e.g., 'getMany')
 */
export function createPaginationProperties(resource: string, operation: string): INodeProperties[] {
	return [
		{
			displayName: 'Fetch All Items',
			name: 'fetchAllItems',
			type: 'boolean',
			displayOptions: {
				show: {
					resource: [resource],
					operation: [operation],
				},
			},
			default: true,
			description:
				'Whether to automatically fetch all items using pagination. When enabled, the node will continue fetching pages until all data is retrieved.',
		},

		{
			displayName: 'Limit',
			name: 'limit',
			type: 'options',
			displayOptions: {
				show: {
					resource: [resource],
					operation: [operation],
					fetchAllItems: [false],
				},
			},
			options: [
				{ name: '10', value: 10 },
				{ name: '20', value: 20 },
				{ name: '30', value: 30 },
				{ name: '40', value: 40 },
				{ name: '50', value: 50 },
			],
			default: 50,
			description: 'Max number of results to return',
		},
		{
			displayName: 'Page',
			name: 'page',
			type: 'number',
			displayOptions: {
				show: {
					resource: [resource],
					operation: [operation],
					fetchAllItems: [false],
				},
			},
			typeOptions: {
				minValue: 1,
			},
			default: 1,
			description: 'Page number for pagination (starts from 1)',
		},
		{
			displayName: 'Page Size',
			name: 'pageSize',
			type: 'options',
			displayOptions: {
				show: {
					resource: [resource],
					operation: [operation],
					fetchAllItems: [true],
				},
			},
			options: [
				{ name: '10', value: 10 },
				{ name: '20', value: 20 },
				{ name: '30', value: 30 },
				{ name: '40', value: 40 },
				{ name: '50', value: 50 },
			],
			default: 50,
			description: 'Number of items to fetch per page when auto-fetching all items',
		},
	];
}
