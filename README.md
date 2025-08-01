# n8n-nodes-ikas

This is an n8n community node. It lets you use IKAS e-commerce platform in your n8n workflows.

IKAS is a comprehensive e-commerce platform that provides merchants with tools to create, manage, and grow their online stores. This node enables seamless integration with IKAS's GraphQL API for automating e-commerce operations.

[n8n](https://n8n.io/) is a [fair-code licensed](https://docs.n8n.io/reference/license/) workflow automation platform.

[Installation](#installation)  
[Operations](#operations)  
[Credentials](#credentials)  
[Compatibility](#compatibility)  
[Usage](#usage)  
[Resources](#resources)  
[Version history](#version-history)

## Installation

Follow the [installation guide](https://docs.n8n.io/integrations/community-nodes/installation/) in the n8n community nodes documentation.

Use the package name: `n8n-nodes-ikas`

## Operations

This node supports the following operations:

### Products

- **Get Many**: Retrieve multiple products from your IKAS store
- **Search**: Search products with advanced filters and pagination including:
  - Search by name, description, or other text fields
  - Filter by product IDs, SKUs, or barcodes
  - Pagination support with customizable page size
- **Create**: Create new products in your store with:
  - Simple product structure support
  - Automatic variant creation
  - Stock location assignment
  - Pricing configuration (sell price, buy price, discount price)
- **Update**: Update existing product information including all product fields

### Orders

- **Get Many**: Retrieve orders from your IKAS store with advanced filtering:
  - Filter by customer email or customer ID
  - Filter by order number or sales channel
  - Filter by order status (Created, Confirmed, Fulfilled, etc.)
  - Filter by payment status (Paid, Pending, Refunded, etc.)
  - Filter by package status (Preparing, Shipped, Delivered, etc.)
- **Fulfill**: Fulfill order line items with:
  - Multiple line item fulfillment
  - Quantity specification per line item
  - Optional marking as ready for shipment
  - Customer notification settings
  - Tracking information (tracking number, cargo company, barcode, etc.)
- **Update Package Status**: Update order package statuses with:
  - Multiple package status updates in one operation
  - Comprehensive status options (Fulfilled, Shipped, Delivered, Cancelled, etc.)
  - Tracking information updates
  - Error message handling

### Stock Management

- **Stock Location Retrieval**: Get stock locations by name or filters
- **Stock Assignment**: Automatically assign stock to locations during product creation

### Available GraphQL Operations

- **Queries**:
  - `GetProducts` - Fetch product data with full product information
  - `SearchProducts` - Advanced product search with filters and pagination
  - `GetOrders` - Retrieve order information with comprehensive filtering
- **Mutations**:

  - `SaveProduct` - Create or update products with full product structure
  - `FulfillOrder` - Fulfill order line items with tracking
  - `UpdateOrderPackageStatus` - Update package statuses with tracking info

## Credentials

To use this node, you need to authenticate with IKAS using OAuth2 credentials. Here's how to set it up:

### Prerequisites

1. You must have an IKAS store
2. Create a Private App in your IKAS admin panel to get API credentials

### Authentication Setup

1. In your IKAS admin panel, navigate to Apps & Integrations
2. Create a new Private App
3. Note down your:
   - **Store Name** (your store subdomain without .myikas.com)
   - **Client ID**
   - **Client Secret**

### Credential Configuration

When setting up the IKAS API credentials in n8n:

- **Store Name**: Your IKAS store name (e.g., "mystore" for mystore.myikas.com)
- **Client ID**: The Client ID from your Private App
- **Client Secret**: The Client Secret from your Private App

The node will automatically handle OAuth2 authentication and session token management.

## Compatibility

- **Minimum n8n version**: 1.0.0
- **Node version**: 1.0
- **Tested with**: n8n 1.x
- **Node.js**: >=22.16

This node uses the IKAS GraphQL API v1 and should be compatible with all current IKAS store configurations.

## Usage

### Product Operations

**Get Products**: Select "Product" as resource and "Get Many" as operation to fetch all products from your store with complete product information.

**Search Products**: Use advanced filtering to find specific products:

- Search by text query across product names and descriptions
- Filter by specific product IDs, SKUs, or barcodes (comma-separated lists)
- Use pagination controls to manage large result sets
- Return all results or limit to specific page sizes

**Create Products**: Create new products with comprehensive configuration:

- Set product name, type (Physical, Digital, Bundle, Membership), and structure
- Configure pricing (sell price, buy price, discount price)
- Add descriptions, weight, and quantity limits
- Assign to sales channels
- Set initial stock counts and assign to stock locations
- Add additional attributes, translations, and metadata

**Update Products**: Modify existing products using the same configuration options as creation, plus the ability to update all product fields.

### Order Management

**Get Orders**: Retrieve orders with powerful filtering capabilities:

- Filter by customer information (email, customer ID)
- Filter by order details (order number, sales channel)
- Filter by order status (Created, Confirmed, Fulfilled, Cancelled, etc.)
- Filter by payment status (Paid, Pending, Refunded, Partially Paid, etc.)
- Filter by package status (Preparing, Shipped, Delivered, Returned, etc.)

**Fulfill Orders**: Process order fulfillment with detailed control:

- Fulfill specific line items with custom quantities
- Add tracking information (tracking number, cargo company, barcode)
- Configure shipment notifications to customers
- Mark orders as ready for shipment
- Link to source packages for inventory tracking

**Update Package Status**: Manage package lifecycle with comprehensive status updates:

- Update multiple packages in a single operation
- Set detailed package statuses (Fulfilled, Ready for Shipment, Shipped, Delivered, Cancelled, Error, etc.)
- Add or update tracking information per package
- Handle error states with custom error messages
- Include source IDs for external system integration

## Resources

- [n8n community nodes documentation](https://docs.n8n.io/integrations/#community-nodes)
- [IKAS API Documentation](https://ikas.dev/docs/intro)
- [IKAS Authentication Guide](https://ikas.dev/docs/api/getting-started/authentication)
- [IKAS Developer Portal](https://ikas.dev/)

## Version history

### 0.1.0

- Initial release
- Support for Product operations (Get Many, Search, Create, Update)
- Support for Order operations (Get Many)
- OAuth2 authentication with automatic session management
- GraphQL API integration
- Full TypeScript support
