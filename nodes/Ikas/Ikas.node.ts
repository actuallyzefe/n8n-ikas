import type {
	IExecuteFunctions,
	ILoadOptionsFunctions,
	INodeExecutionData,
	INodePropertyOptions,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
import { NodeConnectionType, NodeOperationError } from 'n8n-workflow';

import { ikasGraphQLRequest } from './GenericFunctions';
import { GetProductsQuery } from './graphql/queries/GetProducts';
import { GetSalesChannelsQuery } from './graphql/queries/GetSalesChannels';
import { GetStockLocationsQuery } from './graphql/queries/GetStockLocations';
import { buildNodeProperties } from './node-definition/properties';
import { fulfillOrder, getManyOrders, updateOrderPackageStatus } from './operations/orders';
import {
	createProduct,
	deleteProducts,
	getManyProducts,
	searchProducts,
	updateProduct,
	uploadImage,
} from './operations/products';

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
		properties: buildNodeProperties(),
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

			async getStockLocations(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				try {
					const response = await ikasGraphQLRequest.call(this, GetStockLocationsQuery);
					this.logger.info(JSON.stringify(response, null, 2), {
						message: 'Stock locations response is here',
					});
					const stockLocations = response.data?.listStockLocation || [];

					this.logger.info(JSON.stringify(stockLocations, null, 2), {
						message: 'Stock locations are here',
					});

					return stockLocations.map((location: any) => ({
						name: `${location.name}`,
						value: location.id,
					}));
				} catch (error) {
					this.logger.error(JSON.stringify(error, null, 2), {
						message: 'Error loading stock locations',
					});
					return [];
				}
			},

			async getProductVariants(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				try {
					const response = await ikasGraphQLRequest.call(this, GetProductsQuery);
					this.logger.info(JSON.stringify(response, null, 2), {
						message: 'Products response for variants',
					});

					const products = response.data?.listProduct?.data || [];
					const variantOptions: INodePropertyOptions[] = [];

					products.forEach((product: any) => {
						const productName = product.name || 'Unknown Product';

						if (product.variants && product.variants.length > 0) {
							product.variants.forEach((variant: any) => {
								const variantId = variant.id;
								const sku = variant.sku || '';
								const barcodeList = Array.isArray(variant.barcodeList)
									? variant.barcodeList.join(', ')
									: variant.barcodeList || '';

								// Build display name starting with SKU, barcode, or variant ID
								let displayName = '';
								if (barcodeList) {
									displayName = `${barcodeList} - ${productName}`;
								} else if (sku) {
									displayName = `${sku} - ${productName}`;
								} else {
									displayName = `${variantId.substring(0, 8)}... - ${productName}`;
								}

								variantOptions.push({
									name: displayName,
									value: variantId,
								});
							});
						}
					});

					this.logger.info(JSON.stringify(variantOptions, null, 2), {
						message: 'Variant options created',
					});

					return variantOptions;
				} catch (error) {
					this.logger.error(JSON.stringify(error, null, 2), {
						message: 'Error loading product variants',
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
				// Define operation handlers for each resource
				const resourceHandlers = {
					product: {
						getMany: getManyProducts,
						search: searchProducts,
						create: createProduct,
						update: updateProduct,
						delete: deleteProducts,
						uploadImage: uploadImage,
					},
					order: {
						getMany: getManyOrders,
						fulfill: fulfillOrder,
						updatePackageStatus: updateOrderPackageStatus,
					},
				};

				// Get the handler for the current resource
				const resourceHandler = resourceHandlers[resource as keyof typeof resourceHandlers];

				if (!resourceHandler) {
					throw new NodeOperationError(
						this.getNode(),
						`Resource "${resource}" is not yet implemented`,
						{ itemIndex: i },
					);
				}

				// Get the operation handler
				const operationHandler = resourceHandler[operation as keyof typeof resourceHandler];

				if (!operationHandler) {
					throw new NodeOperationError(
						this.getNode(),
						`Operation "${operation}" is not yet implemented for resource "${resource}"`,
						{ itemIndex: i },
					);
				}

				// Execute the handler
				const responseData = await operationHandler.call(this, i);

				// Handle different response structures
				let dataToReturn: any[] = [];

				if (resource === 'order' && operation === 'getMany') {
					// For orders with new pagination, responseData is already an array with _pagination
					dataToReturn = Array.isArray(responseData) ? responseData : [responseData];
				} else if (resource === 'order' && operation === 'fulfill') {
					// For fulfill order, return the updated order
					dataToReturn = [responseData || {}];
				} else if (resource === 'order' && operation === 'updatePackageStatus') {
					// For update package status, return the updated order
					dataToReturn = [responseData || {}];
				} else if (resource === 'product' && operation === 'delete') {
					// For delete products, return the deletion result
					dataToReturn = [responseData || {}];
				} else if (resource === 'product' && operation === 'search') {
					// For product search, handle the search response structure
					const products = responseData.results || [];
					const paging = responseData.paging || {};

					dataToReturn = products.map((product: any) => ({
						...product,
						_pagination: paging,
					}));
				} else if (resource === 'product' && operation === 'getMany') {
					// For products with new pagination, responseData is already an array with _pagination
					dataToReturn = Array.isArray(responseData) ? responseData : [responseData];
				} else if (Array.isArray(responseData)) {
					// For other arrays
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
