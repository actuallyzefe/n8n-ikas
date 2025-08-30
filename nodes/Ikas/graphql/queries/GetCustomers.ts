export const GetCustomersQuery = `
	query ListCustomers($email: StringFilterInput, $id: StringFilterInput, $pagination: PaginationInput, $phone: StringFilterInput, $search: String, $sort: String, $updatedAt: DateFilterInput) {
		listCustomer(
			email: $email
			id: $id
			pagination: $pagination
			phone: $phone
			search: $search
			sort: $sort
			updatedAt: $updatedAt
		) {
			data {
				id
				firstName
				lastName
				email
				phone
				fullName
				note
				accountStatus
				b2bStatus
				gender
				customerSequence
				firstOrderDate
				lastOrderDate
				lastPriceListId
				lastStorefrontRoutingId
				orderCount
				passwordUpdateDate
				totalOrderPrice
				registrationSource
				subscriptionStatus
				phoneSubscriptionStatus
				smsSubscriptionStatus
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
						code
						iso2
						iso3
						name
					}
					region {
						id
						name
					}
				}
				attributes {
					value
				}
				priceListRules {
					priceListId
				}
			}
			page
			limit
			count
		}
	}
`;
