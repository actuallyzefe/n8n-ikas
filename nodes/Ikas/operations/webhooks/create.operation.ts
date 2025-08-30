import type { IExecuteFunctions } from 'n8n-workflow';
import { ikasGraphQLRequest } from '../../GenericFunctions';
import { SaveWebhookMutation } from '../../graphql/mutations/SaveWebhook';

export async function createWebhook(this: IExecuteFunctions, index: number) {
	const endpoint = this.getNodeParameter('endpoint', index) as string;
	const scope = this.getNodeParameter('scope', index) as string;

	const input = {
		endpoint,
		scopes: scope,
	};

	const response = await ikasGraphQLRequest.call(this, SaveWebhookMutation, { input });

	return response.data?.saveWebhook || [];
}
