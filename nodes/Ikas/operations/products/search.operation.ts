import type { IExecuteFunctions } from 'n8n-workflow';

import { SearchProductsQuery } from '../../graphql/queries/SearchProducts';
import { executeWithPagination } from '../../utils/pagination.utils';

/**
 * Builds search input parameters from node parameters
 */
function buildSearchInput(context: IExecuteFunctions, itemIndex: number): any {
	const searchInput: any = {};

	const searchQuery = context.getNodeParameter('searchQuery', itemIndex) as string;
	if (searchQuery) {
		searchInput.query = searchQuery;
	}

	const productIdList = context.getNodeParameter('productIdList', itemIndex) as string;
	if (productIdList) {
		searchInput.productIdList = productIdList;
	}

	const skuList = context.getNodeParameter('skuList', itemIndex) as string;
	if (skuList) {
		searchInput.skuList = skuList;
	}

	const barcodeList = context.getNodeParameter('barcodeList', itemIndex) as string;
	if (barcodeList) {
		searchInput.barcodeList = barcodeList;
	}

	return searchInput;
}

/**
 * Builds search input with pagination for the current page
 */
function buildSearchInputWithPagination(
	context: IExecuteFunctions,
	itemIndex: number,
	currentPage: number = 1,
): any {
	const searchInput = buildSearchInput(context, itemIndex);

	// Add pagination based on the pagination options
	const fetchAllItems = context.getNodeParameter('fetchAllItems', itemIndex) as boolean;

	if (fetchAllItems) {
		const pageSize = context.getNodeParameter('pageSize', itemIndex) as number;
		searchInput.pagination = {
			page: currentPage,
			limit: pageSize,
		};
	} else {
		const limit = context.getNodeParameter('limit', itemIndex) as number;
		const page = context.getNodeParameter('page', itemIndex) as number;
		searchInput.pagination = {
			page: page,
			limit: limit,
		};
	}

	return searchInput;
}

export async function searchProducts(this: IExecuteFunctions, itemIndex: number): Promise<any> {
	// Build search input variables (keeping all existing search functionality)
	const baseSearchInput = buildSearchInput(this, itemIndex);

	// Use a custom approach for search since it has a different structure than listProduct/listOrder
	const result = await executeWithPagination(
		this,
		itemIndex,
		SearchProductsQuery,
		{}, // No base variables - we'll build everything in the custom variable builder
		(response) => ({
			data: response.data?.searchProducts?.results || [],
			pagination: {
				page: response.data?.searchProducts?.page || 1,
				limit: response.data?.searchProducts?.limit || 50,
				count: response.data?.searchProducts?.count || 0,
			},
		}),
		// Custom variable builder that creates the full search input with pagination
		(options, currentPage = 1) => ({
			input: buildSearchInputWithPagination(this, itemIndex, currentPage),
		}),
	);

	this.logger.info(`Searched and fetched ${result.data.length} products with pagination`, {
		message: 'Search Products completed with pagination',
		pagination: result.pagination,
		searchFilters: baseSearchInput,
	});

	// Return the data with pagination metadata attached to each item
	return result.data.map((product: any) => ({
		...product,
		_pagination: result.pagination,
	}));
}
