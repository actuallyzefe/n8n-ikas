import type { IExecuteFunctions } from 'n8n-workflow';
import { ikasGraphQLRequest } from '../../GenericFunctions';
import { SaveWebhookMutation } from '../../graphql/mutations/SaveWebhook';

export async function createWebhook(this: IExecuteFunctions, index: number) {
	const endpoint = this.getNodeParameter('endpoint', index) as string;
	const scope = this.getNodeParameter('scope', index) as string;

	this.logger.info(JSON.stringify({ endpoint, scope }, null, 2), {
		message: 'Creating webhook with params',
	});

	const input = {
		endpoint,
		scopes: scope,
	};

	this.logger.info(JSON.stringify(input, null, 2), {
		message: 'Webhook input',
	});

	const response = await ikasGraphQLRequest.call(this, SaveWebhookMutation, { input });

	this.logger.info(JSON.stringify(response, null, 2), {
		message: 'Webhook creation response',
	});

	return response.data?.saveWebhook || [];
}
