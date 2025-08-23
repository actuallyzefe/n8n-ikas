import type { IExecuteFunctions } from 'n8n-workflow';
import { ikasGraphQLRequest } from '../../GenericFunctions';
import { ListWebhooksQuery } from '../../graphql/queries/ListWebhooks';

export async function getManyWebhooks(this: IExecuteFunctions, index: number) {
	const response = await ikasGraphQLRequest.call(this, ListWebhooksQuery);
	return response.data?.listWebhook || [];
}
