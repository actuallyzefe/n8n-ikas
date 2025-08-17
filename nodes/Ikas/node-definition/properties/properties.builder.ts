import type { INodeProperties } from 'n8n-workflow';
import {
	resourceProperty,
	customerOperationProperty,
	customerCreateUpdateProperties,
	customerFiltersProperty,
	customerSearchProperties,
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
		customerOperationProperty,
		productOperationProperty,
		orderOperationProperty,

		// Customer-specific properties
		...customerCreateUpdateProperties,
		customerFiltersProperty,
		...customerSearchProperties,

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

	const operationProperties: INodeProperties[] = [
		customerOperationProperty,
		productOperationProperty,
		orderOperationProperty,
	];

	const customerProperties: INodeProperties[] = [
		...customerCreateUpdateProperties,
		customerFiltersProperty,
	];

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

	return [
		...baseProperties,
		...operationProperties,
		...customerProperties,
		...orderProperties,
		...productProperties,
	];
}
