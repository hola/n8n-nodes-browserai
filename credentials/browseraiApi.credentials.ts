import {
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class browseraiApi implements ICredentialType {
	name = 'browseraiApi';
	displayName = 'BrowserAI API';
	documentationUrl = 'https://docs.n8n.io/integrations/creating-nodes/build/declarative-style-node/';
	properties: INodeProperties[] = [
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			default: '',
			typeOptions: {
				password: true,
			},
		},
	];

	authenticate = {
		type: 'generic',
		properties: {
			headers: {
				Authorization: '={{"apikey " + $credentials.apiKey}}',
			},
		},
	} as const;
}