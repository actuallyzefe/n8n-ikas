import type { INodeProperties } from 'n8n-workflow';

export const productAdditionalFieldsProperty: INodeProperties = {
	displayName: 'Additional Options',
	name: 'additionalFields',
	type: 'collection',
	placeholder: 'Add Field',
	default: {},
	displayOptions: {
		show: {
			resource: ['product'],
			operation: ['create', 'update'],
		},
	},
	options: [
		{
			displayName: 'Base Unit',
			name: 'baseUnit',
			type: 'json',
			default: '{}',
			description: 'JSON object defining the base unit (baseAmount, type)',
		},
		{
			displayName: 'Dynamic Price List IDs',
			name: 'dynamicPriceListIds',
			type: 'string',
			default: '',
			description: 'Comma-separated list of dynamic price list IDs',
		},
		{
			displayName: 'Google Taxonomy ID',
			name: 'googleTaxonomyId',
			type: 'string',
			default: '',
			description: 'Google taxonomy ID for the product',
		},
		{
			displayName: 'Group Variants By Variant Type ID',
			name: 'groupVariantsByVariantTypeId',
			type: 'string',
			default: '',
			description: 'Variant type ID to group variants by',
		},
		{
			displayName: 'Hidden Sales Channels',
			name: 'hiddenSalesChannelIds',
			type: 'multiOptions',
			typeOptions: {
				loadOptionsMethod: 'getSalesChannels',
			},
			default: [],
			description:
				'Select sales channels where this product will be hidden. Choose from the list, or specify IDs using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
		},
		{
			displayName: 'Meta Data',
			name: 'metaData',
			type: 'json',
			default: '{}',
			description: 'JSON object with meta data (title, description, keywords)',
		},
		{
			displayName: 'Product Attributes',
			name: 'attributes',
			type: 'json',
			default: '[]',
			description: 'JSON array of product attributes',
		},
		{
			displayName: 'Product Option Set ID',
			name: 'productOptionSetId',
			type: 'string',
			default: '',
			description: 'Option set ID for the product',
		},
		{
			displayName: 'Product Volume Discount ID',
			name: 'productVolumeDiscountId',
			type: 'string',
			default: '',
			description: 'Volume discount ID for the product',
		},
		{
			displayName: 'Translations',
			name: 'translations',
			type: 'json',
			default: '[]',
			description: 'JSON array of translations (locale, name, description)',
		},
		{
			displayName: 'Vendor ID',
			name: 'vendorId',
			type: 'string',
			default: '',
			description: 'Vendor ID for the product',
		},
	],
};
