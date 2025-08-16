import type { IExecuteFunctions } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';

import { ikasApiRequest } from '../../GenericFunctions';

/**
 * Validates image input parameters
 */
function validateImageInput(context: IExecuteFunctions, itemIndex: number): void {
	const imageSource = context.getNodeParameter('imageSource', itemIndex) as string;

	if (imageSource === 'url') {
		const imageUrl = context.getNodeParameter('imageUrl', itemIndex) as string;
		if (!imageUrl || !imageUrl.trim()) {
			throw new NodeOperationError(
				context.getNode(),
				'Image URL is required when using URL as image source',
				{ itemIndex },
			);
		}
	} else if (imageSource === 'base64') {
		const imageBase64 = context.getNodeParameter('imageBase64', itemIndex) as string;
		if (!imageBase64 || !imageBase64.trim()) {
			throw new NodeOperationError(
				context.getNode(),
				'Base64 image data is required when using Base64 as image source',
				{ itemIndex },
			);
		}
	}
}

/**
 * Builds the image upload request body
 */
function buildImageUploadBody(context: IExecuteFunctions, itemIndex: number): any {
	const imageSource = context.getNodeParameter('imageSource', itemIndex) as string;
	const order = context.getNodeParameter('order', itemIndex) as number;
	const isMain = context.getNodeParameter('isMain', itemIndex) as boolean;

	const imageData: any = {
		order: order || 0,
		isMain: isMain || false,
	};

	// Add image source data
	if (imageSource === 'url') {
		imageData.url = context.getNodeParameter('imageUrl', itemIndex) as string;
	} else if (imageSource === 'base64') {
		imageData.base64 = context.getNodeParameter('imageBase64', itemIndex) as string;
	}

	// Get variant IDs from selection
	const variantIds = context.getNodeParameter('variantIds', itemIndex) as string[];
	if (!variantIds || variantIds.length === 0) {
		throw new NodeOperationError(
			context.getNode(),
			'At least one variant must be selected for image upload',
			{ itemIndex },
		);
	}

	return {
		productImage: {
			variantIds: variantIds,
			...imageData,
		},
	};
}

export async function uploadImage(this: IExecuteFunctions, itemIndex: number): Promise<any> {
	// Validate image input
	validateImageInput(this, itemIndex);

	// Build request body
	const requestBody = buildImageUploadBody(this, itemIndex);

	this.logger.info(JSON.stringify(requestBody, null, 2), {
		message: 'Upload image request body',
	});

	try {
		// Make the REST API call to upload image
		const response = await ikasApiRequest.call(this, 'POST', '/product/upload/image', requestBody);

		this.logger.info(JSON.stringify(response, null, 2), {
			message: 'Upload image response',
		});

		// Return success response with metadata
		return {
			success: true,
			message: 'Image uploaded successfully',
			imageSource: this.getNodeParameter('imageSource', itemIndex),
			variantIds: requestBody.productImage.variantIds,
			order: requestBody.productImage.order,
			isMain: requestBody.productImage.isMain,
			response: response,
		};
	} catch (error) {
		this.logger.error(JSON.stringify(error, null, 2), {
			message: 'Upload image error',
		});

		throw new NodeOperationError(
			this.getNode(),
			`Failed to upload image: ${(error as Error).message}`,
			{ itemIndex },
		);
	}
}
