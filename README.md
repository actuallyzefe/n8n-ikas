# n8n-nodes-ikas

<div align="center">
  <img src="https://raw.githubusercontent.com/n8n-io/n8n/master/assets/n8n-logo.png" alt="n8n" width="120" height="120">
  <span style="font-size: 50px; margin: 0 20px;">+</span>
  <img src="https://ikas.com/favicon.ico" alt="IKAS" width="120" height="120">
</div>

<div align="center">
  
![n8n.io - IKAS](https://img.shields.io/badge/n8n.io-IKAS-blue.svg)
![Version](https://img.shields.io/npm/v/n8n-nodes-ikas.svg)
![Downloads](https://img.shields.io/npm/dt/n8n-nodes-ikas.svg)
![License](https://img.shields.io/npm/l/n8n-nodes-ikas.svg)

</div>

This is an n8n community node that lets you integrate the [IKAS e-commerce platform](https://ikas.com) into your n8n workflows. Automate your e-commerce operations with comprehensive product management, order processing, and inventory control.

## What is IKAS?

IKAS is a comprehensive e-commerce platform that provides merchants with tools to create, manage, and grow their online stores. This node enables seamless integration with IKAS's GraphQL API for automating e-commerce operations including:

- Product catalog management
- Order processing and fulfillment
- Inventory and stock management
- Customer data handling
- Sales analytics and reporting

[n8n](https://n8n.io/) is a [fair-code licensed](https://docs.n8n.io/reference/license/) workflow automation platform.

## Table of Contents

- [Installation](#installation)
- [Credentials](#credentials)
- [Operations](#operations)
- [Usage Examples](#usage-examples)
- [Compatibility](#compatibility)
- [Contributing](#contributing)
- [Development Setup](#development-setup)
- [Resources](#resources)
- [Version History](#version-history)
- [License](#license)

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

## Usage Examples

### Quick Start

1. Install the node using n8n's community node installation process
2. Set up your IKAS API credentials
3. Create a new workflow and add the IKAS node
4. Configure your desired operation (Product or Order management)

### Workflow Examples

#### Example 1: Sync Products from External Source

```
Webhook → Data Processing → IKAS (Create Product) → Email Notification
```

This workflow listens for new product data, processes it, creates the product in IKAS, and sends a confirmation email.

#### Example 2: Order Fulfillment Automation

```
IKAS (Get Orders) → Filter (Paid Orders) → IKAS (Fulfill Order) → Send Tracking Email
```

This workflow automatically fulfills paid orders and sends tracking information to customers.

#### Example 3: Inventory Management

```
Schedule Trigger → IKAS (Get Products) → Check Stock Levels → IKAS (Update Product) → Slack Notification
```

This workflow runs daily to check stock levels and update products with low inventory alerts.

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

## Contributing

We welcome contributions from the community! Whether you're fixing bugs, adding features, or improving documentation, your help is appreciated.

### How to Contribute

1. **Fork the Repository**: Click the "Fork" button on GitHub to create your own copy
2. **Clone Your Fork**: `git clone https://github.com/YOUR_USERNAME/n8n-ikas.git`
3. **Create a Branch**: `git checkout -b feature/your-feature-name`
4. **Make Your Changes**: Implement your feature or fix
5. **Test Your Changes**: Ensure everything works correctly
6. **Commit Your Changes**: `git commit -am 'Add some feature'`
7. **Push to Your Branch**: `git push origin feature/your-feature-name`
8. **Create a Pull Request**: Submit your changes for review

### Code Standards

- Follow the existing TypeScript code style
- Use meaningful variable and function names
- Add JSDoc comments for new functions
- Ensure all new code is properly typed

### Reporting Issues

Found a bug or have a feature request? Please check existing issues first, then create a new issue with:

- Clear description of the problem or request
- Steps to reproduce (for bugs)
- Expected vs actual behavior
- Your environment details (n8n version, Node.js version, etc.)

## Development Setup

### Prerequisites

- Node.js >=22.16
- n8n (for testing)

### Setup Instructions

1. **Clone the Repository**

   ```bash
   git clone https://github.com/actuallyzefe/n8n-ikas.git
   cd n8n-ikas
   ```

2. **Install Dependencies**

   ```bash
   npm install
   ```

3. **Build the Project**

   ```bash
   npm run build
   ```

4. **Development Mode** (watches for changes)

   ```bash
   npm run dev
   ```

5. **Linting and Formatting**
   ```bash
   npm run lint        # Check for linting issues
   npm run lintfix     # Fix auto-fixable issues
   npm run format      # Format code with prettier
   ```

### Project Structure

```
├── credentials/           # Authentication credential definitions
├── nodes/
│   └── Ikas/
│       ├── Ikas.node.ts  # Main node implementation
│       ├── GenericFunctions.ts # Shared utilities
│       ├── graphql/      # GraphQL queries and mutations
│       ├── node-definition/ # Node property definitions
│       ├── operations/   # Operation implementations
│       └── types/        # TypeScript type definitions
├── gulpfile.js          # Build configuration
└── package.json         # Project configuration
```

### Testing Your Changes

1. Build the project: `npm run build`
2. Link to n8n: Follow [n8n's community node development guide](https://docs.n8n.io/integrations/community-nodes/creating-nodes/)
3. Test your changes in n8n workflows
4. Verify all operations work as expected

## Resources

- [n8n Community Nodes Documentation](https://docs.n8n.io/integrations/#community-nodes)
- [n8n Node Development Guide](https://docs.n8n.io/integrations/community-nodes/creating-nodes/)
- [IKAS API Documentation](https://ikas.dev/docs/intro)
- [IKAS Authentication Guide](https://ikas.dev/docs/api/getting-started/authentication)
- [IKAS Developer Portal](https://ikas.dev/)
- [GraphQL Best Practices](https://graphql.org/learn/best-practices/)

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

## Acknowledgments

- Thanks to the [n8n team](https://n8n.io/) for creating an amazing workflow automation platform
- Thanks to [IKAS](https://ikas.com) for providing a comprehensive e-commerce platform
- Thanks to all contributors who help improve this node

---

**Need Help?**

- Check out the [Issues](https://github.com/actuallyzefe/n8n-ikas/issues) for common problems
- Create a new issue if you can't find a solution
- Join the [n8n community](https://community.n8n.io/) for general n8n support
