// Base properties
export { resourceProperty } from './base.properties';

// Product properties
export {
	productAdditionalFieldsProperty,
	productCreateUpdateProperties,
	productDeleteProperties,
	productOperationProperty,
	productSearchProperties,
} from './product';

// Order properties
export {
	orderFiltersProperty,
	orderFulfillProperties,
	orderOperationProperty,
	orderPackageStatusProperties,
} from './order';

// Property builder utilities
export { buildNodeProperties, buildNodePropertiesGrouped } from './properties.builder';
