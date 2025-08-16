import type { IExecuteFunctions } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';

import { ikasGraphQLRequest } from '../../GenericFunctions';
import { SaveProductMutation } from '../../graphql/mutations/SaveProduct';
import { SaveStockLocationsMutation } from '../../graphql/mutations/SaveStockLocations';
import { GetStockLocationsQuery } from '../../graphql/queries/GetStockLocations';
import { handleImageUpload } from './helpers/upload-image.helpers';

/**
 * Builds the basic product input object with required fields only
 */
function buildBasicProductInput(context: IExecuteFunctions, itemIndex: number): any {
	const productInput: any = {
		name: context.getNodeParameter('productName', itemIndex) as string,
		type: context.getNodeParameter('productType', itemIndex) as string,
	};

	// Add required sales channels
	const salesChannelIds = context.getNodeParameter('salesChannelIds', itemIndex) as string[];
	if (salesChannelIds && salesChannelIds.length > 0) {
		productInput.salesChannelIds = salesChannelIds;
	}

	return productInput;
}

/**
 * Creates a default variant for simple products
 */
function createDefaultVariant(context: IExecuteFunctions, itemIndex: number): any {
	const price = context.getNodeParameter('price', itemIndex) as number;
	const additionalFields = context.getNodeParameter('additionalFields', itemIndex) as any;

	const buyPrice = additionalFields?.buyPrice || 0;
	const discountPrice = additionalFields?.discountPrice || null;
	const sku = additionalFields?.sku || '';

	const defaultVariant: any = {
		isActive: true,
		prices: [
			{
				sellPrice: price || 0,
				buyPrice: buyPrice,
				discountPrice: discountPrice,
			},
		],
	};

	// Add SKU if provided
	if (sku) {
		defaultVariant.sku = sku;
	}

	return defaultVariant;
}

/**
 * Processes and adds additional fields to the product input
 */
function processAdditionalFields(
	context: IExecuteFunctions,
	itemIndex: number,
	productInput: any,
): void {
	const additionalFields = context.getNodeParameter('additionalFields', itemIndex) as any;
	if (!additionalFields) return;

	Object.keys(additionalFields).forEach((key) => {
		const value = additionalFields[key];
		if (value !== undefined && value !== '') {
			// Skip pricing fields as they're handled separately in variant creation
			if (key === 'buyPrice' || key === 'discountPrice' || key === 'sku') {
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
					productInput[key] = JSON.parse(value);
				} catch (error) {
					throw new NodeOperationError(
						context.getNode(),
						`Invalid JSON in ${key} field: ${(error as Error).message}`,
						{ itemIndex },
					);
				}
			}
			// Handle other product-level fields
			// Note: stockLocationId and stockCount are excluded as they're not part of ProductInput
			// and should be handled separately via stock management
			else if (
				key === 'description' ||
				key === 'shortDescription' ||
				key === 'weight' ||
				key === 'maxQuantityPerCart'
			) {
				if (value !== null && value !== '') {
					productInput[key] = value;
				}
			}
			// Skip stock-related fields as they need separate handling
			else if (key === 'stockLocationId' || key === 'stockCount') {
				// These will be handled by stock management after product creation
				return;
			}
			// Skip image-related fields as they need separate handling via REST API
			else if (key === 'productImage') {
				// This will be handled by image upload after product creation
				return;
			}
			// Handle regular string fields
			else {
				productInput[key] = value;
			}
		}
	});
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
 * Creates stock for a product after creation
 */
async function createProductStock(
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
			stockCreated: true,
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
 * Handles stock management after product creation
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
			const stockInfo = await createProductStock(
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
			context.logger.warn('Could not create stock: missing product ID or variant ID');
		}
	} catch (stockError) {
		context.logger.error(JSON.stringify(stockError, null, 2), {
			message: 'Stock error is here',
		});
		context.logger.error('Failed to create stock after product creation', {
			error: stockError,
			productId: responseData.id,
			stockCount,
			stockLocationId,
		});
		// Don't throw - product was created successfully, just stock failed
	}
}

export async function createProduct(this: IExecuteFunctions, itemIndex: number): Promise<any> {
	// TODO: This only handles simple products not varianted products.

	// Build basic product input
	const productInput = buildBasicProductInput(this, itemIndex);

	// Create default variant
	const defaultVariant = createDefaultVariant(this, itemIndex);
	productInput.variants = [defaultVariant];

	// Process additional fields
	processAdditionalFields(this, itemIndex, productInput);

	// Create the product
	const response = await ikasGraphQLRequest.call(this, SaveProductMutation, {
		input: productInput,
	});

	this.logger.info(JSON.stringify(response, null, 2), {
		message: 'Response is here',
	});

	const responseData = response.data?.saveProduct || {};

	// Handle additional operations after product creation
	const additionalFields = this.getNodeParameter('additionalFields', itemIndex) as any;

	// Handle image upload first (if requested)
	await handleImageUpload(this, responseData, additionalFields);

	// Handle stock management
	const stockCount = additionalFields?.stockCount || 0;
	const stockLocationId = additionalFields?.stockLocationId || '';
	await handleStockManagement(this, responseData, stockCount, stockLocationId);

	this.logger.info(JSON.stringify(responseData, null, 2), {
		message: 'Response data is here',
	});

	return responseData;
}
