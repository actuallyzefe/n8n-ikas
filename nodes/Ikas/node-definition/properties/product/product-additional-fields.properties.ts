import type { INodeProperties } from 'n8n-workflow';

export const productAdditionalFieldsProperty: INodeProperties = {
	displayName: 'Additional Fields',
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
		// Pricing fields
		{
			displayName: 'Buy Price',
			name: 'buyPrice',
			type: 'number',
			default: '',
			description: 'Cost/buy price for the simple product',
			typeOptions: {
				numberPrecision: 2,
				minValue: 0,
			},
		},
		{
			displayName: 'Discount Price',
			name: 'discountPrice',
			type: 'number',
			default: '',
			description: 'Discount price for the simple product',
			typeOptions: {
				numberPrecision: 2,
				minValue: 0,
			},
		},
		{
			displayName: 'Price (for Updates)',
			name: 'price',
			type: 'number',
			displayOptions: {
				show: {
					'@version': [1, 2, 3, 4, 5], // Always show for collection items
				},
				hide: {
					'/operation': ['create'], // Hide for create operation
				},
			},
			default: '',
			description: 'Selling price for the simple product (leave empty to keep current price)',
			typeOptions: {
				numberPrecision: 2,
				minValue: 0,
			},
		},
		// Product identification
		{
			displayName: 'SKU',
			name: 'sku',
			type: 'string',
			default: '',
			description: 'SKU for the simple product',
		},
		{
			displayName: 'Variant ID',
			name: 'variantId',
			type: 'string',
			displayOptions: {
				show: {
					'@version': [1, 2, 3, 4, 5], // Always show for collection items
				},
				hide: {
					'/operation': ['create'], // Hide for create operation
				},
			},
			default: '',
			description: 'ID of the variant to update (required for updating pricing/SKU)',
		},
		// Stock management
		{
			displayName: 'Stock Count',
			name: 'stockCount',
			type: 'number',
			default: 0,
			description: 'Initial stock count for the simple product',
			typeOptions: {
				minValue: 0,
			},
		},
		{
			displayName: 'Stock Location Name or ID',
			name: 'stockLocationId',
			type: 'options',
			typeOptions: {
				loadOptionsMethod: 'getStockLocations',
			},
			default: '',
			description:
				'Select the stock location where the stock will be stored. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
		},
		// Product descriptions
		{
			displayName: 'Description',
			name: 'description',
			type: 'string',
			default: '',
			description: 'Product description',
		},
		{
			displayName: 'Short Description',
			name: 'shortDescription',
			type: 'string',
			default: '',
			description: 'Short description of the product',
		},
		// Product attributes
		{
			displayName: 'Weight',
			name: 'weight',
			type: 'number',
			default: '',
			description: 'Weight of the product',
			typeOptions: {
				minValue: 0,
			},
		},
		{
			displayName: 'Max Quantity Per Cart',
			name: 'maxQuantityPerCart',
			type: 'number',
			default: 0,
			description: 'Maximum quantity allowed per cart',
			typeOptions: {
				minValue: 0,
			},
		},
		// Hidden sales channels (optional)
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
		// Advanced options
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
		// Image Upload Fields (for both create and update operations)
		{
			displayName: 'Product Image',
			name: 'productImage',
			type: 'collection',
			placeholder: 'Add Image',
			displayOptions: {
				show: {
					'@version': [1, 2, 3, 4, 5], // Always show for collection items
				},
			},
			default: {},
			description: 'Upload an image for this product',
			options: [
				{
					displayName: 'Image Source',
					name: 'imageSource',
					type: 'options',
					options: [
						{
							name: 'URL',
							value: 'url',
							description: 'Upload image from a URL',
						},
						{
							name: 'Base64',
							value: 'base64',
							description: 'Upload image from Base64 encoded data',
						},
					],
					default: 'url',
					description: 'Choose the source of the image',
				},
				{
					displayName: 'Image URL',
					name: 'imageUrl',
					type: 'string',
					displayOptions: {
						show: {
							imageSource: ['url'],
						},
					},
					default: '',
					placeholder: 'https://example.com/image.jpg',
					description: 'URL of the image to upload',
				},
				{
					displayName: 'Image Base64',
					name: 'imageBase64',
					type: 'string',
					displayOptions: {
						show: {
							imageSource: ['base64'],
						},
					},
					typeOptions: {
						rows: 4,
					},
					default: '',
					placeholder: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD...',
					description: 'Base64 encoded image data',
				},
				{
					displayName: 'Image Order',
					name: 'imageOrder',
					type: 'number',
					default: 0,
					description: 'Order/position of the image (0 = first)',
					typeOptions: {
						minValue: 0,
					},
				},
				{
					displayName: 'Is Main Image',
					name: 'isMainImage',
					type: 'boolean',
					default: true,
					description: 'Whether this image should be the main/primary image for the product',
				},
			],
		},
	],
};
