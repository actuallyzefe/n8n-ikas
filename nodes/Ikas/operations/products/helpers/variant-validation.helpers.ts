/**
 * Helper functions for variant validation in product operations
 */

export interface VariantSpecificFields {
	price?: number | null;
	buyPrice?: number | null;
	discountPrice?: number | null;
	sku?: string;
	barcodeList?: string;
	stockCount?: number;
	productImage?: {
		imageTarget?: string;
		[key: string]: any;
	};
}

/**
 * Checks if any variant-specific updates are being made
 */
export function hasVariantSpecificUpdates(fields: VariantSpecificFields): boolean {
	// Pricing updates
	const hasPricingUpdates = Boolean(
		fields.price !== null || fields.buyPrice !== null || fields.discountPrice !== null,
	);

	// Identification updates
	const hasIdentificationUpdates = Boolean(
		(fields.sku && fields.sku.trim()) || (fields.barcodeList && fields.barcodeList.trim()),
	);

	// Stock updates
	const hasStockUpdates = Boolean(
		fields.stockCount !== undefined && fields.stockCount !== null && fields.stockCount >= 0,
	);

	// Image updates (variant-specific)
	const hasVariantImageUpdates = Boolean(
		fields.productImage &&
			Object.keys(fields.productImage).length > 0 &&
			fields.productImage.imageTarget === 'variant',
	);

	return hasPricingUpdates || hasIdentificationUpdates || hasStockUpdates || hasVariantImageUpdates;
}

/**
 * Gets list of variant-specific fields being updated (for error messages)
 */
export function getVariantSpecificFieldsList(fields: VariantSpecificFields): string[] {
	const variantFields: string[] = [];

	// Check pricing fields
	if (fields.price !== null || fields.buyPrice !== null || fields.discountPrice !== null) {
		variantFields.push('pricing');
	}

	// Check identification fields
	if (fields.sku && fields.sku.trim()) {
		variantFields.push('SKU');
	}

	if (fields.barcodeList && fields.barcodeList.trim()) {
		variantFields.push('barcode');
	}

	// Check stock fields
	if (fields.stockCount !== undefined && fields.stockCount !== null && fields.stockCount >= 0) {
		variantFields.push('stock');
	}

	// Check image fields
	if (fields.productImage && fields.productImage.imageTarget === 'variant') {
		variantFields.push('variant-specific image');
	}

	return variantFields;
}

/**
 * Validates variant ID requirement for variable products
 */
export function validateVariantIdRequirement(
	isVariableProduct: boolean,
	variantId: string,
	fields: VariantSpecificFields,
	existingVariants: any[],
): void {
	// Only check for variable products with variant-specific updates
	if (!isVariableProduct || !hasVariantSpecificUpdates(fields)) {
		return;
	}

	// Check if variantId is provided (either directly or via targetVariantId)
	if (variantId && variantId.trim()) {
		return;
	}

	// Build error message
	const availableVariants = existingVariants
		.map((v: any, index: number) => `${index + 1}. ID: ${v.id} (SKU: ${v.sku || 'N/A'})`)
		.join('\n');

	const variantFields = getVariantSpecificFieldsList(fields);

	throw new Error(
		`This is a VARIABLE PRODUCT with ${existingVariants.length} variants. You are updating variant-specific fields (${variantFields.join(', ')}), so you MUST specify which variant to update.\n\n` +
			`Available variants:\n${availableVariants}\n\n` +
			`Options to specify variant:\n` +
			`1. Add "variantId" to Additional Fields for pricing/SKU/barcode/stock updates\n` +
			`2. Set "Target Variant ID" in Product Image section for variant-specific images\n\n` +
			`Note: Product-level updates (name, description, etc.) don't require variant specification.`,
	);
}
