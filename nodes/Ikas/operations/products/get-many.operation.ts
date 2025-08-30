import type { IExecuteFunctions } from 'n8n-workflow';

import { GetProductsQuery } from '../../graphql/queries/GetProducts';
import { executeWithPagination } from '../../utils/pagination.utils';

export async function getManyProducts(this: IExecuteFunctions, itemIndex: number): Promise<any> {
	const result = await executeWithPagination(
		this,
		itemIndex,
		GetProductsQuery,
		{}, // No additional filter variables for basic product listing
		(response) => ({
			data: response.data?.listProduct?.data || [],
			pagination: {
				page: response.data?.listProduct?.page || 1,
				limit: response.data?.listProduct?.limit || 50,
				count: response.data?.listProduct?.count || 0,
			},
		}),
	);

	// Return the data with pagination metadata attached to each item
	return result.data.map((product: any) => ({
		...product,
		_pagination: result.pagination,
	}));
}
