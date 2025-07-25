module.exports = {
	root: true,

	env: {
		browser: true,
		es6: true,
		node: true,
	},

	parser: '@typescript-eslint/parser',
	parserOptions: {
		project: ['./tsconfig.json'],
		sourceType: 'module',
		extraFileExtensions: ['.json'],
	},

	ignorePatterns: ['.eslintrc.js', '**/*.js', '**/node_modules/**', '**/dist/**', 'package.json'],

	overrides: [
		{
			files: ['**/*.ts'],
			plugins: ['@typescript-eslint', 'n8n-nodes-base'],
			extends: ['plugin:n8n-nodes-base/nodes', 'plugin:@typescript-eslint/recommended'],
			rules: {
				'n8n-nodes-base/node-class-description-inputs-wrong-regular-node': 'off',
				'n8n-nodes-base/node-class-description-outputs-wrong': 'off',
				'n8n-nodes-base/node-dirname-against-convention': 'error',
				'n8n-nodes-base/node-filename-against-convention': 'error',
				'n8n-nodes-base/node-class-description-missing-subtitle': 'error',
				'n8n-nodes-base/cred-class-field-name-missing-api': 'off',
				'n8n-nodes-base/cred-class-name-missing-oauth2-suffix': 'error',
				'n8n-nodes-base/cred-class-field-name-uppercase-first-char': 'error',
				'n8n-nodes-base/cred-filename-against-convention': 'error',
				'n8n-nodes-base/node-param-default-missing': 'error',
				'n8n-nodes-base/node-param-placeholder-miscased-id': 'error',
				'n8n-nodes-base/node-param-min-value-wrong-for-limit': 'error',
				'n8n-nodes-base/node-param-type-options-missing-from-limit': 'error',
				'n8n-nodes-base/node-param-multi-options-type-unsorted-items': 'error',
				'@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
				'@typescript-eslint/no-explicit-any': 'warn',
			},
		},
		{
			files: ['**/*.json'],
			plugins: ['@typescript-eslint'],
			extends: ['plugin:@typescript-eslint/recommended'],
		},
	],
};
