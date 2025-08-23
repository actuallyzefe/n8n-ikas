import type { IExecuteFunctions } from 'n8n-workflow';

import { ikasApiRequest } from '../../../GenericFunctions';

/**
 * Handles image upload after product creation or update
 */
export async function handleImageUpload(
	context: IExecuteFunctions,
	responseData: any,
	additionalFields: any,
): Promise<void> {
	// Check if productImage collection exists and has content
	if (!additionalFields.productImage || Object.keys(additionalFields.productImage).length === 0) {
		return;
	}

	try {
		const productImage = additionalFields.productImage;
		const imageTarget = productImage.imageTarget || 'product';
		const targetVariantId = productImage.targetVariantId;

		// Determine which variants to upload to
		let variantIds: string[] = [];

		if (imageTarget === 'variant') {
			// Upload to specific variant
			if (!targetVariantId || !targetVariantId.trim()) {
				context.logger.warn(
					'Target Variant ID is required when Image Target is "Specific Variant"',
				);
				return;
			}

			// Verify the variant exists
			const targetVariant = responseData.variants?.find((v: any) => v.id === targetVariantId);
			if (!targetVariant) {
				context.logger.warn(`Variant with ID ${targetVariantId} not found in product`);
				return;
			}

			variantIds = [targetVariantId];
			context.logger.info(`Uploading image to specific variant: ${targetVariantId}`);
		} else {
			// Upload to all variants (product level)
			variantIds = responseData.variants?.map((v: any) => v.id) || [];
			if (variantIds.length === 0) {
				context.logger.warn('Could not upload image: no variants found in product');
				return;
			}
			context.logger.info(`Uploading image to all ${variantIds.length} variants`);
		}

		const imageSource = productImage.imageSource || 'url';
		const imageOrder = productImage.imageOrder || 0;
		const isMainImage = productImage.isMainImage !== false; // Default to true

		const imageData: any = {
			order: imageOrder,
			isMain: isMainImage,
		};

		// Add image source data
		if (imageSource === 'url') {
			const imageUrl = productImage.imageUrl;
			if (!imageUrl || !imageUrl.trim()) {
				context.logger.warn('Image URL is required when using URL as image source');
				return;
			}
			imageData.url = imageUrl;
		} else if (imageSource === 'base64') {
			const imageBase64 = productImage.imageBase64;
			if (!imageBase64 || !imageBase64.trim()) {
				context.logger.warn('Base64 image data is required when using Base64 as image source');
				return;
			}
			imageData.base64 = imageBase64;
		}

		const requestBody = {
			productImage: {
				variantIds: variantIds,
				...imageData,
			},
		};

		context.logger.info(JSON.stringify(requestBody, null, 2), {
			message: 'Upload image request body',
		});

		// Make the REST API call to upload image
		const uploadResponse = await ikasApiRequest.call(
			context,
			'POST',
			'/product/upload/image',
			requestBody,
		);

		context.logger.info(JSON.stringify(uploadResponse, null, 2), {
			message: 'Upload image response',
		});

		// Add image upload info to response
		Object.assign(responseData, {
			imageUploaded: true,
			imageSource: imageSource,
			imageOrder: imageOrder,
			isMainImage: isMainImage,
			imageTarget: imageTarget,
			targetVariantIds: variantIds,
			variantsUpdated: variantIds.length,
		});
	} catch (imageError) {
		context.logger.error(JSON.stringify(imageError, null, 2), {
			message: 'Image upload error',
		});
		context.logger.error('Failed to upload image after product operation', {
			error: imageError,
			productId: responseData.id,
		});
		// Don't throw - product operation was successful, just image upload failed
		Object.assign(responseData, {
			imageUploadError: true,
			imageUploadErrorMessage: (imageError as Error).message,
		});
	}
}
