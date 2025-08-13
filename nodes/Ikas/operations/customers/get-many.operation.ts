import type { IExecuteFunctions, IDataObject } from 'n8n-workflow';

import { ikasGraphQLRequest } from '../../GenericFunctions';
import { GetCustomersQuery } from '../../graphql/queries/GetCustomers';

/**
 * Builds the query variables for filtering customers
 */
function buildCustomerFilters(context: IExecuteFunctions, itemIndex: number): IDataObject {
	const filters: IDataObject = {};

	// Get pagination settings
	const limit = context.getNodeParameter('limit', itemIndex, 50) as number;
	filters.pagination = {
		limit,
		page: 1,
	};

	// Get additional filters
	const additionalFilters = context.getNodeParameter(
		'additionalFilters',
		itemIndex,
		{},
	) as IDataObject;

	if (additionalFilters && Object.keys(additionalFilters).length > 0) {
		// Email filter
		if (additionalFilters.email) {
			filters.email = { eq: additionalFilters.email };
		}

		// Customer ID filter
		if (additionalFilters.id) {
			filters.id = { eq: additionalFilters.id };
		}

		// Phone filter
		if (additionalFilters.phone) {
			filters.phone = { eq: additionalFilters.phone };
		}

		// Search filter
		if (additionalFilters.search) {
			filters.search = additionalFilters.search;
		}

		// Sort filter
		if (additionalFilters.sort) {
			filters.sort = additionalFilters.sort;
		}

		// Date range filters
		if (additionalFilters.updatedAtFrom || additionalFilters.updatedAtTo) {
			const dateFilter: IDataObject = {};
			if (additionalFilters.updatedAtFrom) {
				dateFilter.gte = new Date(additionalFilters.updatedAtFrom as string).getTime();
			}
			if (additionalFilters.updatedAtTo) {
				dateFilter.lte = new Date(additionalFilters.updatedAtTo as string).getTime();
			}
			filters.updatedAt = dateFilter;
		}

		// Multi-select filters that need special handling
		const multiSelectFilters = ['accountStatus', 'subscriptionStatus', 'registrationSource'];
		for (const filterName of multiSelectFilters) {
			if (additionalFilters[filterName] && Array.isArray(additionalFilters[filterName])) {
				const values = additionalFilters[filterName] as string[];
				if (values.length > 0) {
					filters[filterName] = { in: values };
				}
			}
		}

		// Boolean filters
		if (typeof additionalFilters.isEmailVerified === 'boolean') {
			filters.isEmailVerified = { eq: additionalFilters.isEmailVerified };
		}
		if (typeof additionalFilters.isPhoneVerified === 'boolean') {
			filters.isPhoneVerified = { eq: additionalFilters.isPhoneVerified };
		}
	}

	return filters;
}

export async function getManyCustomers(
	this: IExecuteFunctions,
	itemIndex: number,
): Promise<IDataObject[]> {
	const filters = buildCustomerFilters(this, itemIndex);

	const response = await ikasGraphQLRequest.call(this, GetCustomersQuery, filters);

	this.logger.info(JSON.stringify(response, null, 2), {
		message: 'Get customers response',
	});

	const responseData = response.data?.listCustomer?.data || [];

	return responseData;
}
