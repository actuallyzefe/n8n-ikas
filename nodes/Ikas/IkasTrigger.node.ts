import type {
	IHookFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	IWebhookFunctions,
	IWebhookResponseData,
} from 'n8n-workflow';
import { NodeConnectionType } from 'n8n-workflow';

import { ikasGraphQLRequest } from './GenericFunctions';
import { DeleteWebhookMutation } from './graphql/mutations/DeleteWebhook';
import { SaveWebhookMutation } from './graphql/mutations/SaveWebhook';
import { ListWebhooksQuery } from './graphql/queries/ListWebhooks';

export class IkasTrigger implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'IKAS Trigger',
		name: 'ikasTrigger',
		icon: 'file:ikas-icon.svg',
		group: ['trigger'],
		version: 1,
		description: 'Starts the workflow when IKAS events occur',
		defaults: {
			name: 'IKAS Trigger',
		},
		inputs: [],
		outputs: [NodeConnectionType.Main],
		credentials: [
			{
				name: 'ikasApi',
				required: true,
			},
		],
		webhooks: [
			{
				name: 'default',
				httpMethod: 'POST',
				responseMode: 'onReceived',
				path: 'webhook-test',
			},
		],
		properties: [
			{
				displayName: 'Event',
				name: 'event',
				type: 'options',
				options: [
					{
						name: 'Customer Created',
						value: 'store/customer/created',
						description: 'Triggers when a new customer is created',
					},
					{
						name: 'Customer Favorite Products Created',
						value: 'store/customerFavoriteProducts/created',
						description: 'Triggers when a customer adds a product to favorites',
					},
					{
						name: 'Customer Favorite Products Updated',
						value: 'store/customerFavoriteProducts/updated',
						description: 'Triggers when customer favorite products are updated',
					},
					{
						name: 'Customer Updated',
						value: 'store/customer/updated',
						description: 'Triggers when a customer is updated',
					},
					{
						name: 'Order Created',
						value: 'store/order/created',
						description: 'Triggers when a new order is created',
					},
					{
						name: 'Order Updated',
						value: 'store/order/updated',
						description: 'Triggers when an order is updated',
					},
					{
						name: 'Product Created',
						value: 'store/product/created',
						description: 'Triggers when a new product is created',
					},
					{
						name: 'Product Updated',
						value: 'store/product/updated',
						description: 'Triggers when a product is updated',
					},
					{
						name: 'Stock Created',
						value: 'store/stock/created',
						description: 'Triggers when new stock is created',
					},
					{
						name: 'Stock Updated',
						value: 'store/stock/updated',
						description: 'Triggers when stock is updated',
					},
				],
				default: 'store/order/created',
				required: true,
				description: 'The event that should trigger the workflow',
			},
		],
	};

	webhookMethods = {
		default: {
			async checkExists(this: IHookFunctions): Promise<boolean> {
				const webhookUrl = this.getNodeWebhookUrl('default');
				const event = this.getNodeParameter('event') as string;

				try {
					const response = await ikasGraphQLRequest.call(this, ListWebhooksQuery);
					const webhooks = response.data?.listWebhook || [];

					// Check if webhook already exists for this event and URL
					const existingWebhook = webhooks.find(
						(webhook: { endpoint: string; scope: string }) =>
							webhook.endpoint === webhookUrl && webhook.scope === event,
					);

					return !!existingWebhook;
				} catch {
					return false;
				}
			},

			async create(this: IHookFunctions): Promise<boolean> {
				const webhookUrl = this.getNodeWebhookUrl('default');
				const event = this.getNodeParameter('event') as string;

				const body = {
					scopes: event,
					endpoint: webhookUrl,
				};

				try {
					await ikasGraphQLRequest.call(this, SaveWebhookMutation, { input: body });
					return true;
				} catch {
					return false;
				}
			},

			async delete(this: IHookFunctions): Promise<boolean> {
				const event = this.getNodeParameter('event') as string;

				try {
					await ikasGraphQLRequest.call(this, DeleteWebhookMutation, { scopes: [event] });
					return true;
				} catch {
					return false;
				}
			},
		},
	};

	async webhook(this: IWebhookFunctions): Promise<IWebhookResponseData> {
		const bodyData = this.getBodyData();
		const event = this.getNodeParameter('event') as string;

		// Validate that this webhook call is for the configured event
		const headers = this.getHeaderData();
		const webhookEvent = headers['x-ikas-event'] || headers['X-IKAS-Event'];

		if (webhookEvent && webhookEvent !== event) {
			// Return empty response if event doesn't match
			return {
				workflowData: [[]],
			};
		}

		// Process the webhook data
		const returnData: INodeExecutionData[] = [];

		if (bodyData) {
			// Parse the data field if it's a JSON string
			let parsedData = bodyData;
			if (bodyData.data && typeof bodyData.data === 'string') {
				try {
					parsedData = {
						...bodyData,
						data: JSON.parse(bodyData.data),
					};
				} catch (error) {
					// If parsing fails, keep original data
					parsedData = bodyData;
				}
			}

			// Flatten the structure for better usability
			const flattenedData = {
				event,
				timestamp: new Date().toISOString(),
				scope: parsedData.scope,
				merchantId: parsedData.merchantId,
				headers: headers,
				_rawData: parsedData, // Keep original data for reference
			};

			// Safely spread the parsed data fields to top level
			if (parsedData.data && typeof parsedData.data === 'object' && parsedData.data !== null) {
				Object.assign(flattenedData, parsedData.data);
			}

			returnData.push({
				json: flattenedData,
			});
		}

		return {
			workflowData: [returnData],
		};
	}
}
