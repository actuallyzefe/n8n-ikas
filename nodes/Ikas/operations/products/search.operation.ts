import type { IExecuteFunctions } from 'n8n-workflow';

import { ikasGraphQLRequest } from '../../GenericFunctions';
import { SearchProductsQuery } from '../../graphql/queries/SearchProducts';

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
 * Adds pagination parameters to search input
 */
function addPaginationToSearchInput(
	context: IExecuteFunctions,
	itemIndex: number,
	searchInput: any,
): void {
	const returnAll = context.getNodeParameter('returnAll', itemIndex) as boolean;
	if (!returnAll) {
		const limit = context.getNodeParameter('limit', itemIndex) as number;
		const page = context.getNodeParameter('page', itemIndex) as number;
		searchInput.pagination = {
			limit,
			page,
		};
	}
}

export async function searchProducts(this: IExecuteFunctions, itemIndex: number): Promise<any> {
	// Build search input variables
	const searchInput = buildSearchInput(this, itemIndex);

	// Add pagination if needed
	addPaginationToSearchInput(this, itemIndex, searchInput);

	// Execute search query
	const response = await ikasGraphQLRequest.call(this, SearchProductsQuery, {
		input: searchInput,
	});

	const responseData = response.data?.searchProducts || { results: [], paging: {} };

	this.logger.info(JSON.stringify(responseData, null, 2), {
		message: 'Search Products are here',
	});

	return responseData;
}
