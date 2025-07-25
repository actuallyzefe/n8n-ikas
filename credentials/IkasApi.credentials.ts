import type {
	IAuthenticateGeneric,
	ICredentialDataDecryptedObject,
	ICredentialTestRequest,
	ICredentialType,
	IHttpRequestHelper,
	INodeProperties,
} from 'n8n-workflow';

export class IkasApi implements ICredentialType {
	name = 'ikasApi';

	displayName = 'IKAS API';

	documentationUrl = 'https://ikas.dev/docs/api/getting-started/authentication';

	icon = 'file:ikas-icon.svg' as const;

	httpRequestNode = {
		name: 'IKAS',
		docsUrl: 'https://ikas.dev/docs/intro',
		apiBaseUrlPlaceholder: 'https://api.myikas.com/api/v1/admin/graphql',
	};

	properties: INodeProperties[] = [
		{
			displayName: 'Session Token',
			name: 'sessionToken',
			type: 'hidden',
			typeOptions: {
				expirable: true,
				password: true,
			},
			default: '',
		},
		{
			displayName: 'Store Name',
			name: 'storeName',
			type: 'string',
			required: true,
			default: '',
			placeholder: 'mystore',
			description: 'Your IKAS store name (without .myikas.com)',
		},
		{
			displayName: 'Client ID',
			name: 'clientId',
			type: 'string',
			required: true,
			default: '',
			description: 'Client ID from your IKAS Private App',
		},
		{
			displayName: 'Client Secret',
			name: 'clientSecret',
			type: 'string',
			typeOptions: {
				password: true,
			},
			required: true,
			default: '',
			description: 'Client Secret from your IKAS Private App',
		},
	];

	async preAuthentication(this: IHttpRequestHelper, credentials: ICredentialDataDecryptedObject) {
		const tokenUrl = `https://${credentials.storeName}.myikas.com/api/admin/oauth/token`;
		const { access_token } = (await this.helpers.httpRequest({
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
		})) as { access_token: string };

		return { sessionToken: access_token };
	}

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				Authorization: '=Bearer {{$credentials.sessionToken}}',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: 'https://api.myikas.com/api/v1/admin',
			url: '/graphql',
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: {
				query: '{ me { id } }',
			},
		},
	};
}
