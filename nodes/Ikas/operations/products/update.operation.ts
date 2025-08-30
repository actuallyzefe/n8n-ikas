import type { IExecuteFunctions } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';

import { ikasGraphQLRequest } from '../../GenericFunctions';
import { SaveProductMutation } from '../../graphql/mutations/SaveProduct';
import { SaveStockLocationsMutation } from '../../graphql/mutations/SaveStockLocations';
import { GetProductByIdQuery } from '../../graphql/queries/GetProductById';
import { GetStockLocationsQuery } from '../../graphql/queries/GetStockLocations';
import { handleImageUpload } from './helpers/upload-image.helpers';
import {
	validateVariantIdRequirement,
	type VariantSpecificFields,
} from './helpers/variant-validation.helpers';

/**
 * Fetches existing product data by ID
 */
async function fetchExistingProduct(context: IExecuteFunctions, productId: string): Promise<any> {
	const trimmedProductId = productId.trim();
	const productToUpdate = await ikasGraphQLRequest.call(context, GetProductByIdQuery, {
		id: {
			eq: trimmedProductId,
		},
	});

	const product = productToUpdate.data?.listProduct.data[0] || {};

	context.logger.info(JSON.stringify(product, null, 2), {
		message: 'Product is here',
	});

	return product;
}

/**
 * Builds the basic product update input with required fields only
 */
function buildUpdateProductInput(
	context: IExecuteFunctions,
	itemIndex: number,
	existingProduct: any,
): any {
	const productInput: any = {
		id: context.getNodeParameter('productId', itemIndex) as string,
		// These are required by IKAS API even for updates
		name: context.getNodeParameter('productName', itemIndex) as string,
		type: context.getNodeParameter('productType', itemIndex) as string,
	};

	// Handle sales channels - required by IKAS API
	const salesChannelIds = context.getNodeParameter('salesChannelIds', itemIndex) as string[];
	if (salesChannelIds && salesChannelIds.length > 0) {
		productInput.salesChannelIds = salesChannelIds;
	} else if (existingProduct.salesChannelIds && existingProduct.salesChannelIds.length > 0) {
		// Keep existing sales channels if none specified
		productInput.salesChannelIds = existingProduct.salesChannelIds;
	}

	// Preserve productVariantTypes for variable products (critical for variant structure)
	if (existingProduct.productVariantTypes && existingProduct.productVariantTypes.length > 0) {
		productInput.productVariantTypes = existingProduct.productVariantTypes;
	}

	return productInput;
}

/**
 * Creates variant update objects for product update
 * Handles both simple products (single variant) and variable products (multiple variants)
 */
function createVariantUpdates(
	context: IExecuteFunctions,
	itemIndex: number,
	existingProduct: any,
): { updatedVariants: any[]; targetVariantId: string } {
	try {
		const additionalFields = context.getNodeParameter('additionalFields', itemIndex) as any;
		const price = additionalFields?.price || null;
		const buyPrice = additionalFields?.buyPrice || null;
		const discountPrice = additionalFields?.discountPrice || null;
		const sku = additionalFields?.sku || '';
		const barcodeList = additionalFields?.barcodeList || '';

		// For variant-specific image uploads, use targetVariantId as variantId
		let variantId = additionalFields?.variantId || '';
		if (
			!variantId &&
			additionalFields?.productImage?.imageTarget === 'variant' &&
			additionalFields?.productImage?.targetVariantId
		) {
			variantId = additionalFields.productImage.targetVariantId;
		}

		// Get existing variants
		const existingVariants = existingProduct.variants || [];
		if (existingVariants.length === 0) {
			throw new Error('Product has no variants to update');
		}

		// Determine if this is a variable product (multiple variants)
		const isVariableProduct = existingVariants.length > 1;

		context.logger.info(
			`Product type detected: ${isVariableProduct ? 'Variable Product' : 'Simple Product'} ` +
				`(${existingVariants.length} variant${existingVariants.length > 1 ? 's' : ''})`,
			{ message: 'Product structure analysis' },
		);

		// Validate variant ID requirement for variable products
		const variantSpecificFields: VariantSpecificFields = {
			price,
			buyPrice,
			discountPrice,
			sku,
			barcodeList,
			stockCount: additionalFields?.stockCount,
			productImage: additionalFields?.productImage,
		};

		validateVariantIdRequirement(
			isVariableProduct,
			variantId,
			variantSpecificFields,
			existingVariants,
		);

		context.logger.info(
			`After validation: variantId="${variantId}", additionalFields.variantId="${additionalFields?.variantId}"`,
			{ message: 'Variant ID validation debug' },
		);

		// Determine target variant
		// For variable products with variant-specific updates, variantId is required and validated above
		// For simple products, use the only variant available
		const targetVariantId = variantId && variantId.trim() ? variantId : existingVariants[0].id;

		context.logger.info(
			`Target variant determination: variantId="${variantId}", targetVariantId="${targetVariantId}", isVariableProduct=${isVariableProduct}`,
			{ message: 'Variant targeting debug' },
		);

		// Find the target variant
		const targetVariantIndex = existingVariants.findIndex((v: any) => v.id === targetVariantId);
		if (targetVariantIndex === -1) {
			throw new Error(`Variant with ID ${targetVariantId} not found in product`);
		}

		// Create updated variants array - preserve all variants, update only the target one
		const updatedVariants = existingVariants.map((existingVariant: any, index: number) => {
			if (index !== targetVariantIndex) {
				// Preserve other variants as-is, but exclude fields not supported by VariantInput
				// Only include fields that are part of the VariantInput type
				const {
					id,
					sku,
					barcodeList,
					isActive,
					variantValueIds,
					attributes,
					images,
					prices,
					unit,
					weight,
				} = existingVariant;

				return {
					id,
					sku,
					barcodeList,
					isActive,
					variantValueIds,
					attributes,
					images,
					prices,
					unit,
					weight,
				};
			}

			// Update the target variant
			const variantUpdate: any = {
				isActive: true,
				id: existingVariant.id,
			};

			// Handle pricing updates
			const hasPriceUpdates = price !== null || buyPrice !== null || discountPrice !== null;
			if (hasPriceUpdates) {
				const priceData: any = {};

				if (price !== null && price !== '') {
					priceData.sellPrice = price;
				}
				if (buyPrice !== null && buyPrice !== '') {
					priceData.buyPrice = buyPrice;
				}
				if (discountPrice !== null && discountPrice !== '') {
					priceData.discountPrice = discountPrice;
				}

				variantUpdate.prices = [priceData];
			} else {
				variantUpdate.prices = existingVariant.prices;
			}

			// Add SKU if provided, otherwise preserve existing SKU
			if (sku && sku.trim()) {
				variantUpdate.sku = sku;
			} else if (existingVariant.sku) {
				variantUpdate.sku = existingVariant.sku;
			}

			// Add barcode list if provided, otherwise preserve existing barcodes
			if (barcodeList && barcodeList.trim()) {
				// Convert comma-separated string to array and trim whitespace
				variantUpdate.barcodeList = barcodeList
					.split(',')
					.map((barcode: string) => barcode.trim())
					.filter((barcode: string) => barcode.length > 0);
			} else if (existingVariant.barcodeList && Array.isArray(existingVariant.barcodeList)) {
				variantUpdate.barcodeList = existingVariant.barcodeList;
			} else {
				variantUpdate.barcodeList = [];
			}

			// Preserve existing variant fields that aren't being updated

			// Preserve variantValueIds (critical for variable products)
			if (existingVariant.variantValueIds && existingVariant.variantValueIds.length > 0) {
				variantUpdate.variantValueIds = existingVariant.variantValueIds;
			}

			// Preserve attributes
			if (existingVariant.attributes && existingVariant.attributes.length > 0) {
				variantUpdate.attributes = existingVariant.attributes;
			}

			// Preserve unit
			if (existingVariant.unit) {
				variantUpdate.unit = existingVariant.unit;
			}

			// Preserve weight
			if (existingVariant.weight !== null && existingVariant.weight !== undefined) {
				variantUpdate.weight = existingVariant.weight;
			}

			// Always preserve existing valid images
			// New images are added via REST API after the GraphQL mutation, so we need to preserve existing ones
			if (existingVariant.images && existingVariant.images.length > 0) {
				// Filter out invalid images (those without proper imageId)
				// Skip image preservation if any image lacks imageId, as this is required by the GraphQL schema
				const hasInvalidImages = existingVariant.images.some((image: any) => {
					return (
						!image ||
						!image.imageId ||
						image.imageId === null ||
						image.imageId === undefined ||
						image.imageId === ''
					);
				});

				if (!hasInvalidImages) {
					// Always preserve existing valid images - new images will be added via REST API
					variantUpdate.images = existingVariant.images;
				}
				// If there are invalid images, don't preserve any images to avoid GraphQL errors
			}

			// Note: stocks field is not included in VariantInput type - it's managed separately via stock management API

			return variantUpdate;
		});

		context.logger.info(JSON.stringify(updatedVariants, null, 2), {
			message: 'Updated variants array',
		});

		return { updatedVariants, targetVariantId };
	} catch (error) {
		context.logger.error(JSON.stringify(error, null, 2), {
			message: 'Error creating variant updates',
		});
		throw new NodeOperationError(
			context.getNode(),
			`Error creating variant updates: ${(error as Error).message}`,
			{ itemIndex },
		);
	}
}

/**
 * Cleans up null values from variant prices
 */
function cleanVariantPrices(variantUpdate: any): void {
	if (variantUpdate.prices && variantUpdate.prices[0]) {
		Object.keys(variantUpdate.prices[0]).forEach((key) => {
			if (variantUpdate.prices[0][key] === null) {
				delete variantUpdate.prices[0][key];
			}
		});
	}
}

/**
 * Validates a stock location ID exists
 */
async function validateStockLocationId(
	context: IExecuteFunctions,
	stockLocationId: string,
): Promise<any> {
	const stockLocationResponse = await ikasGraphQLRequest.call(context, GetStockLocationsQuery);

	context.logger.info(JSON.stringify(stockLocationResponse, null, 2), {
		message: 'Stock location response is here',
	});

	const stockLocations = stockLocationResponse.data?.listStockLocation || [];

	context.logger.info(JSON.stringify(stockLocations, null, 2), {
		message: 'Stock locations are here',
	});

	const stockLocation = stockLocations.find((location: any) => location.id === stockLocationId);

	if (!stockLocation) {
		throw new NodeOperationError(
			context.getNode(),
			`No stock location found with ID: ${stockLocationId}`,
		);
	}

	return stockLocation;
}

/**
 * Updates stock for a product after update
 */
async function updateProductStock(
	context: IExecuteFunctions,
	productId: string,
	variantId: string,
	stockCount: number,
	stockLocationId: string,
): Promise<any> {
	// Validate the stock location ID exists
	const stockLocation = await validateStockLocationId(context, stockLocationId);

	context.logger.info(`Using stock location: ${stockLocation.name} (ID: ${stockLocationId})`);

	const stockInput = {
		productStockLocationInputs: [
			{
				productId: productId,
				variantId: variantId,
				stockLocationId: stockLocationId,
				stockCount: stockCount,
			},
		],
	};

	const stockResponse = await ikasGraphQLRequest.call(context, SaveStockLocationsMutation, {
		input: stockInput,
	});

	context.logger.info(JSON.stringify(stockResponse, null, 2), {
		message: 'Stock management response',
	});

	// Return stock information if successful
	if (stockResponse.data?.saveProductStockLocations === true) {
		return {
			stockUpdated: true,
			stockLocationUsed: {
				id: stockLocationId,
				name: stockLocation.name,
				stockCount: stockCount,
			},
		};
	}

	return null;
}

/**
 * Handles stock management after product update
 */
async function handleStockManagement(
	context: IExecuteFunctions,
	responseData: any,
	stockCount: number,
	stockLocationId: string,
	targetVariantId?: string,
): Promise<void> {
	if (stockCount <= 0 || !stockLocationId) return;

	try {
		const productId = responseData.id;
		// Use provided targetVariantId or fallback to first variant
		const variantId = targetVariantId || responseData.variants?.[0]?.id;

		context.logger.info(JSON.stringify(productId, null, 2), {
			message: 'Product ID is here',
		});
		context.logger.info(JSON.stringify(variantId, null, 2), {
			message: 'Variant ID is here',
		});

		if (productId && variantId) {
			const stockInfo = await updateProductStock(
				context,
				productId,
				variantId,
				stockCount,
				stockLocationId,
			);

			if (stockInfo) {
				Object.assign(responseData, stockInfo);
			}
		} else {
			context.logger.warn('Could not update stock: missing product ID or variant ID');
		}
	} catch (stockError) {
		context.logger.error(JSON.stringify(stockError, null, 2), {
			message: 'Stock error is here',
		});
		context.logger.error('Failed to update stock after product update', {
			error: stockError,
			productId: responseData.id,
			stockCount,
			stockLocationId,
		});
		// Don't throw - product was updated successfully, just stock failed
	}
}

/**
 * Processes and adds additional fields to the product update input
 * Only includes fields that are explicitly provided with meaningful values
 */
function processUpdateAdditionalFields(
	context: IExecuteFunctions,
	itemIndex: number,
	productInput: any,
): void {
	const additionalFields = context.getNodeParameter('additionalFields', itemIndex) as any;
	if (!additionalFields) return;

	Object.keys(additionalFields).forEach((key) => {
		const value = additionalFields[key];
		// Only include fields that have been explicitly set with meaningful values
		if (value !== undefined && value !== null && value !== '') {
			// Skip pricing/variant fields as they're handled separately
			if (
				key === 'buyPrice' ||
				key === 'discountPrice' ||
				key === 'sku' ||
				key === 'variantId' ||
				key === 'price' ||
				key === 'barcodeList'
			) {
				return;
			}
			// Handle array fields
			else if (key === 'hiddenSalesChannelIds') {
				if (Array.isArray(value) && value.length > 0) {
					productInput[key] = value;
				}
			}
			// Handle comma-separated string fields
			else if (key === 'dynamicPriceListIds') {
				productInput[key] = value;
			}
			// Handle JSON fields
			else if (
				key === 'attributes' ||
				key === 'baseUnit' ||
				key === 'translations' ||
				key === 'metaData'
			) {
				try {
					const parsedValue = JSON.parse(value);
					// Only include if the parsed JSON is not empty
					if (
						Array.isArray(parsedValue)
							? parsedValue.length > 0
							: Object.keys(parsedValue).length > 0
					) {
						productInput[key] = parsedValue;
					}
				} catch (error) {
					throw new NodeOperationError(
						context.getNode(),
						`Invalid JSON in ${key} field: ${(error as Error).message}`,
						{ itemIndex },
					);
				}
			}
			// Handle other product-level fields that moved to additional
			// Note: stockLocationId and stockCount are excluded as they're not part of ProductInput
			// and should be handled separately via stock management
			else if (
				key === 'description' ||
				key === 'shortDescription' ||
				key === 'weight' ||
				key === 'maxQuantityPerCart'
			) {
				// Only include if the value is meaningful
				if (typeof value === 'string' && value.trim()) {
					productInput[key] = value;
				} else if (typeof value === 'number' && value > 0) {
					productInput[key] = value;
				} else if (
					typeof value !== 'string' &&
					typeof value !== 'number' &&
					value !== null &&
					value !== undefined
				) {
					productInput[key] = value;
				}
			}
			// Skip stock-related fields as they need separate handling
			else if (key === 'stockLocationId' || key === 'stockCount') {
				// These will be handled by stock management after product update
				return;
			}
			// Skip image-related fields as they need separate handling via REST API
			else if (key === 'productImage') {
				// This will be handled by image upload after product update
				return;
			}
			// Handle regular string fields
			else {
				if (typeof value === 'string' && value.trim()) {
					productInput[key] = value;
				} else if (typeof value !== 'string' && value !== null && value !== undefined) {
					productInput[key] = value;
				}
			}
		}
	});
}

export async function updateProduct(this: IExecuteFunctions, itemIndex: number): Promise<any> {
	// Now handles both simple products and variable products with multiple variants

	const productId = this.getNodeParameter('productId', itemIndex) as string;

	// Fetch existing product data
	const existingProduct = await fetchExistingProduct(this, productId);

	// Build basic product update input
	const productInput = buildUpdateProductInput(this, itemIndex, existingProduct);

	// Create variant updates (handles both simple and variable products)
	const { updatedVariants, targetVariantId } = createVariantUpdates(
		this,
		itemIndex,
		existingProduct,
	);

	// Always include variants array as it's required by IKAS API
	productInput.variants = updatedVariants;

	// Clean up null values from variant prices for all variants
	updatedVariants.forEach((variantUpdate: any) => {
		cleanVariantPrices(variantUpdate);
	});

	// Process additional fields - only include non-empty values
	processUpdateAdditionalFields(this, itemIndex, productInput);

	// Log the final product input being sent to GraphQL
	this.logger.info(JSON.stringify(productInput, null, 2), {
		message: 'Final product input being sent to GraphQL mutation',
	});

	// Update the product
	const response = await ikasGraphQLRequest.call(this, SaveProductMutation, {
		input: productInput,
	});

	this.logger.info(JSON.stringify(response, null, 2), {
		message: 'Update product response is here',
	});

	let responseData = response.data?.saveProduct || {};

	// Handle additional operations after product update
	const additionalFields = this.getNodeParameter('additionalFields', itemIndex) as any;

	// Handle image upload first (if requested)
	await handleImageUpload(this, responseData, additionalFields);

	// Handle stock management
	const stockCount = additionalFields?.stockCount || 0;
	const stockLocationId = additionalFields?.stockLocationId || '';
	await handleStockManagement(this, responseData, stockCount, stockLocationId, targetVariantId);

	this.logger.info(JSON.stringify(responseData, null, 2), {
		message: 'Update response data is here',
	});

	return responseData;
}
