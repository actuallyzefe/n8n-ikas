import type { INodeProperties } from 'n8n-workflow';
import {
	resourceProperty,
	customerOperationProperty,
	customerCreateUpdateProperties,
	customerFiltersProperty,
	customerSearchProperties,
	orderFiltersProperty,
	orderFulfillProperties,
	orderOperationProperty,
	orderPackageStatusProperties,
	productAdditionalFieldsProperty,
	productCreateUpdateProperties,
	productDeleteProperties,
	productOperationProperty,
	productSearchProperties,
	productUploadImageProperties,
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
		...productDeleteProperties,
		...productUploadImageProperties,
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
		...customerSearchProperties,
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
		...productDeleteProperties,
		...productUploadImageProperties,
	];
	
	return [
		...baseProperties,
		...operationProperties,
		...customerProperties,
		...orderProperties,
		...productProperties,
	];
}