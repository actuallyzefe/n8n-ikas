import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
import { NodeConnectionType, NodeOperationError } from 'n8n-workflow';

import { ikasGraphQLRequest } from './GenericFunctions';
import { SearchProductsQuery } from './graphql/queries/SearchProducts';
import { GetProductsQuery } from './graphql/queries/GetProducts';

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
						name: 'Get Many',
						value: 'getMany',
						description: 'Get multiple products',
						action: 'Get many products',
					},
					{
						name: 'Search',
						value: 'search',
						description: 'Search products with filters',
						action: 'Search products',
					},
				],
				default: 'getMany',
			},
			// Product Search Parameters
			{
				displayName: 'Search Query',
				name: 'searchQuery',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						resource: ['product'],
						operation: ['search'],
					},
				},
				description: 'Search term to find products by name, description, or other text fields',
			},
			{
				displayName: 'Product IDs',
				name: 'productIdList',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						resource: ['product'],
						operation: ['search'],
					},
				},
				description: 'Comma-separated list of product IDs to search for',
			},
			{
				displayName: 'SKU List',
				name: 'skuList',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						resource: ['product'],
						operation: ['search'],
					},
				},
				description: 'Comma-separated list of SKUs to search for',
			},
			{
				displayName: 'Barcode List',
				name: 'barcodeList',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						resource: ['product'],
						operation: ['search'],
					},
				},
				description: 'Comma-separated list of barcodes to search for',
			},
			{
				displayName: 'Return All',
				name: 'returnAll',
				type: 'boolean',
				displayOptions: {
					show: {
						resource: ['product'],
						operation: ['search'],
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
						resource: ['product'],
						operation: ['search'],
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
			{
				displayName: 'Page',
				name: 'page',
				type: 'number',
				displayOptions: {
					show: {
						resource: ['product'],
						operation: ['search'],
						returnAll: [false],
					},
				},
				typeOptions: {
					minValue: 1,
				},
				default: 1,
				description: 'Page number for pagination',
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
					if (operation === 'getMany') {
						const response = await ikasGraphQLRequest.call(this, GetProductsQuery);

						responseData = response.data?.listProduct?.data || [];
					} else if (operation === 'search') {
						// Build search input variables
						const searchInput: any = {};

						const searchQuery = this.getNodeParameter('searchQuery', i) as string;
						if (searchQuery) {
							searchInput.query = searchQuery;
						}

						const productIdList = this.getNodeParameter('productIdList', i) as string;
						if (productIdList) {
							searchInput.productIdList = productIdList
								.split(',')
								.map((id) => id.trim())
								.filter((id) => id);
						}

						const skuList = this.getNodeParameter('skuList', i) as string;
						if (skuList) {
							searchInput.skuList = skuList
								.split(',')
								.map((sku) => sku.trim())
								.filter((sku) => sku);
						}

						const barcodeList = this.getNodeParameter('barcodeList', i) as string;
						if (barcodeList) {
							searchInput.barcodeList = barcodeList
								.split(',')
								.map((barcode) => barcode.trim())
								.filter((barcode) => barcode);
						}

						// Handle pagination
						const returnAll = this.getNodeParameter('returnAll', i) as boolean;
						if (!returnAll) {
							const limit = this.getNodeParameter('limit', i) as number;
							const page = this.getNodeParameter('page', i) as number;
							searchInput.pagination = {
								limit,
								page,
							};
						}

						const response = await ikasGraphQLRequest.call(this, SearchProductsQuery, {
							input: searchInput,
						});

						responseData = response.data?.searchProducts || {};

						this.logger.info(JSON.stringify(responseData, null, 2), {
							message: 'Search Products are here',
						});
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
