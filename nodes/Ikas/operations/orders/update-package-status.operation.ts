import type { IExecuteFunctions } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';

import { ikasGraphQLRequest } from '../../GenericFunctions';
import { UpdateOrderPackageStatusMutation } from '../../graphql/mutations/UpdateOrderPackageStatus';

/**
 * Builds tracking information for package updates
 */
function buildPackageTrackingInfo(trackingInfo: any): any {
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
 * Validates and processes package updates
 */
function processPackageUpdates(
	context: IExecuteFunctions,
	itemIndex: number,
	packageUpdatesData: any,
): any[] {
	const packages: any[] = [];

	if (!packageUpdatesData?.packages || !Array.isArray(packageUpdatesData.packages)) {
		return packages;
	}

	for (const packageUpdate of packageUpdatesData.packages) {
		if (!packageUpdate.packageId) {
			throw new NodeOperationError(
				context.getNode(),
				'Package ID is required for each package update',
				{ itemIndex },
			);
		}
		if (!packageUpdate.status) {
			throw new NodeOperationError(
				context.getNode(),
				'Status is required for each package update',
				{ itemIndex },
			);
		}

		const packageData: any = {
			packageId: packageUpdate.packageId,
			status: packageUpdate.status,
		};

		// Add optional fields
		if (packageUpdate.errorMessage) {
			packageData.errorMessage = packageUpdate.errorMessage;
		}

		if (packageUpdate.sourceId) {
			packageData.sourceId = packageUpdate.sourceId;
		}

		// Add tracking information if provided
		if (packageUpdate.trackingInfo && Object.keys(packageUpdate.trackingInfo).length > 0) {
			const trackingInfoDetail = buildPackageTrackingInfo(packageUpdate.trackingInfo);
			if (trackingInfoDetail) {
				packageData.trackingInfo = trackingInfoDetail;
			}
		}

		packages.push(packageData);
	}

	return packages;
}

/**
 * Builds the update package status input object
 */
function buildUpdateInput(orderId: string, packages: any[], globalSourceId?: string): any {
	const updateInput: any = {
		orderId: orderId,
		packages: packages,
	};

	// Add global source ID if provided
	if (globalSourceId) {
		updateInput.sourceId = globalSourceId;
	}

	return updateInput;
}

export async function updateOrderPackageStatus(
	this: IExecuteFunctions,
	itemIndex: number,
): Promise<any> {
	// Get basic parameters
	const orderIdForPackageStatus = this.getNodeParameter(
		'orderIdForPackageStatus',
		itemIndex,
	) as string;
	const packageUpdatesData = this.getNodeParameter('packageUpdates', itemIndex) as any;
	const globalSourceId = this.getNodeParameter('globalSourceId', itemIndex) as string;

	// Validate required fields
	if (!orderIdForPackageStatus) {
		throw new NodeOperationError(
			this.getNode(),
			'Order ID is required for update package status operation',
			{ itemIndex },
		);
	}

	// Process packages
	const packages = processPackageUpdates(this, itemIndex, packageUpdatesData);

	if (packages.length === 0) {
		throw new NodeOperationError(this.getNode(), 'At least one package update is required', {
			itemIndex,
		});
	}

	// Build update input
	const updateInput = buildUpdateInput(orderIdForPackageStatus, packages, globalSourceId);

	this.logger.info(JSON.stringify(updateInput, null, 2), {
		message: 'Update package status input is here',
	});

	// Execute update mutation
	const response = await ikasGraphQLRequest.call(this, UpdateOrderPackageStatusMutation, {
		input: updateInput,
	});

	this.logger.info(JSON.stringify(response, null, 2), {
		message: 'Update package status response is here',
	});

	const responseData = response.data?.updateOrderPackageStatus || {};

	return responseData;
}
