import type { IExecuteFunctions } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';

import { ikasGraphQLRequest } from '../../GenericFunctions';
import { SaveProductMutation } from '../../graphql/mutations/SaveProduct';
import { GetProductByIdQuery } from '../../graphql/queries/GetProductById';

/**
 * Fetches existing product data by ID
 */
async function fetchExistingProduct(context: IExecuteFunctions, productId: string): Promise<any> {
	const productToUpdate = await ikasGraphQLRequest.call(context, GetProductByIdQuery, {
		id: {
			eq: productId,
		},
	});

	const product = productToUpdate.data?.listProduct.data[0] || {};

	context.logger.info(JSON.stringify(product, null, 2), {
		message: 'Product is here',
	});

	return product;
}

/**
 * Builds the basic product update input
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

	// Add optional fields only if they are provided (not empty/default values)
	const description = context.getNodeParameter('description', itemIndex) as string;
	if (description && description.trim()) {
		productInput.description = description;
	}

	const shortDescription = context.getNodeParameter('shortDescription', itemIndex) as string;
	if (shortDescription && shortDescription.trim()) {
		productInput.shortDescription = shortDescription;
	}

	const weight = context.getNodeParameter('weight', itemIndex) as number;
	if (weight !== null) {
		productInput.weight = weight;
	}

	const maxQuantityPerCart = context.getNodeParameter('maxQuantityPerCart', itemIndex) as number;
	if (maxQuantityPerCart && maxQuantityPerCart > 0) {
		productInput.maxQuantityPerCart = maxQuantityPerCart;
	}

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
	const price = context.getNodeParameter('price', itemIndex) as number;
	const buyPrice = context.getNodeParameter('buyPrice', itemIndex) as number;
	const discountPrice = context.getNodeParameter('discountPrice', itemIndex) as number;
	const sku = context.getNodeParameter('sku', itemIndex) as string;
	const variantId = context.getNodeParameter('variantId', itemIndex) as string;

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

		if (price !== null) {
			priceData.sellPrice = price;
		}
		if (buyPrice !== null) {
			priceData.buyPrice = buyPrice;
		}
		if (discountPrice !== null) {
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

	const responseData = response.data?.saveProduct || {};

	this.logger.info(JSON.stringify(responseData, null, 2), {
		message: 'Update response data is here',
	});

	return responseData;
}
