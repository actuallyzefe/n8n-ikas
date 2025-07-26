# n8n-nodes-ikas

![IKAS Logo](https://ikas.com/assets/logo.svg)

This is an n8n community node that integrates with the [IKAS](https://ikas.com) e-commerce platform. It allows you to automate workflows with IKAS stores by managing products through the [IKAS Admin API](https://ikas.dev/docs/api/admin-api).

[n8n](https://n8n.io/) is a [fair-code licensed](https://docs.n8n.io/reference/license/) workflow automation platform.

## 📋 Table of Contents

- [Installation](#-installation)
- [Features](#-features)
- [Authentication](#-authentication)
- [Operations](#-operations)
- [Requirements](#-requirements)
- [Usage Examples](#-usage-examples)
- [Development](#-development)
- [Contributing](#-contributing)
- [License](#-license)
- [Resources](#-resources)

## 🚀 Installation

### Via n8n Community Nodes

1. Go to **Settings > Community Nodes** in your n8n instance
2. Select **Install**
3. Enter `n8n-nodes-ikas` in **Enter npm package name**
4. Agree to the [risks](https://docs.n8n.io/integrations/community-nodes/risks/) of using community nodes
5. Select **Install**

### Manual Installation

```bash
npm install n8n-nodes-ikas
```

After installing the node, you can use it like any other node. n8n displays the node in search results in the **Nodes** panel.

## ✨ Features

### Current Features

- **Product Management**: Create, update, search, and retrieve products
- **GraphQL Integration**: Full GraphQL API support for IKAS platform
- **OAuth2 Authentication**: Secure OAuth2 authentication with automatic token management
- **Advanced Search**: Filter products by ID, SKU, barcode, and text search
- **Simple Products**: Complete support for simple product creation and management
- **Flexible Pricing**: Support for sell price, buy price, and discount pricing
- **Product Types**: Support for Physical, Digital, Bundle, and Membership products

### Upcoming Features

- **Variable Products**: Multi-variant product support (under development)
- **Order Management**: Create, and update orders
- **Customer Management**: Customer CRUD operations
- **Category Management**: Product category operations
- **Inventory Management**: Stock level tracking and updates

## 🔐 Authentication

The node uses OAuth2 authentication with automatic token management.

### OAuth2 Configuration

Configure your credentials with:

- **Store Name**: Your IKAS store name (without .myikas.com)
- **Client ID**: Client ID from your IKAS Private App
- **Client Secret**: Client Secret from your IKAS Private App

### Getting Your Credentials

1. Log in to your IKAS store admin panel
2. Navigate to the developer/API section
3. Create a new Private App
4. Note your store domain, Client ID, and Client Secret
5. The node will automatically handle token generation and refresh

For detailed authentication setup, see the [IKAS API Authentication Guide](https://ikas.dev/docs/api/getting-started/authentication).

## 🔧 Operations

### Product Operations

#### **Get Many**

- **Description**: Retrieve multiple products from your store
- **Use Case**: Bulk product data export, inventory analysis
- **Returns**: Array of product objects with full details

#### **Search**

- **Description**: Search products with advanced filters
- **Parameters**:
  - Search Query (text search across name, description)
  - Product IDs (comma-separated list)
  - SKU List (comma-separated list)
  - Barcode List (comma-separated list)
  - Pagination (limit, page, or return all)
- **Use Case**: Find specific products, inventory lookup, data synchronization

#### **Create**

- **Description**: Create a new product in your store
- **Required Fields**:
  - Product Name
  - Product Type (Physical, Digital, Bundle, Membership)
- **Optional Fields**:
  - Description, Short Description
  - Weight, Max Quantity Per Cart
  - Brand ID, Category IDs, Tag IDs
  - Sales Channel IDs
  - SKU, Pricing (Sell Price, Buy Price, Discount Price)
- **Product Structure**: Currently supports Simple Products only

#### **Update**

- **Description**: Update an existing product
- **Required Fields**:
  - Product ID (for identification)
  - Product Name
  - Product Type
- **Note**: Same optional fields as Create operation

## 📋 Requirements

### System Requirements

- **Node.js**: >= 22.16
- **n8n**: >= 1.0.0
- **IKAS Store**: Active IKAS e-commerce store with API access

### API Requirements

- **IKAS Private App**: Required for API access
- **API Permissions**: Ensure your app has product management permissions
- **GraphQL Endpoint**: Uses `https://api.myikas.com/api/v1/admin/graphql`

## 📖 Usage Examples

### Basic Product Creation

```json
{
	"Resource": "Product",
	"Operation": "Create",
	"Product Name": "Premium Coffee Beans",
	"Product Type": "PHYSICAL",
	"Description": "High-quality arabica coffee beans",
	"Price": 29.99,
	"Buy Price": 15.0,
	"SKU": "COFFEE-001"
}
```

### Advanced Product Search

```json
{
	"Resource": "Product",
	"Operation": "Search",
	"Search Query": "coffee",
	"SKU List": "COFFEE-001,COFFEE-002",
	"Return All": false,
	"Limit": 50,
	"Page": 1
}
```

### Workflow Example: Daily Inventory Sync

1. **Schedule Trigger**: Run daily at 6 AM
2. **IKAS Node**: Search products with low stock
3. **Filter Node**: Filter products below threshold
4. **IKAS Node**: Update product information
5. **Email Node**: Send inventory report

### Project Structure

```
n8n-nodes-ikas/
├── credentials/
│   └── IkasApi.credentials.ts          # OAuth2 authentication
├── nodes/
│   └── Ikas/
│       ├── Ikas.node.ts                # Main node implementation
│       ├── GenericFunctions.ts         # Helper functions
│       ├── graphql/
│       │   ├── queries/
│       │   │   ├── GetProducts.ts      # Get products query
│       │   │   └── SearchProducts.ts   # Search products query
│       │   └── mutations/
│       │       └── SaveProduct.ts      # Create/update product mutation
│       └── ikas-icon.svg               # Node icon
├── package.json                        # Project configuration
└── tsconfig.json                       # TypeScript configuration
```

### GraphQL Schema

The node uses GraphQL for all API interactions. Key schemas:

- **ProductInput**: Input schema for creating/updating products
- **SearchProductsInput**: Input schema for product search
- **Product**: Output schema for product data

See the [IKAS API Type Definitions](https://ikas.dev/docs/api/type-definitions/admin-api/inputs/product-input) for complete schema documentation.

## 🤝 Contributing

We welcome contributions! Here's how you can help:

### Prerequisites

- Installed n8n instance
- Node.js >= 22.16

### Reporting Issues

Please use GitHub Issues to report bugs or request features:

1. Check existing issues first
2. Provide detailed reproduction steps
3. Include n8n version, node version, and error messages
4. Add relevant workflow examples

## 📄 License

[MIT License](LICENSE.md) - see the LICENSE.md file for details.

## 📚 Resources

### Documentation

- [IKAS API Documentation](https://ikas.dev/docs/api/admin-api)
- [IKAS Authentication Guide](https://ikas.dev/docs/api/getting-started/authentication)
- [n8n Community Nodes Documentation](https://docs.n8n.io/integrations/community-nodes/)
- [n8n Node Development Guide](https://docs.n8n.io/integrations/creating-nodes/)

### Links

- [IKAS Website](https://ikas.com/)
- [IKAS Developer Portal](https://ikas.dev/)
- [n8n Website](https://n8n.io/)
- [GitHub Repository](https://github.com/efekarakanli/n8n-nodes-ikas)

### Community

- [n8n Community Forum](https://community.n8n.io/)

---

**Made with ❤️ for the n8n and IKAS communities**

_For questions or support, please open an issue on GitHub or reach out through the n8n community forum._
