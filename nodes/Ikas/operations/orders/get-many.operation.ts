import type { IExecuteFunctions } from 'n8n-workflow';

import { GetOrdersQuery } from '../../graphql/queries/GetOrders';
import { executeWithPagination } from '../../utils/pagination.utils';

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
	const orderFilterVariables = buildOrderFilterVariables(this, itemIndex);

	const result = await executeWithPagination(
		this,
		itemIndex,
		GetOrdersQuery,
		orderFilterVariables, // Pass filter variables as base variables
		(response) => ({
			data: response.data?.listOrder?.data || [],
			pagination: {
				page: response.data?.listOrder?.page || 1,
				limit: response.data?.listOrder?.limit || 50,
				count: response.data?.listOrder?.count || 0,
			},
		}),
	);

	this.logger.info(`Fetched ${result.data.length} orders with pagination`, {
		message: 'Orders fetched with pagination',
		pagination: result.pagination,
	});

	// Return the data with pagination metadata attached to each item
	return result.data.map((order: any) => ({
		...order,
		_pagination: result.pagination,
	}));
}
