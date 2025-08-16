import type { IExecuteFunctions } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';

import { ikasGraphQLRequest } from '../../GenericFunctions';
import { SaveProductMutation } from '../../graphql/mutations/SaveProduct';
import { SaveStockLocationsMutation } from '../../graphql/mutations/SaveStockLocations';
import { GetProductByIdQuery } from '../../graphql/queries/GetProductById';
import { GetStockLocationsQuery } from '../../graphql/queries/GetStockLocations';
import { handleImageUpload } from './helpers/upload-image.helpers';

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

	return productInput;
}

/**
 * Creates variant update object for product update
 */
function createVariantUpdate(
	context: IExecuteFunctions,
	itemIndex: number,
	existingProduct: any,
): any {
	const additionalFields = context.getNodeParameter('additionalFields', itemIndex) as any;
	const price = additionalFields?.price || null;
	const buyPrice = additionalFields?.buyPrice || null;
	const discountPrice = additionalFields?.discountPrice || null;
	const sku = additionalFields?.sku || '';
	const variantId = additionalFields?.variantId || '';

	// Create variant update object - always required by IKAS API
	const variantUpdate: any = {
		isActive: true,
	};

	// Add variant ID if provided (for updating existing variants)
	if (variantId && variantId.trim()) {
		variantUpdate.id = variantId;
	} else {
		variantUpdate.id = existingProduct.variants[0].id;
	}

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
		variantUpdate.prices = existingProduct.variants[0].prices;
	}

	context.logger.info(JSON.stringify(variantUpdate, null, 2), {
		message: 'Variant update is here',
	});

	// Add SKU if provided
	if (sku && sku.trim()) {
		variantUpdate.sku = sku;
	}

	return variantUpdate;
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
): Promise<void> {
	if (stockCount <= 0 || !stockLocationId) return;

	try {
		const productId = responseData.id;
		const variantId = responseData.variants?.[0]?.id;

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
		if (value !== undefined && value !== null && value !== '') {
			// Skip pricing/variant fields as they're handled separately
			if (
				key === 'buyPrice' ||
				key === 'discountPrice' ||
				key === 'sku' ||
				key === 'variantId' ||
				key === 'price'
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
				if (typeof value === 'string' && value.trim()) {
					productInput[key] = value;
				} else if (typeof value !== 'string' && value !== null) {
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
				} else if (typeof value !== 'string') {
					productInput[key] = value;
				}
			}
		}
	});
}

export async function updateProduct(this: IExecuteFunctions, itemIndex: number): Promise<any> {
	// TODO: This only handles simple products not varianted products.

	const productId = this.getNodeParameter('productId', itemIndex) as string;

	// Fetch existing product data
	const existingProduct = await fetchExistingProduct(this, productId);

	// Build basic product update input
	const productInput = buildUpdateProductInput(this, itemIndex, existingProduct);

	// Create variant update
	const variantUpdate = createVariantUpdate(this, itemIndex, existingProduct);

	// Always include variants array as it's required by IKAS API
	productInput.variants = [variantUpdate];

	// Clean up null values from variant prices
	cleanVariantPrices(variantUpdate);

	// Process additional fields - only include non-empty values
	processUpdateAdditionalFields(this, itemIndex, productInput);

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
	await handleStockManagement(this, responseData, stockCount, stockLocationId);

	this.logger.info(JSON.stringify(responseData, null, 2), {
		message: 'Update response data is here',
	});

	return responseData;
}
