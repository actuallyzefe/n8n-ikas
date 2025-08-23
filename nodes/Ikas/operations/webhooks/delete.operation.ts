import type { IExecuteFunctions } from 'n8n-workflow';
import { ikasGraphQLRequest } from '../../GenericFunctions';
import { DeleteWebhookMutation } from '../../graphql/mutations/DeleteWebhook';

export async function deleteWebhooks(this: IExecuteFunctions, index: number) {
	const scopes = this.getNodeParameter('scopes', index) as string[];

	this.logger.info(JSON.stringify(scopes, null, 2), {
		message: 'Deleting webhooks with scopes',
	});

	const response = await ikasGraphQLRequest.call(this, DeleteWebhookMutation, { scopes });

	this.logger.info(JSON.stringify(response, null, 2), {
		message: 'Webhook deletion response',
	});

	return {
		success: response.data?.deleteWebhook || false,
		deletedScopes: scopes,
	};
}
