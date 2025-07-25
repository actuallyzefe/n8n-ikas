import type {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class IkasAccessTokenApi implements ICredentialType {
	name = 'ikasAccessTokenApi';

	displayName = 'IKAS Access Token API';

	documentationUrl = 'https://ikas.dev/docs/api/getting-started/authentication';

	icon = 'file:ikas-icon.svg' as const;

	httpRequestNode = {
		name: 'IKAS',
		docsUrl: 'https://ikas.dev/docs/intro',
		apiBaseUrlPlaceholder: 'https://api.myikas.com/api/v1/admin/graphql',
	};

	properties: INodeProperties[] = [
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
			displayName: 'Access Token',
			name: 'accessToken',
			type: 'string',
			required: true,
			typeOptions: {
				password: true,
			},
			default: '',
			description:
				'Access token from your IKAS Private App. Get it by calling the OAuth endpoint with your Client ID and Secret.',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				Authorization: '=Bearer {{$credentials.accessToken}}',
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
