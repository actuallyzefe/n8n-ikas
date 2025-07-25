export const SaveProductMutation = `mutation SaveProduct($input: SaveProductInput!) {
  saveProduct(input: $input) {
    id
    name
    type
    description
    shortDescription
    weight
    maxQuantityPerCart
    totalStock
    productVolumeDiscountId
    productOptionSetId
    googleTaxonomyId
    groupVariantsByVariantTypeId
    vendorId
    brandId
    categoryIds
    tagIds
    salesChannelIds
    hiddenSalesChannelIds
    dynamicPriceListIds
    attributes {
      id
      value
      imageIds
    }
    baseUnit {
      baseAmount
      type
    }
    brand {
      id
      name
    }
    categories {
      id
      name
    }
    tags {
      id
      name
    }
    productVariantTypes {
      order
      variantType {
        id
        name
        selectionType
        values {
          id
          name
          colorCode
          thumbnailImageId
        }
      }
      variantValueIds
    }
    variants {
      id
      sku
      barcodeList
      isActive
      variantValues {
        variantTypeId
        variantValueId
      }
      attributes {
        id
        value
        imageIds
      }
      images {
        id
        fileName
        order
        isMain
        isVideo
      }
      prices {
        priceListId
        currency
        currencyCode
        currencySymbol
        buyPrice
        sellPrice
        discountPrice
      }
      stocks {
        stockLocationId
        stockCount
      }
      unit {
        amount
        type
      }
      weight
    }
    translations {
      locale
      name
      description
    }
    metaData {
      title
      description
      keywords
    }
    createdAt
    updatedAt
  }
}`;
