import type { IExecuteFunctions } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';

import { ikasGraphQLRequest } from '../../GenericFunctions';
import { SaveProductMutation } from '../../graphql/mutations/SaveProduct';
import { GetStockLocationsQuery } from '../../graphql/queries/GetStockLocations';
import { SaveStockLocationsMutation } from '../../graphql/mutations/SaveStockLocations';

/**
 * Builds the basic product input object with required and optional fields
 */
function buildBasicProductInput(context: IExecuteFunctions, itemIndex: number): any {
	const productInput: any = {
		name: context.getNodeParameter('productName', itemIndex) as string,
		type: context.getNodeParameter('productType', itemIndex) as string,
	};

	// Add optional fields
	const description = context.getNodeParameter('description', itemIndex) as string;
	if (description) {
		productInput.description = description;
	}

	const shortDescription = context.getNodeParameter('shortDescription', itemIndex) as string;
	if (shortDescription) {
		productInput.shortDescription = shortDescription;
	}

	const weight = context.getNodeParameter('weight', itemIndex) as number;
	if (weight) {
		productInput.weight = weight;
	}

	const maxQuantityPerCart = context.getNodeParameter('maxQuantityPerCart', itemIndex) as number;
	if (maxQuantityPerCart) {
		productInput.maxQuantityPerCart = maxQuantityPerCart;
	}

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
	const buyPrice = context.getNodeParameter('buyPrice', itemIndex) as number;
	const discountPrice = context.getNodeParameter('discountPrice', itemIndex) as number;
	const sku = context.getNodeParameter('sku', itemIndex) as string;

	const defaultVariant: any = {
		isActive: true,
		prices: [
			{
				sellPrice: price || 0,
				buyPrice: buyPrice || 0,
				discountPrice: discountPrice || null,
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
			// Handle array fields that used to be comma-separated strings
			if (key === 'hiddenSalesChannelIds') {
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

	let responseData = response.data?.saveProduct || {};

	// Handle stock management after product creation
	const stockCount = this.getNodeParameter('stockCount', itemIndex) as number;
	const stockLocationId = this.getNodeParameter('stockLocationId', itemIndex) as string;

	await handleStockManagement(this, responseData, stockCount, stockLocationId);

	this.logger.info(JSON.stringify(responseData, null, 2), {
		message: 'Response data is here',
	});

	return responseData;
}
