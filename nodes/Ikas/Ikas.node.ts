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
import { GetOrdersQuery } from './graphql/queries/GetOrders';
import { GetStockLocationsQuery } from './graphql/queries/GetStockLocations';
import { SaveProductMutation } from './graphql/mutations/SaveProduct';
import { SaveStockLocationsMutation } from './graphql/mutations/SaveStockLocations';

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
				name: 'ikasApi',
				required: true,
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
						name: 'Get Many',
						value: 'getMany',
						description: 'Get multiple orders',
						action: 'Get many orders',
					},
				],
				default: 'getMany',
			},
			// Order Parameters
			{
				displayName: 'Additional Filters',
				name: 'additionalFilters',
				type: 'collection',
				placeholder: 'Add Filter',
				default: {},
				displayOptions: {
					show: {
						resource: ['order'],
						operation: ['getMany'],
					},
				},
				options: [
					{
						displayName: 'Customer Email',
						name: 'customerEmail',
						type: 'string',
						default: '',
						description: 'Filter by customer email',
					},
					{
						displayName: 'Customer ID',
						name: 'customerId',
						type: 'string',
						default: '',
						description: 'Filter by customer ID',
					},
					{
						displayName: 'Order Number',
						name: 'orderNumber',
						type: 'string',
						default: '',
						description: 'Filter by order number',
					},
					{
						displayName: 'Order Status',
						name: 'status',
						type: 'multiOptions',
						default: [],
						description: 'Filter orders by status',
						options: [
							{ name: 'Cancelled', value: 'CANCELLED' },
							{ name: 'Confirmed', value: 'CONFIRMED' },
							{ name: 'Created', value: 'CREATED' },
							{ name: 'Fulfilled', value: 'FULFILLED' },
							{ name: 'Partially Fulfilled', value: 'PARTIALLY_FULFILLED' },
							{ name: 'Refunded', value: 'REFUNDED' },
						],
					},
					{
						displayName: 'Package Status',
						name: 'packageStatus',
						type: 'multiOptions',
						default: [],
						description: 'Filter orders by package status',
						options: [
							{ name: 'Cancelled', value: 'CANCELLED' },
							{ name: 'Delivered', value: 'DELIVERED' },
							{ name: 'Preparing', value: 'PREPARING' },
							{ name: 'Ready for Shipment', value: 'READY_FOR_SHIPMENT' },
							{ name: 'Refunded', value: 'REFUNDED' },
							{ name: 'Returned', value: 'RETURNED' },
							{ name: 'Shipped', value: 'SHIPPED' },
						],
					},
					{
						displayName: 'Payment Status',
						name: 'paymentStatus',
						type: 'multiOptions',
						default: [],
						description: 'Filter orders by payment status',
						options: [
							{ name: 'Cancelled', value: 'CANCELLED' },
							{ name: 'Failed', value: 'FAILED' },
							{ name: 'Paid', value: 'PAID' },
							{ name: 'Partially Paid', value: 'PARTIALLY_PAID' },
							{ name: 'Partially Refunded', value: 'PARTIALLY_REFUNDED' },
							{ name: 'Pending', value: 'PENDING' },
							{ name: 'Refunded', value: 'REFUNDED' },
						],
					},
					{
						displayName: 'Sales Channel ID',
						name: 'salesChannelId',
						type: 'string',
						default: '',
						description: 'Filter by sales channel ID',
					},
				],
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
				description: 'Whether to return all results or only up to a given limit',
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
						name: 'Physical',
						value: 'PHYSICAL',
					},
					{
						name: 'Digital',
						value: 'DIGITAL',
					},
					{
						name: 'Bundle',
						value: 'BUNDLE',
					},
					{
						name: 'Membership',
						value: 'MEMBERSHIP',
					},
				],
				default: 'PHYSICAL',
				description: 'Type of the product',
				required: true,
			},
			{
				displayName: 'Product Structure',
				name: 'productStructure',
				type: 'options',
				displayOptions: {
					show: {
						resource: ['product'],
						operation: ['create', 'update'],
					},
				},
				options: [
					{
						name: 'Simple Product',
						value: 'simple',
					},
				],
				default: 'simple',
				description:
					'Currently only simple products are supported. Variable products are under development.',
				required: true,
			},
			{
				displayName: 'Price',
				name: 'price',
				type: 'number',
				displayOptions: {
					show: {
						resource: ['product'],
						operation: ['create', 'update'],
						productStructure: ['simple'],
					},
				},
				default: 0,
				description: 'Selling price for the simple product',
				typeOptions: {
					numberPrecision: 2,
					minValue: 0,
				},
			},
			{
				displayName: 'Buy Price',
				name: 'buyPrice',
				type: 'number',
				displayOptions: {
					show: {
						resource: ['product'],
						operation: ['create', 'update'],
						productStructure: ['simple'],
					},
				},
				default: 0,
				description: 'Cost/buy price for the simple product',
				typeOptions: {
					numberPrecision: 2,
					minValue: 0,
				},
			},
			{
				displayName: 'Discount Price',
				name: 'discountPrice',
				type: 'number',
				displayOptions: {
					show: {
						resource: ['product'],
						operation: ['create', 'update'],
						productStructure: ['simple'],
					},
				},
				default: null,
				description: 'Discount price for the simple product (optional)',
				typeOptions: {
					numberPrecision: 2,
					minValue: 0,
				},
			},
			{
				displayName: 'SKU',
				name: 'sku',
				type: 'string',
				displayOptions: {
					show: {
						resource: ['product'],
						operation: ['create', 'update'],
						productStructure: ['simple'],
					},
				},
				default: '',
				description: 'SKU for the simple product (optional)',
			},
			{
				displayName: 'Stock Count',
				name: 'stockCount',
				type: 'number',
				displayOptions: {
					show: {
						resource: ['product'],
						operation: ['create', 'update'],
						productStructure: ['simple'],
					},
				},
				default: 0,
				description: 'Initial stock count for the simple product',
				typeOptions: {
					minValue: 0,
				},
			},
			{
				displayName: 'Stock Location Name',
				name: 'stockLocationName',
				type: 'string',
				displayOptions: {
					show: {
						resource: ['product'],
						operation: ['create', 'update'],
						productStructure: ['simple'],
					},
					hide: {
						stockCount: [0],
					},
				},
				default: '',
				description:
					'Name of the stock location where the stock will be stored (partial names supported)',
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
						displayName: 'Base Unit',
						name: 'baseUnit',
						type: 'json',
						default: '{}',
						description: 'JSON object defining the base unit (baseAmount, type)',
					},
					{
						displayName: 'Dynamic Price List IDs',
						name: 'dynamicPriceListIds',
						type: 'string',
						default: '',
						description: 'Comma-separated list of dynamic price list IDs',
					},
					{
						displayName: 'Google Taxonomy ID',
						name: 'googleTaxonomyId',
						type: 'string',
						default: '',
						description: 'Google taxonomy ID for the product',
					},
					{
						displayName: 'Group Variants By Variant Type ID',
						name: 'groupVariantsByVariantTypeId',
						type: 'string',
						default: '',
						description: 'Variant type ID to group variants by',
					},
					{
						displayName: 'Hidden Sales Channel IDs',
						name: 'hiddenSalesChannelIds',
						type: 'string',
						default: '',
						description: 'Comma-separated list of hidden sales channel IDs',
					},
					{
						displayName: 'Meta Data',
						name: 'metaData',
						type: 'json',
						default: '{}',
						description: 'JSON object with meta data (title, description, keywords)',
					},
					{
						displayName: 'Product Attributes',
						name: 'attributes',
						type: 'json',
						default: '[]',
						description: 'JSON array of product attributes',
					},
					{
						displayName: 'Product Option Set ID',
						name: 'productOptionSetId',
						type: 'string',
						default: '',
						description: 'Option set ID for the product',
					},
					{
						displayName: 'Product Volume Discount ID',
						name: 'productVolumeDiscountId',
						type: 'string',
						default: '',
						description: 'Volume discount ID for the product',
					},
					{
						displayName: 'Translations',
						name: 'translations',
						type: 'json',
						default: '[]',
						description: 'JSON array of translations (locale, name, description)',
					},
					{
						displayName: 'Vendor ID',
						name: 'vendorId',
						type: 'string',
						default: '',
						description: 'Vendor ID for the product',
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

						const salesChannelIds = this.getNodeParameter('salesChannelIds', i) as string;
						if (salesChannelIds) {
							productInput.salesChannelIds = salesChannelIds;
						}

						// Generate a default variant for simple products
						const price = this.getNodeParameter('price', i) as number;
						const buyPrice = this.getNodeParameter('buyPrice', i) as number;
						const discountPrice = this.getNodeParameter('discountPrice', i) as number;
						const sku = this.getNodeParameter('sku', i) as string;
						const stockCount = this.getNodeParameter('stockCount', i) as number;
						const stockLocationName = this.getNodeParameter('stockLocationName', i) as string;

						const defaultVariant: any = {
							isActive: true,
							prices: [
								{
									sellPrice: price || 0,
									buyPrice: buyPrice || 0,
									discountPrice: discountPrice || null,
								},
							],
						};

						// Add SKU if provided
						if (sku) {
							defaultVariant.sku = sku;
						}

						productInput.variants = [defaultVariant];

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

						this.logger.info(JSON.stringify(response, null, 2), {
							message: 'Response is here',
						});

						responseData = response.data?.saveProduct || {};

						// Handle stock management after product creation
						if (stockCount > 0 && stockLocationName) {
							try {
								const productId = responseData.id;
								const variantId = responseData.variants?.[0]?.id;

								this.logger.info(JSON.stringify(productId, null, 2), {
									message: 'Product ID is here',
								});
								this.logger.info(JSON.stringify(variantId, null, 2), {
									message: 'Variant ID is here',
								});

								if (productId && variantId) {
									// First, find the stock location by name
									const stockLocationResponse = await ikasGraphQLRequest.call(
										this,
										GetStockLocationsQuery,
										{
											name: {
												like: stockLocationName,
											},
										},
									);

									this.logger.info(JSON.stringify(stockLocationResponse, null, 2), {
										message: 'Stock location response is here',
									});

									const stockLocations = stockLocationResponse.data?.listStockLocation || [];

									this.logger.info(JSON.stringify(stockLocations, null, 2), {
										message: 'Stock locations are here',
									});

									if (stockLocations.length === 0) {
										throw new Error(`No stock location found matching name: ${stockLocationName}`);
									}

									// Use the first matching stock location
									const stockLocation = stockLocations[0];
									const stockLocationId = stockLocation.id;

									this.logger.info(
										`Found stock location: ${stockLocation.name} (ID: ${stockLocationId})`,
									);

									const stockInput = {
										productStockLocationInputs: [
											{
												productId: productId,
												variantId: variantId,
												stockLocationId: stockLocationId,
												stockCount: stockCount,
											},
										],
									};

									const stockResponse = await ikasGraphQLRequest.call(
										this,
										SaveStockLocationsMutation,
										{
											input: stockInput,
										},
									);

									this.logger.info(JSON.stringify(stockResponse, null, 2), {
										message: 'Stock management response',
									});

									// Add stock information to the response data
									if (stockResponse.data?.saveProductStockLocations === true) {
										responseData.stockCreated = true;
										responseData.stockLocationUsed = {
											id: stockLocationId,
											name: stockLocation.name,
											stockCount: stockCount,
										};
									}
								} else {
									this.logger.warn('Could not create stock: missing product ID or variant ID');
								}
							} catch (stockError) {
								this.logger.error(JSON.stringify(stockError, null, 2), {
									message: 'Stock error is here',
								});
								this.logger.error('Failed to create stock after product creation', {
									error: stockError,
									productId: responseData.id,
									stockCount,
									stockLocationName,
								});
								// Don't throw - product was created successfully, just stock failed
							}
						}

						this.logger.info(JSON.stringify(responseData, null, 2), {
							message: 'Response data is here',
						});
					} else {
						throw new NodeOperationError(
							this.getNode(),
							`Operation "${operation}" is not yet implemented for resource "${resource}"`,
							{ itemIndex: i },
						);
					}
				} else if (resource === 'order') {
					if (operation === 'getMany') {
						// Build order filter variables
						const orderVariables: any = {};

						// Handle additional filters
						const additionalFilters = this.getNodeParameter('additionalFilters', i) as any;
						if (additionalFilters && Object.keys(additionalFilters).length > 0) {
							// Order status filter - using proper filter format
							if (additionalFilters.status && additionalFilters.status.length > 0) {
								orderVariables.status = {
									in: additionalFilters.status,
								};
							}

							// Payment status filter - using proper filter format
							if (additionalFilters.paymentStatus && additionalFilters.paymentStatus.length > 0) {
								orderVariables.orderPaymentStatus = {
									in: additionalFilters.paymentStatus,
								};
							}

							// Package status filter - using proper filter format
							if (additionalFilters.packageStatus && additionalFilters.packageStatus.length > 0) {
								orderVariables.orderPackageStatus = {
									in: additionalFilters.packageStatus,
								};
							}

							// Customer filters - using proper filter format
							if (additionalFilters.customerId) {
								orderVariables.customerId = {
									eq: additionalFilters.customerId,
								};
							}
							if (additionalFilters.customerEmail) {
								orderVariables.customerEmail = {
									eq: additionalFilters.customerEmail,
								};
							}

							// Order number filter - using proper filter format
							if (additionalFilters.orderNumber) {
								orderVariables.orderNumber = {
									eq: additionalFilters.orderNumber,
								};
							}

							// Sales channel filter - using proper filter format
							if (additionalFilters.salesChannelId) {
								orderVariables.salesChannelId = {
									eq: additionalFilters.salesChannelId,
								};
							}
						}

						const response = await ikasGraphQLRequest.call(this, GetOrdersQuery, orderVariables);

						responseData = response.data?.listOrder || {};

						this.logger.info(JSON.stringify(responseData, null, 2), {
							message: 'Orders are here',
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

				// Handle different response structures
				let dataToReturn: any[] = [];

				if (resource === 'order' && operation === 'getMany') {
					// For orders, extract the data array and include pagination info
					const orders = responseData.data || [];
					const paging = {
						page: responseData.page,
						limit: responseData.limit,
						count: responseData.count,
					};

					dataToReturn = orders.map((order: any) => ({
						...order,
						_pagination: paging,
					}));
				} else if (resource === 'product' && operation === 'search') {
					// For product search, handle the search response structure
					const products = responseData.data || [];
					const paging = responseData.paging || {};

					dataToReturn = products.map((product: any) => ({
						...product,
						_pagination: paging,
					}));
				} else if (Array.isArray(responseData)) {
					// For arrays (like getMany products)
					dataToReturn = responseData;
				} else {
					// For single objects (like create/update operations)
					dataToReturn = [responseData || {}];
				}

				const executionData = this.helpers.constructExecutionMetaData(
					dataToReturn.map((item) => ({ json: item })),
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
