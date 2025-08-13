export const SaveCustomerMutation = `
	mutation SaveCustomer($input: CustomerInput!) {
		saveCustomer(input: $input) {
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
			createdAt
			updatedAt
		}
	}
`;
