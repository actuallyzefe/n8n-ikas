import type { IExecuteFunctions } from 'n8n-workflow';
import { ikasGraphQLRequest } from '../GenericFunctions';

// TODO: Implement sleep function to avoid rate limiting

export interface PaginationOptions {
	fetchAllItems: boolean;
	limit?: number;
	page?: number;
	pageSize?: number;
}

export interface PaginationResult<T> {
	data: T[];
	pagination: {
		page: number;
		limit: number;
		count: number;
		totalPages?: number;
		hasMore?: boolean;
	};
}

/**
 * Extracts pagination options from node parameters
 */
export function getPaginationOptions(
	context: IExecuteFunctions,
	itemIndex: number,
): PaginationOptions {
	const fetchAllItems = context.getNodeParameter('fetchAllItems', itemIndex) as boolean;

	if (fetchAllItems) {
		const pageSize = context.getNodeParameter('pageSize', itemIndex) as number;
		return { fetchAllItems, pageSize };
	}

	const limit = context.getNodeParameter('limit', itemIndex) as number;
	const page = context.getNodeParameter('page', itemIndex) as number;

	return { fetchAllItems, limit, page };
}

/**
 * Builds pagination variables for GraphQL queries using PaginationInput type
 */
export function buildPaginationVariables(
	options: PaginationOptions,
	currentPage: number = 1,
): { pagination?: { page: number; limit: number } } {
	if (options.fetchAllItems) {
		return {
			pagination: {
				page: currentPage,
				limit: options.pageSize || 100,
			},
		};
	}

	return {
		pagination: {
			page: options.page || currentPage,
			limit: options.limit || 50,
		},
	};
}

/**
 * Executes a GraphQL query with automatic pagination support
 */
export async function executeWithPagination<T>(
	context: IExecuteFunctions,
	itemIndex: number,
	query: string,
	baseVariables: any = {},
	dataExtractor: (response: any) => { data: T[]; pagination: any },
	customVariableBuilder?: (options: PaginationOptions, currentPage?: number) => any,
): Promise<PaginationResult<T>> {
	const options = getPaginationOptions(context, itemIndex);
	let allData: T[] = [];
	let currentPage = 1;
	let totalPages = 1;
	let lastPagination: any = {};

	// If not fetching all items, just make a single request
	if (!options.fetchAllItems) {
		const variables = customVariableBuilder
			? { ...baseVariables, ...customVariableBuilder(options) }
			: { ...baseVariables, ...buildPaginationVariables(options) };

		const paginationInfo = customVariableBuilder
			? 'custom'
			: buildPaginationVariables(options).pagination;
		context.logger.info(
			`Single request - Page ${typeof paginationInfo === 'object' ? paginationInfo.page : 'custom'} with limit ${typeof paginationInfo === 'object' ? paginationInfo.limit : 'custom'}`,
			{
				message: 'Single pagination request',
				variables: JSON.stringify(variables),
			},
		);

		const response = await ikasGraphQLRequest.call(context, query, variables);
		const result = dataExtractor(response);

		// Debug logging for single request
		context.logger.info(`Single request response - Data length: ${result.data?.length || 0}`, {
			message: 'Single request response debug',
			variables: JSON.stringify(variables),
			paginationInfo: JSON.stringify(result.pagination),
			dataLength: result.data?.length || 0,
			rawResponse: JSON.stringify(response.data, null, 2),
		});

		return {
			data: result.data,
			pagination: {
				page: result.pagination.page || 1,
				limit: result.pagination.limit || options.limit || options.pageSize || 50,
				count: result.pagination.count || result.data.length,
				totalPages: 1,
				hasMore: false,
			},
		};
	}

	// Auto-pagination logic
	do {
		const variables = customVariableBuilder
			? { ...baseVariables, ...customVariableBuilder(options, currentPage) }
			: { ...baseVariables, ...buildPaginationVariables(options, currentPage) };

		const limit = customVariableBuilder
			? options.pageSize || 50
			: buildPaginationVariables(options, currentPage).pagination?.limit;
		context.logger.info(`Fetching page ${currentPage} with limit ${limit}`, {
			message: 'Pagination request',
		});

		const response = await ikasGraphQLRequest.call(context, query, variables);
		const result = dataExtractor(response);

		// Debug logging to understand API response
		context.logger.info(`API Response - Data length: ${result.data?.length || 0}`, {
			message: 'API Response Debug',
			variables: JSON.stringify(variables),
			paginationInfo: JSON.stringify(result.pagination),
			dataLength: result.data?.length || 0,
		});

		if (!result.data || result.data.length === 0) {
			context.logger.info('Breaking pagination loop - no data returned', {
				message: 'Pagination break',
				reason: !result.data ? 'result.data is null/undefined' : 'result.data.length is 0',
			});
			break;
		}

		allData.push(...result.data);
		lastPagination = result.pagination;

		// Calculate total pages if we have count information
		if (result.pagination.count !== undefined && limit) {
			totalPages = Math.ceil(result.pagination.count / limit);
		}

		// For fetchAllItems mode, continue until we reach the calculated total pages
		// or we get less data than requested (indicating we've reached the end)
		const expectedLimit = limit || 100;
		if (result.data.length < expectedLimit) {
			break;
		}

		currentPage++;

		// Safety check to prevent infinite loops
		if (currentPage > 1000) {
			context.logger.warn('Reached maximum page limit (1000), stopping pagination', {
				message: 'Pagination safety limit reached',
			});
			break;
		}
	} while (true);

	context.logger.info(
		`Completed pagination. Fetched ${allData.length} items across ${currentPage - 1} pages`,
		{
			message: 'Pagination completed',
		},
	);

	return {
		data: allData,
		pagination: {
			page: 1, // Since we're returning all data, start from page 1
			limit: allData.length,
			count: allData.length,
			totalPages: currentPage - 1,
			hasMore: false,
		},
	};
}
