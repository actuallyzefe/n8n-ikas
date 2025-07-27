import type { INodeProperties } from 'n8n-workflow';
import {
	resourceProperty,
	productOperationProperty,
	productSearchProperties,
	productCreateUpdateProperties,
	productAdditionalFieldsProperty,
	orderOperationProperty,
	orderFiltersProperty,
	orderFulfillProperties,
	orderPackageStatusProperties,
} from './index';

/**
 * Builds the complete properties array for the IKAS node
 * @returns Array of node properties organized by resource and operation
 */
export function buildNodeProperties(): INodeProperties[] {
	return [
		// Base resource selection
		resourceProperty,

		// Operations
		productOperationProperty,
		orderOperationProperty,

		// Order-specific properties
		orderFiltersProperty,
		...orderFulfillProperties,
		...orderPackageStatusProperties,

		// Product-specific properties
		...productSearchProperties,
		...productCreateUpdateProperties,
		productAdditionalFieldsProperty,
	];
}

/**
 * Alternative builder with more explicit organization
 * Groups properties by resource type for better readability
 */
export function buildNodePropertiesGrouped(): INodeProperties[] {
	const baseProperties: INodeProperties[] = [resourceProperty];

	const operationProperties: INodeProperties[] = [productOperationProperty, orderOperationProperty];

	const orderProperties: INodeProperties[] = [
		orderFiltersProperty,
		...orderFulfillProperties,
		...orderPackageStatusProperties,
	];

	const productProperties: INodeProperties[] = [
		...productSearchProperties,
		...productCreateUpdateProperties,
		productAdditionalFieldsProperty,
	];

	return [...baseProperties, ...operationProperties, ...orderProperties, ...productProperties];
}
