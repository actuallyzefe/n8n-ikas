import type { IExecuteFunctions } from 'n8n-workflow';
import { ikasGraphQLRequest } from '../../GenericFunctions';
import { ListWebhooksQuery } from '../../graphql/queries/ListWebhooks';

export async function getManyWebhooks(this: IExecuteFunctions, _index: number) {
	this.logger.info('Getting many webhooks');
	const response = await ikasGraphQLRequest.call(this, ListWebhooksQuery);
	this.logger.info(JSON.stringify(response, null, 2));
	return response.data?.listWebhook || [];
}
