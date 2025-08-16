// Base properties
export { resourceProperty } from './base.properties';

// Product properties
export {
	productOperationProperty,
	productSearchProperties,
	productCreateUpdateProperties,
	productAdditionalFieldsProperty,
	productDeleteProperties,
} from './product';

// Order properties
export {
	orderOperationProperty,
	orderFiltersProperty,
	orderFulfillProperties,
	orderPackageStatusProperties,
	orderDeleteProperties,
} from './order';

// Property builder utilities
export { buildNodeProperties, buildNodePropertiesGrouped } from './properties.builder';
