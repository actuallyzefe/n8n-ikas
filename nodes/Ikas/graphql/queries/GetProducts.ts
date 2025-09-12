export const GetProductsQuery = `
							query GetProducts($pagination: PaginationInput) {
								listProduct(pagination: $pagination) {
									data {
										id
										name
										type
										totalStock
										salesChannelIds
										variants {
											id
											sku
											stocks {
												id
												productId
												stockCount
												stockLocationId
												variantId
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
											barcodeList
											variantValueIds {
												variantTypeId
												variantValueId
											}
										}
										categories {
											id
											name
										}
										brand {
											id
											name
										}
									}
									page
									limit
									count
								}
							}
							`;
