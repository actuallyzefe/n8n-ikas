import type { INodeProperties } from 'n8n-workflow';

export const productUploadImageProperties: INodeProperties[] = [
	// Variant IDs for Existing Product Mode
	{
		displayName: 'Product Variants',
		name: 'variantIds',
		type: 'multiOptions',
		displayOptions: {
			show: {
				resource: ['product'],
				operation: ['uploadImage'],
			},
		},
		typeOptions: {
			loadOptionsMethod: 'getProductVariants',
		},
		default: [],
		description: 'Select the product variants to upload the image to',
		required: true,
	},

	// Image Source Selection
	{
		displayName: 'Image Source',
		name: 'imageSource',
		type: 'options',
		displayOptions: {
			show: {
				resource: ['product'],
				operation: ['uploadImage'],
			},
		},
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

	// Image URL
	{
		displayName: 'Image URL',
		name: 'imageUrl',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['product'],
				operation: ['uploadImage'],
				imageSource: ['url'],
			},
		},
		default: '',
		placeholder: 'https://example.com/image.jpg',
		description: 'URL of the image to upload',
		required: true,
	},

	// Image Base64
	{
		displayName: 'Image Base64',
		name: 'imageBase64',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['product'],
				operation: ['uploadImage'],
				imageSource: ['base64'],
			},
		},
		typeOptions: {
			rows: 4,
		},
		default: '',
		placeholder: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD...',
		description: 'Base64 encoded image data',
		required: true,
	},

	// Image Order
	{
		displayName: 'Image Order',
		name: 'order',
		type: 'number',
		displayOptions: {
			show: {
				resource: ['product'],
				operation: ['uploadImage'],
			},
		},
		default: 0,
		description: 'Order/position of the image (0 = first)',
		typeOptions: {
			minValue: 0,
		},
	},

	// Is Main Image
	{
		displayName: 'Is Main Image',
		name: 'isMain',
		type: 'boolean',
		displayOptions: {
			show: {
				resource: ['product'],
				operation: ['uploadImage'],
			},
		},
		default: false,
		description: 'Whether this image should be the main/primary image for the product',
	},
];
