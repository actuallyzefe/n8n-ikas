import type { IExecuteFunctions } from 'n8n-workflow';

import { ikasGraphQLRequest } from '../../GenericFunctions';
import { GetOrdersQuery } from '../../graphql/queries/GetOrders';

/**
 * Builds order filter variables from additional filters
 */
function buildOrderFilterVariables(context: IExecuteFunctions, itemIndex: number): any {
	const orderVariables: any = {};

	// Handle additional filters
	const additionalFilters = context.getNodeParameter('additionalFilters', itemIndex) as any;
	if (!additionalFilters || Object.keys(additionalFilters).length === 0) {
		return orderVariables;
	}

	// Order status filter - using proper filter format
	if (additionalFilters.status && additionalFilters.status.length > 0) {
		orderVariables.status = {
			in: additionalFilters.status,
		};
	}

	// Payment status filter - using proper filter format
	if (additionalFilters.orderPaymentStatus && additionalFilters.orderPaymentStatus.length > 0) {
		orderVariables.orderPaymentStatus = {
			in: additionalFilters.orderPaymentStatus,
		};
	}

	// Package status filter - using proper filter format
	if (additionalFilters.orderPackageStatus && additionalFilters.orderPackageStatus.length > 0) {
		orderVariables.orderPackageStatus = {
			in: additionalFilters.orderPackageStatus,
		};
	}

	// Customer filters - using proper filter format
	if (additionalFilters.customerId) {
		orderVariables.customerId = {
			eq: additionalFilters.customerId,
		};
	}
	if (additionalFilters.customerEmail) {
		orderVariables.customerEmail = {
			eq: additionalFilters.customerEmail,
		};
	}

	// Order number filter - using proper filter format
	if (additionalFilters.orderNumber) {
		orderVariables.orderNumber = {
			eq: additionalFilters.orderNumber,
		};
	}

	return orderVariables;
}

export async function getManyOrders(this: IExecuteFunctions, itemIndex: number): Promise<any> {
	// Build order filter variables
	const orderVariables = buildOrderFilterVariables(this, itemIndex);

	// Execute query
	const response = await ikasGraphQLRequest.call(this, GetOrdersQuery, orderVariables);

	const responseData = response.data?.listOrder || {};

	this.logger.info(JSON.stringify(responseData, null, 2), {
		message: 'Orders are here',
	});

	return responseData;
}
