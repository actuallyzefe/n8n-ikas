import type { IExecuteFunctions } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';

import { ikasGraphQLRequest } from '../../GenericFunctions';
import { DeleteProductListMutation } from '../../graphql/mutations/DeleteProducts';
import { extractValidIds } from '../../utils/extract-valid-ids.utils';
/**
 * Deletes multiple products by their IDs
 */
export async function deleteProducts(this: IExecuteFunctions, itemIndex: number): Promise<any> {
	try {
		// Get the product IDs to delete from the fixedCollection parameter
		const productIdsParam = this.getNodeParameter('productIds', itemIndex) as any;
		
		// Extract product IDs from the fixedCollection structure
		const productIds = extractValidIds(productIdsParam, 'productIds', 'id');

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

		// Prepare the input for the GraphQL mutation
		const input = {
			productIds: productIds,
		};

		// Execute the delete mutation
		const response = await ikasGraphQLRequest.call(this, DeleteProductListMutation, {
			input,
		});

		this.logger.info(JSON.stringify(response, null, 2), {
			message: 'Delete products response',
		});

		const responseData = response.data?.deleteProducts || {};

		// Check if the deletion was successful
		if (!responseData.success) {
			throw new NodeOperationError(
				this.getNode(),
				`Failed to delete products: ${JSON.stringify(responseData.errors)}`,
				{ itemIndex },
			);
		}

		// Return the deletion result
		return {
			success: responseData.success,
			deletedCount: responseData.deletedCount || 0,
			errors: responseData.errors || [],
			productIds: productIds,
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
