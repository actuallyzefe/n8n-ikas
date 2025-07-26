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
- **Search**: Search products with advanced filters and pagination
- **Create**: Create new products in your store
- **Update**: Update existing product information

### Orders

- **Get Many**: Retrieve orders from your IKAS store with filtering options

### Available GraphQL Operations

- **Queries**:
  - `GetProducts` - Fetch product data
  - `SearchProducts` - Advanced product search with filters
  - `GetOrders` - Retrieve order information
- **Mutations**:
  - `SaveProduct` - Create or update products

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

### Basic Product Operations

**Get Products**: Simply select "Product" as resource and "Get Many" as operation. The node will fetch products from your store.

**Search Products**: Use advanced filtering options to find specific products based on various criteria like name, category, price, etc.

**Create/Update Products**: Provide product data in the input to create new products or update existing ones.

### Working with Orders

Select "Order" as resource and "Get Many" as operation to retrieve order data. You can filter orders by date, status, and other criteria.

### GraphQL Integration

This node leverages IKAS's GraphQL API, providing efficient data fetching and manipulation. All operations are optimized for performance and follow GraphQL best practices.

### Tips

- Use the search functionality for better performance when working with large product catalogs
- The node handles pagination automatically for large result sets
- Session tokens are managed automatically - no need for manual token refresh

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
