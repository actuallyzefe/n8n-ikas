export const GetProductByIdQuery = `
  query GetProduct($id: StringFilterInput!) {
    listProduct(id: $id) {
      data {
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
          variantTypeId
          variantValueIds
        }
        variants {
          id
          sku
          barcodeList
          isActive
          variantValueIds {
            variantTypeId
            variantValueId
          }
          attributes {
            value
            imageIds
          }
          images {
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
      }
    }
  }
`;
