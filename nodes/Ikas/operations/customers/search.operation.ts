import type { IExecuteFunctions, IDataObject } from 'n8n-workflow';

import { ikasGraphQLRequest } from '../../GenericFunctions';
import { GetCustomersQuery } from '../../graphql/queries/GetCustomers';

function buildSearchVariables(context: IExecuteFunctions, itemIndex: number): IDataObject {
	const vars: IDataObject = {};

	// Optional direct search string
	const searchQuery = context.getNodeParameter('searchQuery', itemIndex, '') as string;
	if (searchQuery) vars.search = searchQuery;

	// Optional exact filters
	const email = context.getNodeParameter('email', itemIndex, '') as string;
	if (email) vars.email = { eq: email };

	const id = context.getNodeParameter('id', itemIndex, '') as string;
	if (id) vars.id = { eq: id };

	const phone = context.getNodeParameter('phone', itemIndex, '') as string;
	if (phone) vars.phone = { eq: phone };

	// Sort
	const sort = context.getNodeParameter('sort', itemIndex, '') as string;
	if (sort) vars.sort = sort;

	// UpdatedAt range
	const updatedAtFrom = context.getNodeParameter('updatedAtFrom', itemIndex, '') as string;
	const updatedAtTo = context.getNodeParameter('updatedAtTo', itemIndex, '') as string;
	if (updatedAtFrom || updatedAtTo) {
		const dateFilter: IDataObject = {};
		if (updatedAtFrom) dateFilter.gte = new Date(updatedAtFrom).getTime();
		if (updatedAtTo) dateFilter.lte = new Date(updatedAtTo).getTime();
		vars.updatedAt = dateFilter;
	}

	return vars;
}

function addPagination(context: IExecuteFunctions, itemIndex: number, vars: IDataObject): void {
	const returnAll = (context.getNodeParameter('returnAll', itemIndex, false) as boolean) || false;
	if (!returnAll) {
		const limit = context.getNodeParameter('limit', itemIndex, 50) as number;
		const page = context.getNodeParameter('page', itemIndex, 1) as number;
		vars.pagination = { limit, page };
	}
}

export async function searchCustomers(
	this: IExecuteFunctions,
	itemIndex: number,
): Promise<IDataObject> {
	const vars = buildSearchVariables(this, itemIndex);
	addPagination(this, itemIndex, vars);

	const returnAll = (this.getNodeParameter('returnAll', itemIndex, false) as boolean) || false;

	if (returnAll) {
		const pageLimit = 100;
		let page = 1;
		let collected: IDataObject[] = [];

		while (true) {
			vars.pagination = { limit: pageLimit, page };
			const response = await ikasGraphQLRequest.call(this, GetCustomersQuery, vars);

			const list = response.data?.listCustomer || {
				data: [],
				page,
				limit: pageLimit,
				count: 0,
			};

			const batch = (list.data as IDataObject[]) || [];
			collected = collected.concat(batch);

			const total = (list.count as number) ?? 0;

			if (collected.length >= total || batch.length < pageLimit) {
				break;
			}

			page += 1;
		}

		return {
			results: collected,
			paging: {
				page: 1,
				limit: collected.length,
				count: collected.length,
			},
		} as IDataObject;
	}

	const response = await ikasGraphQLRequest.call(this, GetCustomersQuery, vars);

	const list = response.data?.listCustomer || {
		data: [],
		page: 1,
		limit: 50,
		count: 0,
	};

	return {
		results: list.data,
		paging: {
			page: list.page,
			limit: list.limit,
			count: list.count,
		},
	} as IDataObject;
}
