export const GetCustomersQuery = `
	query ListCustomers($email: StringFilterInput, $id: StringFilterInput, $merchantId: StringFilterInput, $pagination: PaginationInput, $phone: StringFilterInput, $search: String, $sort: String, $updatedAt: DateFilterInput) {
		listCustomer(
			email: $email
			id: $id
			merchantId: $merchantId
			pagination: $pagination
			phone: $phone
			search: $search
			sort: $sort
			updatedAt: $updatedAt
		) {
			data {
				id
				accountStatus
				accountStatusUpdatedAt
				customerSequence
				email
				emailVerifiedDate
				firstName
				firstOrderDate
				fullName
				ip
				isEmailVerified
				isPhoneVerified
				lastName
				lastOrderDate
				lastPriceListId
				lastStorefrontRoutingId
				note
				orderCount
				passwordUpdateDate
				phone
				phoneVerifiedDate
				preferredLanguage
				priceListId
				registrationSource
				subscriptionStatus
				subscriptionStatusUpdatedAt
				totalOrderPrice
				userAgent
				customerGroupIds
				customerSegmentIds
				tagIds
				addresses {
					id
					addressLine1
					addressLine2
					firstName
					lastName
					company
					phone
					postalCode
					identityNumber
					taxNumber
					taxOffice
					title
					isDefault
					city {
						id
						code
						name
					}
					district {
						id
						code
						name
					}
					state {
						id
						code
						name
					}
					country {
						id
						code
						iso2
						iso3
						name
					}
					region {
						id
						code
						name
					}
				}
				attributes {
					attributeId
					attributeName
					attributeType
					value
				}
				priceListRules {
					id
					priceListId
					discountType
					discountValue
					minQuantity
					maxQuantity
				}
			}
			page
			limit
			count
		}
	}
`;
