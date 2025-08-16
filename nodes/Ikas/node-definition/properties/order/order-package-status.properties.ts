import type { INodeProperties } from 'n8n-workflow';

export const orderPackageStatusProperties: INodeProperties[] = [
	{
		displayName: 'Order ID',
		name: 'orderIdForPackageStatus',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['order'],
				operation: ['updatePackageStatus'],
			},
		},
		default: '',
		description: 'ID of the order containing packages to update',
		required: true,
	},
	{
		displayName: 'Packages',
		name: 'packageUpdates',
		type: 'fixedCollection',
		displayOptions: {
			show: {
				resource: ['order'],
				operation: ['updatePackageStatus'],
			},
		},
		default: {},
		description: 'Package status updates',
		typeOptions: {
			multipleValues: true,
		},
		options: [
			{
				name: 'packages',
				displayName: 'Packages',
				values: [
					{
						displayName: 'Error Message',
						name: 'errorMessage',
						type: 'string',
						default: '',
						description: 'Error message (optional, typically used with ERROR status)',
					},
					{
						displayName: 'Package ID',
						name: 'packageId',
						type: 'string',
						default: '',
						description: 'ID of the package to update',
							required:	true,
					},
					{
						displayName: 'Source ID',
						name: 'sourceId',
						type: 'string',
						default: '',
						description: 'Source ID for the update (optional)',
					},
					{
						displayName: 'Status',
						name: 'status',
						type: 'options',
						default: 'FULFILLED',
						description: 'New status for the package',
						options: [
							{
								name: 'Cancel Rejected',
								value: 'CANCEL_REJECTED',
							},
							{
								name: 'Cancel Requested',
								value: 'CANCEL_REQUESTED',
							},
							{
								name: 'Cancelled',
								value: 'CANCELLED',
							},
							{
								name: 'Delivered',
								value: 'DELIVERED',
							},
							{
								name: 'Error',
								value: 'ERROR',
							},
							{
								name: 'Fulfilled',
								value: 'FULFILLED',
							},
							{
								name: 'Ready for Pick Up',
								value: 'READY_FOR_PICK_UP',
							},
							{
								name: 'Ready for Shipment',
								value: 'READY_FOR_SHIPMENT',
							},
							{
								name: 'Refund Rejected',
								value: 'REFUND_REJECTED',
							},
							{
								name: 'Refund Request Accepted',
								value: 'REFUND_REQUEST_ACCEPTED',
							},
							{
								name: 'Refund Requested',
								value: 'REFUND_REQUESTED',
							},
							{
								name: 'Refunded',
								value: 'REFUNDED',
							},
							{
								name: 'Unable to Deliver',
								value: 'UNABLE_TO_DELIVER',
							},
						],
							required:	true,
					},
					{
						displayName: 'Tracking Information',
						name: 'trackingInfo',
						type: 'collection',
						default: {},
						placeholder: 'Add Tracking Info',
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
					]
					},
			],
			},
		],
	},
	{
		displayName: 'Global Source ID',
		name: 'globalSourceId',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['order'],
				operation: ['updatePackageStatus'],
			},
		},
		default: '',
		description: 'Global source ID for the entire update operation (optional)',
	},
];
