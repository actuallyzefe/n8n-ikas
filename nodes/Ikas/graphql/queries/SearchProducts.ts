export const SearchProductsQuery = `query SearchProducts($input: SearchInput!) {
  searchProducts(input: $input) {
    count
    data
    limit
    page
    totalCount
    results {
      id
      dynamicPriceListIds
      weight
      type
      stars {
        count
        star
      }
      customerReviewSummaries {
        averageRating
        reviewCount
        stars {
          count
          star
        }
      }
      reviewCount
      name
      createdAt
      brand {
        id
        name
      }
      attributes {
        imageIds
        value
      }
      baseUnit {
        baseAmount
        type
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
          translations {
            locale
            name
            values {
              id
              name
            }
          }
          values {
            colorCode
            id
            name
            thumbnailImageId
          }
        }
        variantValueIds
      }
      variants {
        id
        sku
        barcodeList
        attributes {
          value
        }
        variantValues {
          variantTypeId
          variantValueId
        }
        images {
          fileName
          isMain
          isVideo
          order
          id
        }
        prices {
          buyPrice
          currency
          currencyCode
          currencySymbol
          discountPrice
          priceListId
          sellPrice
        }
        stocks {
          stockCount
          stockLocationId
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
      }
    }
  }
}`;
