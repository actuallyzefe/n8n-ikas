import type {
	ICredentialDataDecryptedObject,
	IDataObject,
	IExecuteFunctions,
	IHookFunctions,
	IHttpRequestMethods,
	IHttpRequestOptions,
	ILoadOptionsFunctions,
} from 'n8n-workflow';

/**
 * Helper function to get a fresh access token for each request
 */
async function getFreshToken(
	context: IExecuteFunctions | ILoadOptionsFunctions | IHookFunctions,
): Promise<string> {
	context.logger.info('Getting fresh token');
	const credentials = (await context.getCredentials('ikasApi')) as ICredentialDataDecryptedObject;

	const tokenUrl = `https://${credentials.storeName}.myikas.com/api/admin/oauth/token`;

	const response = await context.helpers.httpRequest({
		method: 'POST',
		url: tokenUrl,
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
		},
		body: {
			grant_type: 'client_credentials',
			client_id: credentials.clientId,
			client_secret: credentials.clientSecret,
		},
	});

	return (response as { access_token: string }).access_token;
}

export async function ikasApiRequest(
	this: IExecuteFunctions | ILoadOptionsFunctions | IHookFunctions,
	method: IHttpRequestMethods,
	endpoint: string,
	body: IDataObject = {},
	query: IDataObject = {},
) {
	/* Get a fresh token for each request since the token expires after 4 hours */
	const accessToken = await getFreshToken(this);

	const options: IHttpRequestOptions = {
		method,
		url: `https://api.myikas.com/api/v1/admin${endpoint}`,
		json: true,
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${accessToken}`,
		},
		body,
		qs: query,
	};

	if (Object.keys(body).length === 0) {
		delete options.body;
	}

	return await this.helpers.httpRequest.call(this, options);
}

export async function ikasGraphQLRequest(
	this: IExecuteFunctions | ILoadOptionsFunctions | IHookFunctions,
	query: string,
	variables?: IDataObject,
) {
	const body: IDataObject = {
		query: query.trim(),
	};

	if (variables) {
		body.variables = variables;
	}

	return await ikasApiRequest.call(this, 'POST', '/graphql', body);
}
