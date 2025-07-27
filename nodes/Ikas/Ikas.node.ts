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
import { GetSalesChannelsQuery } from './graphql/queries/GetSalesChannels';
import { buildNodeProperties } from './node-definition/properties';
import {
	createProduct,
	updateProduct,
	getManyProducts,
	searchProducts,
} from './operations/products';
import { getManyOrders, fulfillOrder, updateOrderPackageStatus } from './operations/orders';

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
						responseData = await getManyProducts.call(this, i);
					} else if (operation === 'search') {
						responseData = await searchProducts.call(this, i);
					} else if (operation === 'create') {
						responseData = await createProduct.call(this, i);
					} else if (operation === 'update') {
						responseData = await updateProduct.call(this, i);
					} else {
						throw new NodeOperationError(
							this.getNode(),
							`Operation "${operation}" is not yet implemented for resource "${resource}"`,
							{ itemIndex: i },
						);
					}
				} else if (resource === 'order') {
					if (operation === 'getMany') {
						responseData = await getManyOrders.call(this, i);
					} else if (operation === 'fulfill') {
						responseData = await fulfillOrder.call(this, i);
					} else if (operation === 'updatePackageStatus') {
						responseData = await updateOrderPackageStatus.call(this, i);
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
