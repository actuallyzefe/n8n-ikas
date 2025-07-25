# n8n-nodes-ikas

This is an n8n community node that integrates with the [Ikas](https://ikas.com) e-commerce platform. It allows you to automate workflows with Ikas stores by managing products, customers, orders, and categories.

[n8n](https://n8n.io/) is a [fair-code licensed](https://docs.n8n.io/reference/license/) workflow automation platform.

[Installation](#installation)  
[Operations](#operations)  
[Credentials](#credentials)  
[Compatibility](#compatibility)  
[Usage](#usage)  
[Resources](#resources)

## Installation

Follow the [installation guide](https://docs.n8n.io/integrations/community-nodes/installation/) in the n8n community nodes documentation.

1. Go to **Settings > Community Nodes**.
2. Select **Install**.
3. Enter `n8n-nodes-ikas` in **Enter npm package name**.
4. Agree to the [risks](https://docs.n8n.io/integrations/community-nodes/risks/) of using community nodes: select **I understand the risks of installing unverified code from a public source**.
5. Select **Install**.

After installing the node, you can use it like any other node. n8n displays the node in search results in the **Nodes** panel.

## Operations

### Product

- **Get Many**: Retrieve multiple products
- **Search** Search multiple products

## Credentials

You need to set up Ikas API credentials to use this node:

1. **API Key**: Your Ikas API key from the developer dashboard
2. **Store Domain**: Your Ikas store domain (without .ikas.com)

To get your API credentials:

1. Log in to your Ikas store admin panel
2. Navigate to the developer section
3. Generate an API key
4. Note your store domain

## Compatibility

Tested with n8n version 1.0+

## Usage

### Basic Example

Here's a simple workflow that creates a product in your Ikas store:

1. Add a **Manual Trigger** node
2. Add the **Ikas** node
3. Configure the node:
   - **Resource**: Product
   - **Operation**: Create
   - **Product Name**: "My New Product"
   - **Product Price**: 29.99
   - **Product SKU**: "PROD-001"

### Advanced Example

You can create more complex workflows by combining multiple operations:

1. **Schedule Trigger**: Run daily at 9 AM
2. **Ikas**: Get all new orders
3. **Filter**: Filter orders by status
4. **Ikas**: Update customer information
5. **Send Email**: Notify team about new orders

## Resources

- [n8n community nodes documentation](https://docs.n8n.io/integrations/community-nodes/)
- [Ikas API documentation](https://ikas.dev/)
- [Ikas website](https://ikas.com/)

## License

[MIT](https://github.com/efekarakanli/n8n-nodes-ikas/blob/main/LICENSE.md)
