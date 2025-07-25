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
import { SaveProductMutation } from './graphql/mutations/SaveProduct';

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
			// Product Create/Update Parameters
			{
				displayName: 'Product ID',
				name: 'productId',
				type: 'string',
				displayOptions: {
					show: {
						resource: ['product'],
						operation: ['update'],
					},
				},
				default: '',
				description: 'ID of the product to update',
				required: true,
			},
			{
				displayName: 'Product Name',
				name: 'productName',
				type: 'string',
				displayOptions: {
					show: {
						resource: ['product'],
						operation: ['create', 'update'],
					},
				},
				default: '',
				description: 'Name of the product',
				required: true,
			},
			{
				displayName: 'Product Type',
				name: 'productType',
				type: 'options',
				displayOptions: {
					show: {
						resource: ['product'],
						operation: ['create', 'update'],
					},
				},
				options: [
					{
						name: 'Simple',
						value: 'SIMPLE',
					},
					{
						name: 'Variable',
						value: 'VARIABLE',
					},
					{
						name: 'Grouped',
						value: 'GROUPED',
					},
				],
				default: 'SIMPLE',
				description: 'Type of the product',
				required: true,
			},
			{
				displayName: 'Description',
				name: 'description',
				type: 'string',
				displayOptions: {
					show: {
						resource: ['product'],
						operation: ['create', 'update'],
					},
				},
				default: '',
				description: 'Product description',
			},
			{
				displayName: 'Short Description',
				name: 'shortDescription',
				type: 'string',
				displayOptions: {
					show: {
						resource: ['product'],
						operation: ['create', 'update'],
					},
				},
				default: '',
				description: 'Short description of the product',
			},
			{
				displayName: 'Weight',
				name: 'weight',
				type: 'number',
				displayOptions: {
					show: {
						resource: ['product'],
						operation: ['create', 'update'],
					},
				},
				default: 0,
				description: 'Weight of the product',
			},
			{
				displayName: 'Max Quantity Per Cart',
				name: 'maxQuantityPerCart',
				type: 'number',
				displayOptions: {
					show: {
						resource: ['product'],
						operation: ['create', 'update'],
					},
				},
				default: 0,
				description: 'Maximum quantity allowed per cart',
			},
			{
				displayName: 'Brand ID',
				name: 'brandId',
				type: 'string',
				displayOptions: {
					show: {
						resource: ['product'],
						operation: ['create', 'update'],
					},
				},
				default: '',
				description: 'ID of the product brand',
			},
			{
				displayName: 'Category IDs',
				name: 'categoryIds',
				type: 'string',
				displayOptions: {
					show: {
						resource: ['product'],
						operation: ['create', 'update'],
					},
				},
				default: '',
				description: 'Comma-separated list of category IDs',
			},
			{
				displayName: 'Tag IDs',
				name: 'tagIds',
				type: 'string',
				displayOptions: {
					show: {
						resource: ['product'],
						operation: ['create', 'update'],
					},
				},
				default: '',
				description: 'Comma-separated list of tag IDs',
			},
			{
				displayName: 'Sales Channel IDs',
				name: 'salesChannelIds',
				type: 'string',
				displayOptions: {
					show: {
						resource: ['product'],
						operation: ['create', 'update'],
					},
				},
				default: '',
				description: 'Comma-separated list of sales channel IDs',
			},
			{
				displayName: 'Variants',
				name: 'variants',
				type: 'json',
				displayOptions: {
					show: {
						resource: ['product'],
						operation: ['create', 'update'],
					},
				},
				default: '[]',
				description:
					'JSON array of product variants. Each variant should include sku, variantValues, prices, stocks, etc.',
			},
			{
				displayName: 'Additional Options',
				name: 'additionalFields',
				type: 'collection',
				placeholder: 'Add Field',
				default: {},
				displayOptions: {
					show: {
						resource: ['product'],
						operation: ['create', 'update'],
					},
				},
				options: [
					{
						displayName: 'Google Taxonomy ID',
						name: 'googleTaxonomyId',
						type: 'string',
						default: '',
						description: 'Google taxonomy ID for the product',
					},
					{
						displayName: 'Product Volume Discount ID',
						name: 'productVolumeDiscountId',
						type: 'string',
						default: '',
						description: 'Volume discount ID for the product',
					},
					{
						displayName: 'Product Option Set ID',
						name: 'productOptionSetId',
						type: 'string',
						default: '',
						description: 'Option set ID for the product',
					},
					{
						displayName: 'Vendor ID',
						name: 'vendorId',
						type: 'string',
						default: '',
						description: 'Vendor ID for the product',
					},
					{
						displayName: 'Hidden Sales Channel IDs',
						name: 'hiddenSalesChannelIds',
						type: 'string',
						default: '',
						description: 'Comma-separated list of hidden sales channel IDs',
					},
					{
						displayName: 'Dynamic Price List IDs',
						name: 'dynamicPriceListIds',
						type: 'string',
						default: '',
						description: 'Comma-separated list of dynamic price list IDs',
					},
					{
						displayName: 'Group Variants By Variant Type ID',
						name: 'groupVariantsByVariantTypeId',
						type: 'string',
						default: '',
						description: 'Variant type ID to group variants by',
					},
					{
						displayName: 'Product Attributes',
						name: 'attributes',
						type: 'json',
						default: '[]',
						description: 'JSON array of product attributes',
					},
					{
						displayName: 'Base Unit',
						name: 'baseUnit',
						type: 'json',
						default: '{}',
						description: 'JSON object defining the base unit (baseAmount, type)',
					},
					{
						displayName: 'Translations',
						name: 'translations',
						type: 'json',
						default: '[]',
						description: 'JSON array of translations (locale, name, description)',
					},
					{
						displayName: 'Meta Data',
						name: 'metaData',
						type: 'json',
						default: '{}',
						description: 'JSON object with meta data (title, description, keywords)',
					},
				],
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
					} else if (operation === 'create' || operation === 'update') {
						// Build product input
						const productInput: any = {
							name: this.getNodeParameter('productName', i) as string,
							type: this.getNodeParameter('productType', i) as string,
						};

						// For update operation, include the product ID
						if (operation === 'update') {
							productInput.id = this.getNodeParameter('productId', i) as string;
						}

						// Add optional fields
						const description = this.getNodeParameter('description', i) as string;
						if (description) {
							productInput.description = description;
						}

						const shortDescription = this.getNodeParameter('shortDescription', i) as string;
						if (shortDescription) {
							productInput.shortDescription = shortDescription;
						}

						const weight = this.getNodeParameter('weight', i) as number;
						if (weight) {
							productInput.weight = weight;
						}

						const maxQuantityPerCart = this.getNodeParameter('maxQuantityPerCart', i) as number;
						if (maxQuantityPerCart) {
							productInput.maxQuantityPerCart = maxQuantityPerCart;
						}

						const brandId = this.getNodeParameter('brandId', i) as string;
						if (brandId) {
							productInput.brandId = brandId;
						}

						// Handle comma-separated lists
						const categoryIds = this.getNodeParameter('categoryIds', i) as string;
						if (categoryIds) {
							productInput.categoryIds = categoryIds
								.split(',')
								.map((id) => id.trim())
								.filter((id) => id);
						}

						const tagIds = this.getNodeParameter('tagIds', i) as string;
						if (tagIds) {
							productInput.tagIds = tagIds
								.split(',')
								.map((id) => id.trim())
								.filter((id) => id);
						}

						const salesChannelIds = this.getNodeParameter('salesChannelIds', i) as string;
						if (salesChannelIds) {
							productInput.salesChannelIds = salesChannelIds
								.split(',')
								.map((id) => id.trim())
								.filter((id) => id);
						}

						// Handle variants (JSON array)
						const variantsJson = this.getNodeParameter('variants', i) as string;
						if (variantsJson) {
							try {
								productInput.variants = JSON.parse(variantsJson);
							} catch (error) {
								throw new NodeOperationError(
									this.getNode(),
									`Invalid JSON in variants field: ${(error as Error).message}`,
									{ itemIndex: i },
								);
							}
						}

						// Handle additional fields
						const additionalFields = this.getNodeParameter('additionalFields', i) as any;
						if (additionalFields) {
							Object.keys(additionalFields).forEach((key) => {
								const value = additionalFields[key];
								if (value !== undefined && value !== '') {
									// Handle comma-separated string fields
									if (key === 'hiddenSalesChannelIds' || key === 'dynamicPriceListIds') {
										productInput[key] = value
											.split(',')
											.map((id: string) => id.trim())
											.filter((id: string) => id);
									}
									// Handle JSON fields
									else if (
										key === 'attributes' ||
										key === 'baseUnit' ||
										key === 'translations' ||
										key === 'metaData'
									) {
										try {
											productInput[key] = JSON.parse(value);
										} catch (error) {
											throw new NodeOperationError(
												this.getNode(),
												`Invalid JSON in ${key} field: ${(error as Error).message}`,
												{ itemIndex: i },
											);
										}
									}
									// Handle regular string fields
									else {
										productInput[key] = value;
									}
								}
							});
						}

						const response = await ikasGraphQLRequest.call(this, SaveProductMutation, {
							input: productInput,
						});

						responseData = response.data?.saveProduct || {};
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
