import type {
	IDataObject,
	IExecuteFunctions,
	IHttpRequestMethods,
	IHttpRequestOptions,
	ILoadOptionsFunctions,
} from 'n8n-workflow';

export async function ikasApiRequest(
	this: IExecuteFunctions | ILoadOptionsFunctions,
	method: IHttpRequestMethods,
	endpoint: string,
	body: IDataObject = {},
	query: IDataObject = {},
) {
	const credentialsType = 'ikasApi';

	const options: IHttpRequestOptions = {
		method,
		url: `https://api.myikas.com/api/v1/admin${endpoint}`,
		json: true,
		headers: {
			'Content-Type': 'application/json',
		},
		body,
		qs: query,
	};

	if (Object.keys(body).length === 0) {
		delete options.body;
	}

	return await this.helpers.requestWithAuthentication.call(this, credentialsType, options);
}

export async function ikasGraphQLRequest(
	this: IExecuteFunctions | ILoadOptionsFunctions,
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
