import type { IExecuteFunctions } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';

import { ikasGraphQLRequest } from '../../GenericFunctions';
import { DeleteProductsMutation } from '../../graphql/mutations/DeleteProducts';
import { extractValidIds } from '../../utils/extract-valid-ids.utils';
/**
 * Deletes multiple products by their IDs
 */
export async function deleteProducts(this: IExecuteFunctions, itemIndex: number): Promise<any> {
	try {
		// Get the product IDs to delete from the fixedCollection parameter
		const productIdsParam = this.getNodeParameter('productIds', itemIndex) as any;
		
		// Extract product IDs from the fixedCollection structure
		const productIds = extractValidIds(productIdsParam, 'productIds', 'productId');

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


		// Execute the delete mutation
		const response = await ikasGraphQLRequest.call(this, DeleteProductsMutation, {
			idList: productIds,
		});

		this.logger.info(JSON.stringify(response, null, 2), {
			message: 'Delete products response',
		});

		const success: boolean = response.data?.deleteProductList === true;

		// Check if the deletion was successful
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
