module.exports = {
	extends: ['./.eslintrc.js'],

	rules: {
		'n8n-nodes-base/node-class-description-name-miscased': 'error',
		'n8n-nodes-base/node-class-description-icon-not-svg': 'error',
		'n8n-nodes-base/node-class-description-empty-string': 'error',
		'n8n-nodes-base/node-class-description-name-not-titlecased': 'error',
		'n8n-nodes-base/node-execute-block-double-assertion-for-items': 'error',
		'n8n-nodes-base/node-param-placeholder-missing-email-type': 'error',
		'n8n-nodes-base/node-param-option-name-duplicate': 'error',
	},
}; 