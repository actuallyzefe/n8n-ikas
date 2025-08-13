import type { IExecuteFunctions } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';

import { ikasGraphQLRequest } from '../../GenericFunctions';
import { DeleteProductListMutation } from '../../graphql/mutations/DeleteProductList';
/**
 * Deletes multiple products by their IDs
 */
export async function deleteProducts(this: IExecuteFunctions, itemIndex: number): Promise<any> {
	try {
		// Get the product IDs to delete from the fixedCollection parameter
		const productIdsParam = this.getNodeParameter('productIds', itemIndex) as any;
		
		// Extract product IDs from the fixedCollection structure
		let productIds: string[] = [];
		if (productIdsParam && productIdsParam.productIds && Array.isArray(productIdsParam.productIds)) {
			productIds = productIdsParam.productIds.map((item: any) => item.productId).filter((id: string) => id && id.trim() !== '');
		}

		if (productIds.length === 0) {
			throw new NodeOperationError(
				this.getNode(),
				'No valid product IDs provided for deletion',
				{ itemIndex },
			);
		}

		this.logger.info(`Attempting to delete ${productIds.length} products`, {
			productIds,
		});

		// Execute the delete mutation (returns boolean)
		const response = await ikasGraphQLRequest.call(this, DeleteProductListMutation, {
			idList: productIds,
		});

		this.logger.info(JSON.stringify(response, null, 2), {
			message: 'Delete products response',
		});

		const success: boolean = response.data?.deleteProductList === true;

		if (!success) {
			throw new NodeOperationError(
				this.getNode(),
				'Failed to delete products',
				{ itemIndex },
			);
		}

		// Return the deletion result
		return {
			success: true,
			deletedIds: productIds,
		};
	} catch (error) {
		this.logger.error(JSON.stringify(error, null, 2), {
			message: 'Error in delete products operation',
		});

		if (error instanceof NodeOperationError) {
			throw error;
		}

		throw new NodeOperationError(
			this.getNode(),
			`Failed to delete products: ${(error as Error).message}`,
			{ itemIndex },
		);
	}
}
