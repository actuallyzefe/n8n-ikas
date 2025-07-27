import type {
	IExecuteFunctions,
	ILoadOptionsFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	INodePropertyOptions,
} from 'n8n-workflow';
import { NodeConnectionType, NodeOperationError } from 'n8n-workflow';

import { ikasGraphQLRequest } from './GenericFunctions';
import { SearchProductsQuery } from './graphql/queries/SearchProducts';
import { GetProductsQuery } from './graphql/queries/GetProducts';
import { GetOrdersQuery } from './graphql/queries/GetOrders';
import { GetStockLocationsQuery } from './graphql/queries/GetStockLocations';
import { SaveProductMutation } from './graphql/mutations/SaveProduct';
import { SaveStockLocationsMutation } from './graphql/mutations/SaveStockLocations';
import { FulfillOrderMutation } from './graphql/mutations/FulfillOrder';
import { UpdateOrderPackageStatusMutation } from './graphql/mutations/UpdateOrderPackageStatus';
import { GetProductByIdQuery } from './graphql/queries/GetProductById';
import { GetSalesChannelsQuery } from './graphql/queries/GetSalesChannels';

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
			// Order Fulfill Parameters
			{
				displayName: 'Order ID',
				name: 'orderId',
				type: 'string',
				displayOptions: {
					show: {
						resource: ['order'],
						operation: ['fulfill'],
					},
				},
				default: '',
				description: 'ID of the order to fulfill',
				required: true,
			},
			{
				displayName: 'Order Line Items',
				name: 'fulfillLines',
				type: 'fixedCollection',
				displayOptions: {
					show: {
						resource: ['order'],
						operation: ['fulfill'],
					},
				},
				default: {},
				description: 'Order line items to fulfill',
				typeOptions: {
					multipleValues: true,
				},
				options: [
					{
						name: 'lineItems',
						displayName: 'Line Items',
						values: [
							{
								displayName: 'Order Line Item ID',
								name: 'orderLineItemId',
								type: 'string',
								default: '',
								description: 'ID of the order line item to fulfill',
								required: true,
							},
							{
								displayName: 'Quantity',
								name: 'quantity',
								type: 'number',
								default: 1,
								description: 'Quantity to fulfill',
								typeOptions: {
									minValue: 1,
								},
								required: true,
							},
						],
					},
				],
			},
			{
				displayName: 'Mark as Ready for Shipment',
				name: 'markAsReadyForShipment',
				type: 'boolean',
				displayOptions: {
					show: {
						resource: ['order'],
						operation: ['fulfill'],
					},
				},
				default: false,
				description: 'Whether to mark the order as ready for shipment',
			},
			{
				displayName: 'Send Notification to Customer',
				name: 'sendNotificationToCustomer',
				type: 'boolean',
				displayOptions: {
					show: {
						resource: ['order'],
						operation: ['fulfill'],
					},
				},
				default: false,
				description: 'Whether to send notification to customer',
			},
			{
				displayName: 'Source Package ID',
				name: 'sourcePackageId',
				type: 'string',
				displayOptions: {
					show: {
						resource: ['order'],
						operation: ['fulfill'],
					},
				},
				default: '',
				description: 'ID of the source package (optional)',
			},
			{
				displayName: 'Tracking Information',
				name: 'trackingInfo',
				type: 'collection',
				placeholder: 'Add Tracking Info',
				default: {},
				displayOptions: {
					show: {
						resource: ['order'],
						operation: ['fulfill'],
					},
				},
				options: [
					{
						displayName: 'Barcode',
						name: 'barcode',
						type: 'string',
						default: '',
						description: 'Barcode for the shipment',
					},
					{
						displayName: 'Cargo Company',
						name: 'cargoCompany',
						type: 'string',
						default: '',
						description: 'Name of the cargo/shipping company',
					},
					{
						displayName: 'Cargo Company ID',
						name: 'cargoCompanyId',
						type: 'string',
						default: '',
						description: 'ID of the cargo/shipping company',
					},
					{
						displayName: 'Send Tracking Notification',
						name: 'isSendNotification',
						type: 'boolean',
						default: false,
						description: 'Whether to send tracking notification to customer',
					},
					{
						displayName: 'Tracking Link',
						name: 'trackingLink',
						type: 'string',
						default: '',
						description: 'URL link to track the shipment',
					},
					{
						displayName: 'Tracking Number',
						name: 'trackingNumber',
						type: 'string',
						default: '',
						description: 'Tracking number for the shipment',
					},
				],
			},
			// Update Package Status Parameters
			{
				displayName: 'Order ID',
				name: 'orderIdForPackageStatus',
				type: 'string',
				displayOptions: {
					show: {
						resource: ['order'],
						operation: ['updatePackageStatus'],
					},
				},
				default: '',
				description: 'ID of the order containing packages to update',
				required: true,
			},
			{
				displayName: 'Packages',
				name: 'packageUpdates',
				type: 'fixedCollection',
				displayOptions: {
					show: {
						resource: ['order'],
						operation: ['updatePackageStatus'],
					},
				},
				default: {},
				description: 'Package status updates',
				typeOptions: {
					multipleValues: true,
				},
				options: [
					{
						name: 'packages',
						displayName: 'Packages',
						values: [
							{
								displayName: 'Error Message',
								name: 'errorMessage',
								type: 'string',
								default: '',
								description: 'Error message (optional, typically used with ERROR status)',
							},
							{
								displayName: 'Package ID',
								name: 'packageId',
								type: 'string',
								default: '',
								description: 'ID of the package to update',
								required: true,
							},
							{
								displayName: 'Source ID',
								name: 'sourceId',
								type: 'string',
								default: '',
								description: 'Source ID for the update (optional)',
							},
							{
								displayName: 'Status',
								name: 'status',
								type: 'options',
								default: 'FULFILLED',
								description: 'New status for the package',
								options: [
									{
										name: 'Cancel Rejected',
										value: 'CANCEL_REJECTED',
									},
									{
										name: 'Cancel Requested',
										value: 'CANCEL_REQUESTED',
									},
									{
										name: 'Cancelled',
										value: 'CANCELLED',
									},
									{
										name: 'Delivered',
										value: 'DELIVERED',
									},
									{
										name: 'Error',
										value: 'ERROR',
									},
									{
										name: 'Fulfilled',
										value: 'FULFILLED',
									},
									{
										name: 'Ready for Pick Up',
										value: 'READY_FOR_PICK_UP',
									},
									{
										name: 'Ready for Shipment',
										value: 'READY_FOR_SHIPMENT',
									},
									{
										name: 'Refund Rejected',
										value: 'REFUND_REJECTED',
									},
									{
										name: 'Refund Request Accepted',
										value: 'REFUND_REQUEST_ACCEPTED',
									},
									{
										name: 'Refund Requested',
										value: 'REFUND_REQUESTED',
									},
									{
										name: 'Refunded',
										value: 'REFUNDED',
									},
									{
										name: 'Unable to Deliver',
										value: 'UNABLE_TO_DELIVER',
									},
								],
								required: true,
							},
							{
								displayName: 'Tracking Information',
								name: 'trackingInfo',
								type: 'collection',
								default: {},
								placeholder: 'Add Tracking Info',
								options: [
									{
										displayName: 'Barcode',
										name: 'barcode',
										type: 'string',
										default: '',
										description: 'Barcode for the shipment',
									},
									{
										displayName: 'Cargo Company',
										name: 'cargoCompany',
										type: 'string',
										default: '',
										description: 'Name of the cargo/shipping company',
									},
									{
										displayName: 'Cargo Company ID',
										name: 'cargoCompanyId',
										type: 'string',
										default: '',
										description: 'ID of the cargo/shipping company',
									},
									{
										displayName: 'Send Tracking Notification',
										name: 'isSendNotification',
										type: 'boolean',
										default: false,
										description: 'Whether to send tracking notification to customer',
									},
									{
										displayName: 'Tracking Link',
										name: 'trackingLink',
										type: 'string',
										default: '',
										description: 'URL link to track the shipment',
									},
									{
										displayName: 'Tracking Number',
										name: 'trackingNumber',
										type: 'string',
										default: '',
										description: 'Tracking number for the shipment',
									},
								],
							},
						],
					},
				],
			},
			{
				displayName: 'Global Source ID',
				name: 'globalSourceId',
				type: 'string',
				displayOptions: {
					show: {
						resource: ['order'],
						operation: ['updatePackageStatus'],
					},
				},
				default: '',
				description: 'Global source ID for the entire update operation (optional)',
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
						operation: ['create'],
					},
				},
				default: '',
				description: 'Name of the product',
				required: true,
			},
			{
				displayName: 'Product Name',
				name: 'productName',
				type: 'string',
				displayOptions: {
					show: {
						resource: ['product'],
						operation: ['update'],
					},
				},
				default: '',
				description: 'Name of the product (required by IKAS API)',
				required: true,
			},
			{
				displayName: 'Product Type',
				name: 'productType',
				type: 'options',
				displayOptions: {
					show: {
						resource: ['product'],
						operation: ['create'],
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
				displayName: 'Product Type',
				name: 'productType',
				type: 'options',
				displayOptions: {
					show: {
						resource: ['product'],
						operation: ['update'],
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
				description: 'Type of the product (required by IKAS API)',
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
						operation: ['create'],
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
				displayName: 'Price',
				name: 'price',
				type: 'number',
				displayOptions: {
					show: {
						resource: ['product'],
						operation: ['update'],
						productStructure: ['simple'],
					},
				},
				default: null,
				description: 'Selling price for the simple product (leave empty to keep current price)',
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
						operation: ['create'],
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
				displayName: 'Buy Price',
				name: 'buyPrice',
				type: 'number',
				displayOptions: {
					show: {
						resource: ['product'],
						operation: ['update'],
						productStructure: ['simple'],
					},
				},
				default: null,
				description: 'Cost/buy price for the simple product (leave empty to keep current price)',
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
						operation: ['create'],
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
				displayName: 'Discount Price',
				name: 'discountPrice',
				type: 'number',
				displayOptions: {
					show: {
						resource: ['product'],
						operation: ['update'],
						productStructure: ['simple'],
					},
				},
				default: null,
				description: 'Discount price for the simple product (leave empty to keep current price)',
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
						operation: ['create'],
						productStructure: ['simple'],
					},
				},
				default: '',
				description: 'SKU for the simple product (optional)',
			},
			{
				displayName: 'SKU',
				name: 'sku',
				type: 'string',
				displayOptions: {
					show: {
						resource: ['product'],
						operation: ['update'],
						productStructure: ['simple'],
					},
				},
				default: '',
				description: 'SKU for the simple product (leave empty to keep current SKU)',
			},
			{
				displayName: 'Variant ID',
				name: 'variantId',
				type: 'string',
				displayOptions: {
					show: {
						resource: ['product'],
						operation: ['update'],
						productStructure: ['simple'],
					},
				},
				default: '',
				description: 'ID of the variant to update (required for updating pricing/SKU)',
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
						operation: ['create'],
					},
				},
				default: '',
				description: 'Product description',
			},
			{
				displayName: 'Description',
				name: 'description',
				type: 'string',
				displayOptions: {
					show: {
						resource: ['product'],
						operation: ['update'],
					},
				},
				default: '',
				description: 'Product description (leave empty to keep current description)',
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
						operation: ['create'],
					},
				},
				default: 0,
				description: 'Weight of the product',
			},
			{
				displayName: 'Weight',
				name: 'weight',
				type: 'number',
				displayOptions: {
					show: {
						resource: ['product'],
						operation: ['update'],
					},
				},
				default: null,
				description: 'Weight of the product (leave empty to keep current weight)',
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
				displayName: 'Sales Channels',
				name: 'salesChannelIds',
				type: 'multiOptions',
				typeOptions: {
					loadOptionsMethod: 'getSalesChannels',
				},
				displayOptions: {
					show: {
						resource: ['product'],
						operation: ['create', 'update'],
					},
				},
				default: [],
				description: 'Select the sales channels where this product will be available',
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
						displayName: 'Hidden Sales Channels',
						name: 'hiddenSalesChannelIds',
						type: 'multiOptions',
						typeOptions: {
							loadOptionsMethod: 'getSalesChannels',
						},
						default: [],
						description: 'Select sales channels where this product will be hidden',
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

	methods = {
		loadOptions: {
			async getSalesChannels(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				try {
					const response = await ikasGraphQLRequest.call(this, GetSalesChannelsQuery);
					this.logger.info(JSON.stringify(response, null, 2), {
						message: 'Sales channels response is here',
					});
					const salesChannels = response.data?.listSalesChannel || [];

					this.logger.info(JSON.stringify(salesChannels, null, 2), {
						message: 'Sales channels are here',
					});

					return salesChannels.map((channel: any) => ({
						name: `${channel.name}`,
						value: channel.id,
					}));
				} catch (error) {
					this.logger.error(JSON.stringify(error, null, 2), {
						message: 'Error loading sales channels',
					});
					return [];
				}
			},
		},
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
							searchInput.productIdList = productIdList;
						}

						const skuList = this.getNodeParameter('skuList', i) as string;
						if (skuList) {
							searchInput.skuList = skuList;
						}

						const barcodeList = this.getNodeParameter('barcodeList', i) as string;
						if (barcodeList) {
							searchInput.barcodeList = barcodeList;
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

						responseData = response.data?.searchProducts || { results: [], paging: {} };

						this.logger.info(JSON.stringify(responseData, null, 2), {
							message: 'Search Products are here',
						});
					} else if (operation === 'create') {
						// TODO: This only handles simple products not varianted products.
						const productInput: any = {
							name: this.getNodeParameter('productName', i) as string,
							type: this.getNodeParameter('productType', i) as string,
						};

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

						const salesChannelIds = this.getNodeParameter('salesChannelIds', i) as string[];
						if (salesChannelIds && salesChannelIds.length > 0) {
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
									// Handle array fields that used to be comma-separated strings
									if (key === 'hiddenSalesChannelIds') {
										if (Array.isArray(value) && value.length > 0) {
											productInput[key] = value;
										}
									}
									// Handle comma-separated string fields
									else if (key === 'dynamicPriceListIds') {
										productInput[key] = value;
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
										throw new NodeOperationError(
											this.getNode(),
											`No stock location found matching name: ${stockLocationName}`,
										);
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
					} else if (operation === 'update') {
						// TODO: This only handles simple products not varianted products.
						const productToUpdate = await ikasGraphQLRequest.call(this, GetProductByIdQuery, {
							id: {
								eq: this.getNodeParameter('productId', i) as string,
							},
						});

						const product = productToUpdate.data?.listProduct.data[0] || {};

						this.logger.info(JSON.stringify(product, null, 2), {
							message: 'Product is here',
						});

						const productInput: any = {
							id: this.getNodeParameter('productId', i) as string,
							// These are required by IKAS API even for updates
							name: this.getNodeParameter('productName', i) as string,
							type: this.getNodeParameter('productType', i) as string,
						};

						// Add optional fields only if they are provided (not empty/default values)
						const description = this.getNodeParameter('description', i) as string;
						if (description && description.trim()) {
							productInput.description = description;
						}

						const shortDescription = this.getNodeParameter('shortDescription', i) as string;
						if (shortDescription && shortDescription.trim()) {
							productInput.shortDescription = shortDescription;
						}

						const weight = this.getNodeParameter('weight', i) as number;
						if (weight !== null) {
							productInput.weight = weight;
						}

						const maxQuantityPerCart = this.getNodeParameter('maxQuantityPerCart', i) as number;
						if (maxQuantityPerCart && maxQuantityPerCart > 0) {
							productInput.maxQuantityPerCart = maxQuantityPerCart;
						}

						const salesChannelIds = this.getNodeParameter('salesChannelIds', i) as string[];
						if (salesChannelIds && salesChannelIds.length > 0) {
							productInput.salesChannelIds = salesChannelIds;
						} else if (product.salesChannelIds && product.salesChannelIds.length > 0) {
							// Keep existing sales channels if none specified
							productInput.salesChannelIds = product.salesChannelIds;
						}

						// Handle variant updates - variants are required by IKAS API even for updates
						const price = this.getNodeParameter('price', i) as number;
						const buyPrice = this.getNodeParameter('buyPrice', i) as number;
						const discountPrice = this.getNodeParameter('discountPrice', i) as number;
						const sku = this.getNodeParameter('sku', i) as string;
						const variantId = this.getNodeParameter('variantId', i) as string;

						// Create variant update object - always required by IKAS API
						const variantUpdate: any = {
							isActive: true,
						};

						// Add variant ID if provided (for updating existing variants)
						if (variantId && variantId.trim()) {
							variantUpdate.id = variantId;
						} else {
							variantUpdate.id = product.variants[0].id;
						}

						// Handle pricing updates
						const hasPriceUpdates = price !== null || buyPrice !== null || discountPrice !== null;
						if (hasPriceUpdates) {
							const priceData: any = {};

							if (price !== null) {
								priceData.sellPrice = price;
							}
							if (buyPrice !== null) {
								priceData.buyPrice = buyPrice;
							}
							if (discountPrice !== null) {
								priceData.discountPrice = discountPrice;
							}

							variantUpdate.prices = [priceData];
						} else {
							variantUpdate.prices = product.variants[0].prices;
						}

						this.logger.info(JSON.stringify(variantUpdate, null, 2), {
							message: 'Variant update is here',
						});

						// Add SKU if provided
						if (sku && sku.trim()) {
							variantUpdate.sku = sku;
						}

						// Always include variants array as it's required by IKAS API
						productInput.variants = [variantUpdate];

						// Remove null values from variant prices
						if (variantUpdate.prices && variantUpdate.prices[0]) {
							Object.keys(variantUpdate.prices[0]).forEach((key) => {
								if (variantUpdate.prices[0][key] === null) {
									delete variantUpdate.prices[0][key];
								}
							});
						}

						// Handle additional fields - only include non-empty values
						const additionalFields = this.getNodeParameter('additionalFields', i) as any;
						if (additionalFields) {
							Object.keys(additionalFields).forEach((key) => {
								const value = additionalFields[key];
								if (value !== undefined && value !== null && value !== '') {
									// Handle array fields that used to be comma-separated strings
									if (key === 'hiddenSalesChannelIds') {
										if (Array.isArray(value) && value.length > 0) {
											productInput[key] = value;
										}
									}
									// Handle comma-separated string fields
									else if (key === 'dynamicPriceListIds') {
										productInput[key] = value;
									}
									// Handle JSON fields
									else if (
										key === 'attributes' ||
										key === 'baseUnit' ||
										key === 'translations' ||
										key === 'metaData'
									) {
										try {
											const parsedValue = JSON.parse(value);
											// Only include if the parsed JSON is not empty
											if (
												Array.isArray(parsedValue)
													? parsedValue.length > 0
													: Object.keys(parsedValue).length > 0
											) {
												productInput[key] = parsedValue;
											}
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
										if (typeof value === 'string' && value.trim()) {
											productInput[key] = value;
										} else if (typeof value !== 'string') {
											productInput[key] = value;
										}
									}
								}
							});
						}

						const response = await ikasGraphQLRequest.call(this, SaveProductMutation, {
							input: productInput,
						});

						this.logger.info(JSON.stringify(response, null, 2), {
							message: 'Update product response is here',
						});

						responseData = response.data?.saveProduct || {};

						this.logger.info(JSON.stringify(responseData, null, 2), {
							message: 'Update response data is here',
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
					} else if (operation === 'fulfill') {
						// Build fulfill order input
						const orderId = this.getNodeParameter('orderId', i) as string;
						const fulfillLinesData = this.getNodeParameter('fulfillLines', i) as any;
						const markAsReadyForShipment = this.getNodeParameter(
							'markAsReadyForShipment',
							i,
						) as boolean;
						const sendNotificationToCustomer = this.getNodeParameter(
							'sendNotificationToCustomer',
							i,
						) as boolean;
						const sourcePackageId = this.getNodeParameter('sourcePackageId', i) as string;
						const trackingInfo = this.getNodeParameter('trackingInfo', i) as any;

						// Validate required fields
						if (!orderId) {
							throw new NodeOperationError(
								this.getNode(),
								'Order ID is required for fulfill operation',
								{ itemIndex: i },
							);
						}

						// Process line items
						const lines: any[] = [];
						if (fulfillLinesData?.lineItems && Array.isArray(fulfillLinesData.lineItems)) {
							for (const lineItem of fulfillLinesData.lineItems) {
								if (!lineItem.orderLineItemId) {
									throw new NodeOperationError(
										this.getNode(),
										'Order Line Item ID is required for each line item',
										{ itemIndex: i },
									);
								}
								if (!lineItem.quantity || lineItem.quantity < 1) {
									throw new NodeOperationError(
										this.getNode(),
										'Quantity must be at least 1 for each line item',
										{ itemIndex: i },
									);
								}

								lines.push({
									orderLineItemId: lineItem.orderLineItemId,
									quantity: parseFloat(lineItem.quantity.toString()),
								});
							}
						}

						if (lines.length === 0) {
							throw new NodeOperationError(
								this.getNode(),
								'At least one line item is required for fulfill operation',
								{ itemIndex: i },
							);
						}

						// Build fulfill input
						const fulfillInput: any = {
							orderId: orderId,
							lines: lines,
						};

						// Add optional boolean fields
						if (markAsReadyForShipment) {
							fulfillInput.markAsReadyForShipment = markAsReadyForShipment;
						}

						if (sendNotificationToCustomer) {
							fulfillInput.sendNotificationToCustomer = sendNotificationToCustomer;
						}

						// Add source package ID if provided
						if (sourcePackageId) {
							fulfillInput.sourcePackageId = sourcePackageId;
						}

						// Add tracking information if provided
						if (trackingInfo && Object.keys(trackingInfo).length > 0) {
							const trackingInfoDetail: any = {};

							if (trackingInfo.trackingNumber) {
								trackingInfoDetail.trackingNumber = trackingInfo.trackingNumber;
							}
							if (trackingInfo.trackingLink) {
								trackingInfoDetail.trackingLink = trackingInfo.trackingLink;
							}
							if (trackingInfo.cargoCompany) {
								trackingInfoDetail.cargoCompany = trackingInfo.cargoCompany;
							}
							if (trackingInfo.cargoCompanyId) {
								trackingInfoDetail.cargoCompanyId = trackingInfo.cargoCompanyId;
							}
							if (trackingInfo.barcode) {
								trackingInfoDetail.barcode = trackingInfo.barcode;
							}
							if (trackingInfo.isSendNotification !== undefined) {
								trackingInfoDetail.isSendNotification = trackingInfo.isSendNotification;
							}

							if (Object.keys(trackingInfoDetail).length > 0) {
								fulfillInput.trackingInfoDetail = trackingInfoDetail;
							}
						}

						this.logger.info(JSON.stringify(fulfillInput, null, 2), {
							message: 'Fulfill input is here',
						});

						const response = await ikasGraphQLRequest.call(this, FulfillOrderMutation, {
							input: fulfillInput,
						});

						this.logger.info(JSON.stringify(response, null, 2), {
							message: 'Fulfill order response is here',
						});

						responseData = response.data?.fulfillOrder || {};
					} else if (operation === 'updatePackageStatus') {
						// Build update package status input
						const orderIdForPackageStatus = this.getNodeParameter(
							'orderIdForPackageStatus',
							i,
						) as string;
						const packageUpdatesData = this.getNodeParameter('packageUpdates', i) as any;
						const globalSourceId = this.getNodeParameter('globalSourceId', i) as string;

						// Validate required fields
						if (!orderIdForPackageStatus) {
							throw new NodeOperationError(
								this.getNode(),
								'Order ID is required for update package status operation',
								{ itemIndex: i },
							);
						}

						// Process packages
						const packages: any[] = [];
						if (packageUpdatesData?.packages && Array.isArray(packageUpdatesData.packages)) {
							for (const packageUpdate of packageUpdatesData.packages) {
								if (!packageUpdate.packageId) {
									throw new NodeOperationError(
										this.getNode(),
										'Package ID is required for each package update',
										{ itemIndex: i },
									);
								}
								if (!packageUpdate.status) {
									throw new NodeOperationError(
										this.getNode(),
										'Status is required for each package update',
										{ itemIndex: i },
									);
								}

								const packageData: any = {
									packageId: packageUpdate.packageId,
									status: packageUpdate.status,
								};

								// Add optional fields
								if (packageUpdate.errorMessage) {
									packageData.errorMessage = packageUpdate.errorMessage;
								}

								if (packageUpdate.sourceId) {
									packageData.sourceId = packageUpdate.sourceId;
								}

								// Add tracking information if provided
								if (
									packageUpdate.trackingInfo &&
									Object.keys(packageUpdate.trackingInfo).length > 0
								) {
									const trackingInfo = packageUpdate.trackingInfo;
									const trackingInfoDetail: any = {};

									if (trackingInfo.trackingNumber) {
										trackingInfoDetail.trackingNumber = trackingInfo.trackingNumber;
									}
									if (trackingInfo.trackingLink) {
										trackingInfoDetail.trackingLink = trackingInfo.trackingLink;
									}
									if (trackingInfo.cargoCompany) {
										trackingInfoDetail.cargoCompany = trackingInfo.cargoCompany;
									}
									if (trackingInfo.cargoCompanyId) {
										trackingInfoDetail.cargoCompanyId = trackingInfo.cargoCompanyId;
									}
									if (trackingInfo.barcode) {
										trackingInfoDetail.barcode = trackingInfo.barcode;
									}
									if (trackingInfo.isSendNotification !== undefined) {
										trackingInfoDetail.isSendNotification = trackingInfo.isSendNotification;
									}

									if (Object.keys(trackingInfoDetail).length > 0) {
										packageData.trackingInfo = trackingInfoDetail;
									}
								}

								packages.push(packageData);
							}
						}

						if (packages.length === 0) {
							throw new NodeOperationError(
								this.getNode(),
								'At least one package update is required',
								{ itemIndex: i },
							);
						}

						// Build update input
						const updateInput: any = {
							orderId: orderIdForPackageStatus,
							packages: packages,
						};

						// Add global source ID if provided
						if (globalSourceId) {
							updateInput.sourceId = globalSourceId;
						}

						this.logger.info(JSON.stringify(updateInput, null, 2), {
							message: 'Update package status input is here',
						});

						const response = await ikasGraphQLRequest.call(this, UpdateOrderPackageStatusMutation, {
							input: updateInput,
						});

						this.logger.info(JSON.stringify(response, null, 2), {
							message: 'Update package status response is here',
						});

						responseData = response.data?.updateOrderPackageStatus || {};
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
				} else if (resource === 'order' && operation === 'fulfill') {
					// For fulfill order, return the updated order
					dataToReturn = [responseData || {}];
				} else if (resource === 'order' && operation === 'updatePackageStatus') {
					// For update package status, return the updated order
					dataToReturn = [responseData || {}];
				} else if (resource === 'product' && operation === 'search') {
					// For product search, handle the search response structure
					const products = responseData.results || [];
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
