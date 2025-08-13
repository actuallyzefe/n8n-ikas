// Base properties
export { resourceProperty } from './base.properties';

// Customer properties
export {
	customerOperationProperty,
	customerCreateUpdateProperties,
	customerFiltersProperty,
} from './customer';

// Product properties
export {
	productOperationProperty,
	productSearchProperties,
	productCreateUpdateProperties,
	productAdditionalFieldsProperty,
} from './product';

// Order properties
export {
	orderOperationProperty,
	orderFiltersProperty,
	orderFulfillProperties,
	orderPackageStatusProperties,
} from './order';

// Property builder utilities
export { buildNodeProperties, buildNodePropertiesGrouped } from './properties.builder';
