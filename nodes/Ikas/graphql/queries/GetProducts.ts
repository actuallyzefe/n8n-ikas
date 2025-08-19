export const GetProductsQuery = `
							query GetProducts {
								listProduct {
									data {
										id
										name
										type
										totalStock
										salesChannelIds
										variants {
											id
											sku
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
								}
							}
							`;
