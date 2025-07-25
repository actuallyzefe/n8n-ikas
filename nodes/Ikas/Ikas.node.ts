import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
import { NodeConnectionType, NodeOperationError } from 'n8n-workflow';

import { ikasGraphQLRequest } from './GenericFunctions';

export class Ikas implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'IKAS',
		name: 'ikas',
		icon: 'file:ikas-icon.svg',
		group: ['output'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Consume IKAS e-commerce platform API',
		defaults: {
			name: 'IKAS',
		},
		usableAsTool: true,
		inputs: [NodeConnectionType.Main],
		outputs: [NodeConnectionType.Main],
		credentials: [
			{
				name: 'ikasAccessTokenApi',
				required: true,
				displayOptions: {
					show: {
						authentication: ['accessToken'],
					},
				},
			},
			{
				name: 'ikasApi',
				required: true,
				displayOptions: {
					show: {
						authentication: ['oAuth2'],
					},
				},
			},
		],
		requestDefaults: {
			baseURL: 'https://api.myikas.com/api/v1/admin',
			headers: {
				'Content-Type': 'application/json',
			},
		},
		properties: [
			{
				displayName: 'Authentication',
				name: 'authentication',
				type: 'options',
				options: [
					{
						name: 'Access Token',
						value: 'accessToken',
					},
					{
						name: 'OAuth2',
						value: 'oAuth2',
					},
				],
				default: 'accessToken',
			},
			{
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
						description: 'Work with orders from your IKAS store',
					},
					{
						name: 'Customer',
						value: 'customer',
						description: 'Work with customers in your IKAS store',
					},
					{
						name: 'Campaign',
						value: 'campaign',
						description: 'Work with discount campaigns in your IKAS store',
					},
					{
						name: 'Inventory',
						value: 'inventory',
						description: 'Work with inventory levels in your IKAS store',
					},
				],
				default: 'product',
			},
			// Product Operations
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['product'],
					},
				},
				options: [
					{
						name: 'Get',
						value: 'get',
						description: 'Get a product by ID',
						action: 'Get a product',
					},
					{
						name: 'Get Many',
						value: 'getMany',
						description: 'Get multiple products',
						action: 'Get many products',
					},
					{
						name: 'Create',
						value: 'create',
						description: 'Create a new product',
						action: 'Create a product',
					},
					{
						name: 'Update',
						value: 'update',
						description: 'Update an existing product',
						action: 'Update a product',
					},
				],
				default: 'get',
			},
			// Order Operations
			{
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
						name: 'Get',
						value: 'get',
						description: 'Get an order by ID',
						action: 'Get an order',
					},
					{
						name: 'Get Many',
						value: 'getMany',
						description: 'Get multiple orders',
						action: 'Get many orders',
					},
					{
						name: 'Update',
						value: 'update',
						description: 'Update an existing order',
						action: 'Update an order',
					},
				],
				default: 'get',
			},
			// Customer Operations
			{
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
						name: 'Get',
						value: 'get',
						description: 'Get a customer by ID',
						action: 'Get a customer',
					},
					{
						name: 'Get Many',
						value: 'getMany',
						description: 'Get multiple customers',
						action: 'Get many customers',
					},
					{
						name: 'Create',
						value: 'create',
						description: 'Create a new customer',
						action: 'Create a customer',
					},
					{
						name: 'Update',
						value: 'update',
						description: 'Update an existing customer',
						action: 'Update a customer',
					},
				],
				default: 'get',
			},
			// Campaign Operations
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['campaign'],
					},
				},
				options: [
					{
						name: 'Get',
						value: 'get',
						description: 'Get a campaign by ID',
						action: 'Get a campaign',
					},
					{
						name: 'Get Many',
						value: 'getMany',
						description: 'Get multiple campaigns',
						action: 'Get many campaigns',
					},
				],
				default: 'get',
			},
			// Inventory Operations
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['inventory'],
					},
				},
				options: [
					{
						name: 'Get',
						value: 'get',
						description: 'Get inventory levels',
						action: 'Get inventory levels',
					},
					{
						name: 'Update',
						value: 'update',
						description: 'Update inventory levels',
						action: 'Update inventory levels',
					},
				],
				default: 'get',
			},
			// Basic ID parameter for single resource operations
			{
				displayName: 'ID',
				name: 'id',
				type: 'string',
				default: '',
				required: true,
				displayOptions: {
					show: {
						operation: ['get', 'update'],
					},
				},
				description: 'The ID of the resource to retrieve or update',
			},
			// Order-specific parameters
			{
				displayName: 'Return All',
				name: 'returnAll',
				type: 'boolean',
				displayOptions: {
					show: {
						resource: ['order'],
						operation: ['getMany'],
					},
				},
				default: false,
				description: 'Whether to return all results or only up to the limit',
			},
			{
				displayName: 'Limit',
				name: 'limit',
				type: 'number',
				displayOptions: {
					show: {
						resource: ['order'],
						operation: ['getMany'],
						returnAll: [false],
					},
				},
				typeOptions: {
					minValue: 1,
					maxValue: 250,
				},
				default: 50,
				description: 'Max number of results to return',
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];
		const resource = this.getNodeParameter('resource', 0) as string;
		const operation = this.getNodeParameter('operation', 0) as string;

		for (let i = 0; i < items.length; i++) {
			try {
				let responseData: any;

				if (resource === 'product') {
					if (operation === 'get') {
						const id = this.getNodeParameter('id', i) as string;
						const response = await ikasGraphQLRequest.call(
							this,
							`
							query GetProduct($id: ID!) {
								product(id: $id) {
									id
									name
									description
									type
									totalStock
									variants {
										id
									}
									categories {
										id
										name
									}
									brand {
										id
										name
									}
								}
							}
							`,
							{ id },
						);

						responseData = response.data?.product;
					} else if (operation === 'getMany') {
						const response = await ikasGraphQLRequest.call(
							this,
							`
							query GetProducts {
								listProduct {
									data {
										id
										name
										description
										type
										totalStock
										variants {
											id
										}
										categories {
											id
											name
										}
										brand {
											id
											name
										}
									}
								}
							}
							`,
						);
						responseData = response.data?.listProduct?.data || [];
					} else {
						throw new NodeOperationError(
							this.getNode(),
							`Operation "${operation}" is not yet implemented for resource "${resource}"`,
							{ itemIndex: i },
						);
					}
				} else {
					throw new NodeOperationError(
						this.getNode(),
						`Resource "${resource}" is not yet implemented`,
						{ itemIndex: i },
					);
				}

				const executionData = this.helpers.constructExecutionMetaData(
					Array.isArray(responseData)
						? responseData.map((item) => ({ json: item }))
						: [{ json: responseData || {} }],
					{ itemData: { item: i } },
				);

				returnData.push(...executionData);
			} catch (error) {
				if (this.continueOnFail()) {
					const executionErrorData = this.helpers.constructExecutionMetaData(
						[{ json: { error: (error as Error).message } }],
						{ itemData: { item: i } },
					);
					returnData.push(...executionErrorData);
					continue;
				}
				throw error;
			}
		}

		return [returnData];
	}
}
