import type { IExecuteFunctions } from 'n8n-workflow';
import { ikasGraphQLRequest } from '../../GenericFunctions';
import { DeleteWebhookMutation } from '../../graphql/mutations/DeleteWebhook';

export async function deleteWebhooks(this: IExecuteFunctions, index: number) {
	const scopes = this.getNodeParameter('scopes', index) as string[];

	const response = await ikasGraphQLRequest.call(this, DeleteWebhookMutation, { scopes });

	return {
		success: response.data?.deleteWebhook || false,
		deletedScopes: scopes,
	};
}
