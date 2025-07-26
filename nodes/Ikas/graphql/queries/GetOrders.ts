export const GetOrdersQuery = `
	query ListOrders($status: OrderStatusEnumInputFilter, $orderPaymentStatus: OrderPaymentStatusEnumInputFilter, $orderPackageStatus: OrderPackageStatusEnumInputFilter, $customerId: StringFilterInput, $customerEmail: StringFilterInput, $orderNumber: StringFilterInput, $salesChannelId: StringFilterInput) {
		listOrder(
			status: $status
			orderPaymentStatus: $orderPaymentStatus
			orderPackageStatus: $orderPackageStatus
			customerId: $customerId
			customerEmail: $customerEmail
			orderNumber: $orderNumber
			salesChannelId: $salesChannelId
		) {
			data {
				id
				orderNumber
				orderSequence
				status
				orderPaymentStatus
				orderPackageStatus
				totalFinalPrice
				totalPrice
				currencyCode
				currencySymbol
				itemCount
				archived
				createdAt
				updatedAt
				orderedAt
				cancelledAt
				cancelReason
				couponCode
				note
				isGiftPackage
				giftPackageNote
				customer {
					id
					firstName
					lastName
					email
					phone
				}
				billingAddress {
					firstName
					lastName
					company
					addressLine1
					addressLine2
					city {
						id
						name
					}
					district {
						id
						name
					}
					state {
						id
						name
					}
					country {
						id
						name
						code
					}
					postalCode
					phone
					identityNumber
					taxNumber
					taxOffice
				}
				shippingAddress {
					firstName
					lastName
					company
					addressLine1
					addressLine2
					city {
						id
						name
					}
					district {
						id
						name
					}
					state {
						id
						name
					}
					country {
						id
						name
						code
					}
					postalCode
					phone
					identityNumber
				}
				orderLineItems {
					id
					quantity
					price
					finalPrice
					discountPrice
					status
					statusUpdatedAt
					variant {
						id
						name
						sku
						productId
						barcodeList
						variantValues {
							order
							variantTypeId
							variantTypeName
							variantValueId
							variantValueName
						}
					}
					options {
						name
						values {
							name
							value
						}
					}
				}
				shippingLines {
					title
					price
					taxValue
					isRefunded
					shippingSettingsId
					shippingZoneRateId
				}
				taxLines {
					rate
					price
				}
				paymentMethods {
					type
					price
				}
				orderAdjustments {
					name
					type
				}
				salesChannel {
					id
					name
					type
				}
				storefront {
					id
					name
				}
				storefrontRouting {
					id
					domain
					locale
					path
					priceListId
				}
				priceList {
					id
					name
				}
				stockLocation {
					id
					name
				}
				invoices {
					id
					invoiceNumber
					createdAt
				}
				orderPackages {
					id
					orderPackageNumber
					orderPackageFulfillStatus
					createdAt
					updatedAt
					note
					trackingInfo {
						trackingNumber
						trackingLink
					}
					orderLineItemIds
					stockLocationId
				}
			}
			page
			limit
			count
		}
	}
`;
