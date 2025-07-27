import type { INodeProperties } from 'n8n-workflow';

export const orderFulfillProperties: INodeProperties[] = [
	{
		displayName: 'Order ID',
		name: 'orderId',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['order'],
				operation: ['fulfill'],
			},
		},
		default: '',
		description: 'ID of the order to fulfill',
		required: true,
	},
	{
		displayName: 'Order Line Items',
		name: 'fulfillLines',
		type: 'fixedCollection',
		displayOptions: {
			show: {
				resource: ['order'],
				operation: ['fulfill'],
			},
		},
		default: {},
		description: 'Order line items to fulfill',
		typeOptions: {
			multipleValues: true,
		},
		options: [
			{
				name: 'lineItems',
				displayName: 'Line Items',
				values: [
					{
						displayName: 'Order Line Item ID',
						name: 'orderLineItemId',
						type: 'string',
						default: '',
						description: 'ID of the order line item to fulfill',
						required: true,
					},
					{
						displayName: 'Quantity',
						name: 'quantity',
						type: 'number',
						default: 1,
						description: 'Quantity to fulfill',
						typeOptions: {
							minValue: 1,
						},
						required: true,
					},
				],
			},
		],
	},
	{
		displayName: 'Mark as Ready for Shipment',
		name: 'markAsReadyForShipment',
		type: 'boolean',
		displayOptions: {
			show: {
				resource: ['order'],
				operation: ['fulfill'],
			},
		},
		default: false,
		description: 'Whether to mark the order as ready for shipment',
	},
	{
		displayName: 'Send Notification to Customer',
		name: 'sendNotificationToCustomer',
		type: 'boolean',
		displayOptions: {
			show: {
				resource: ['order'],
				operation: ['fulfill'],
			},
		},
		default: false,
		description: 'Whether to send notification to customer',
	},
	{
		displayName: 'Source Package ID',
		name: 'sourcePackageId',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['order'],
				operation: ['fulfill'],
			},
		},
		default: '',
		description: 'ID of the source package (optional)',
	},
	{
		displayName: 'Tracking Information',
		name: 'trackingInfo',
		type: 'collection',
		placeholder: 'Add Tracking Info',
		default: {},
		displayOptions: {
			show: {
				resource: ['order'],
				operation: ['fulfill'],
			},
		},
		options: [
			{
				displayName: 'Barcode',
				name: 'barcode',
				type: 'string',
				default: '',
				description: 'Barcode for the shipment',
			},
			{
				displayName: 'Cargo Company',
				name: 'cargoCompany',
				type: 'string',
				default: '',
				description: 'Name of the cargo/shipping company',
			},
			{
				displayName: 'Cargo Company ID',
				name: 'cargoCompanyId',
				type: 'string',
				default: '',
				description: 'ID of the cargo/shipping company',
			},
			{
				displayName: 'Send Tracking Notification',
				name: 'isSendNotification',
				type: 'boolean',
				default: false,
				description: 'Whether to send tracking notification to customer',
			},
			{
				displayName: 'Tracking Link',
				name: 'trackingLink',
				type: 'string',
				default: '',
				description: 'URL link to track the shipment',
			},
			{
				displayName: 'Tracking Number',
				name: 'trackingNumber',
				type: 'string',
				default: '',
				description: 'Tracking number for the shipment',
			},
		],
	},
];
