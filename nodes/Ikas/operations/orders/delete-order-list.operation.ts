import type { IExecuteFunctions } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { ikasGraphQLRequest } from '../../GenericFunctions';
import { DeleteOrderListMutation } from '../../graphql/mutations/DeleteOrderList';
import { extractValidIds } from '../../utils/extract-valid-ids.utils';

/**
 * Deletes multiple orders by their IDs
 */
export async function deleteProductOrderList(this: IExecuteFunctions, itemIndex: number): Promise<any> {
	try {
		// Get the order list IDs to delete from the fixedCollection parameter
		const orderListIdsParam = this.getNodeParameter('orderListIds', itemIndex) as any;
		
		// Extract order list IDs from the fixedCollection structure
		const orderListIds = extractValidIds(orderListIdsParam, 'orderListIds', 'id');

		if (orderListIds.length === 0) {
			throw new NodeOperationError(
				this.getNode(),
				'No valid order list IDs provided for deletion',
				{ itemIndex },
			);
		}

		this.logger.info(`Attempting to delete ${orderListIds.length} product order lists`, {
			orderListIds,
		});

		// Execute the delete mutation (returns boolean)
		const response = await ikasGraphQLRequest.call(this, DeleteOrderListMutation, {
			idList: orderListIds,
		});

		this.logger.info(JSON.stringify(response, null, 2), {
			message: 'Delete product order list response',
		});

		const success: boolean = response.data?.deleteOrderList === true;

		if (!success) {
			throw new NodeOperationError(
				this.getNode(),
				'Failed to delete product order lists',
				{ itemIndex },
			);
		}

		// Return the deletion result
		return {
			success: true,
			deletedIds: orderListIds,
		};
	} catch (error) {
		this.logger.error(JSON.stringify(error, null, 2), {
			message: 'Error in delete product order list operation',
		});

		if (error instanceof NodeOperationError) {
			throw error;
		}

		throw new NodeOperationError(
			this.getNode(),
			`Failed to delete product order lists: ${(error as Error).message}`,
			{ itemIndex },
		);
	}
}
