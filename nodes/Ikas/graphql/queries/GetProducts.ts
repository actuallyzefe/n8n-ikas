export const GetProductsQuery = `
							query GetProducts {
								listProduct {
									data {
										id
										name
										type
										totalStock
										variants {
											id
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
