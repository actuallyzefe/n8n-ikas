// Base properties
export { createPaginationProperties, resourceProperty } from './base.properties';

// Product properties
export {
	productAdditionalFieldsProperty,
	productCreateUpdateProperties,
	productDeleteProperties,
	productOperationProperty,
	productSearchProperties,
	productUploadImageProperties,
} from './product';

// Order properties
export {
	orderFiltersProperty,
	orderFulfillProperties,
	orderOperationProperty,
	orderPackageStatusProperties,
} from './order';

// Webhook properties
export {
	webhookCreateProperties,
	webhookDeleteProperties,
	webhookOperationProperty,
} from './webhook';

// Property builder utilities
export { buildNodeProperties, buildNodePropertiesGrouped } from './properties.builder';
