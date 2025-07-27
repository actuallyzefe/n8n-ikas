import type { IExecuteFunctions } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';

import { ikasGraphQLRequest } from '../../GenericFunctions';
import { FulfillOrderMutation } from '../../graphql/mutations/FulfillOrder';

/**
 * Validates and processes line items for fulfillment
 */
function processLineItems(
	context: IExecuteFunctions,
	itemIndex: number,
	fulfillLinesData: any,
): any[] {
	const lines: any[] = [];

	if (!fulfillLinesData?.lineItems || !Array.isArray(fulfillLinesData.lineItems)) {
		return lines;
	}

	for (const lineItem of fulfillLinesData.lineItems) {
		if (!lineItem.orderLineItemId) {
			throw new NodeOperationError(
				context.getNode(),
				'Order Line Item ID is required for each line item',
				{ itemIndex },
			);
		}
		if (!lineItem.quantity || lineItem.quantity < 1) {
			throw new NodeOperationError(
				context.getNode(),
				'Quantity must be at least 1 for each line item',
				{ itemIndex },
			);
		}

		lines.push({
			orderLineItemId: lineItem.orderLineItemId,
			quantity: parseFloat(lineItem.quantity.toString()),
		});
	}

	return lines;
}

/**
 * Builds tracking information detail object
 */
function buildTrackingInfoDetail(trackingInfo: any): any {
	const trackingInfoDetail: any = {};

	if (trackingInfo.trackingNumber) {
		trackingInfoDetail.trackingNumber = trackingInfo.trackingNumber;
	}
	if (trackingInfo.trackingLink) {
		trackingInfoDetail.trackingLink = trackingInfo.trackingLink;
	}
	if (trackingInfo.cargoCompany) {
		trackingInfoDetail.cargoCompany = trackingInfo.cargoCompany;
	}
	if (trackingInfo.cargoCompanyId) {
		trackingInfoDetail.cargoCompanyId = trackingInfo.cargoCompanyId;
	}
	if (trackingInfo.barcode) {
		trackingInfoDetail.barcode = trackingInfo.barcode;
	}
	if (trackingInfo.isSendNotification !== undefined) {
		trackingInfoDetail.isSendNotification = trackingInfo.isSendNotification;
	}

	return Object.keys(trackingInfoDetail).length > 0 ? trackingInfoDetail : null;
}

/**
 * Builds the fulfill input object
 */
function buildFulfillInput(
	context: IExecuteFunctions,
	itemIndex: number,
	orderId: string,
	lines: any[],
): any {
	const markAsReadyForShipment = context.getNodeParameter(
		'markAsReadyForShipment',
		itemIndex,
	) as boolean;
	const sendNotificationToCustomer = context.getNodeParameter(
		'sendNotificationToCustomer',
		itemIndex,
	) as boolean;
	const sourcePackageId = context.getNodeParameter('sourcePackageId', itemIndex) as string;
	const trackingInfo = context.getNodeParameter('trackingInfo', itemIndex) as any;

	// Build fulfill input
	const fulfillInput: any = {
		orderId: orderId,
		lines: lines,
	};

	// Add optional boolean fields
	if (markAsReadyForShipment) {
		fulfillInput.markAsReadyForShipment = markAsReadyForShipment;
	}

	if (sendNotificationToCustomer) {
		fulfillInput.sendNotificationToCustomer = sendNotificationToCustomer;
	}

	// Add source package ID if provided
	if (sourcePackageId) {
		fulfillInput.sourcePackageId = sourcePackageId;
	}

	// Add tracking information if provided
	if (trackingInfo && Object.keys(trackingInfo).length > 0) {
		const trackingInfoDetail = buildTrackingInfoDetail(trackingInfo);
		if (trackingInfoDetail) {
			fulfillInput.trackingInfoDetail = trackingInfoDetail;
		}
	}

	return fulfillInput;
}

export async function fulfillOrder(this: IExecuteFunctions, itemIndex: number): Promise<any> {
	// Get basic parameters
	const orderId = this.getNodeParameter('orderId', itemIndex) as string;
	const fulfillLinesData = this.getNodeParameter('fulfillLines', itemIndex) as any;

	// Validate required fields
	if (!orderId) {
		throw new NodeOperationError(this.getNode(), 'Order ID is required for fulfill operation', {
			itemIndex,
		});
	}

	// Process line items
	const lines = processLineItems(this, itemIndex, fulfillLinesData);

	if (lines.length === 0) {
		throw new NodeOperationError(
			this.getNode(),
			'At least one line item is required for fulfill operation',
			{ itemIndex },
		);
	}

	// Build fulfill input
	const fulfillInput = buildFulfillInput(this, itemIndex, orderId, lines);

	this.logger.info(JSON.stringify(fulfillInput, null, 2), {
		message: 'Fulfill input is here',
	});

	// Execute fulfill mutation
	const response = await ikasGraphQLRequest.call(this, FulfillOrderMutation, {
		input: fulfillInput,
	});

	this.logger.info(JSON.stringify(response, null, 2), {
		message: 'Fulfill order response is here',
	});

	const responseData = response.data?.fulfillOrder || {};

	return responseData;
}
