import type { IExecuteFunctions } from 'n8n-workflow';

import { ikasGraphQLRequest } from '../../GenericFunctions';
import { GetProductsQuery } from '../../graphql/queries/GetProducts';

export async function getManyProducts(this: IExecuteFunctions, itemIndex: number): Promise<any[]> {
	const response = await ikasGraphQLRequest.call(this, GetProductsQuery);

	const responseData = response.data?.listProduct?.data || [];

	return responseData;
}
