export const GetStockLocationsQuery = `query listStockLocation(
	$name: StringFilterInput
) {
	listStockLocation(name: $name) {
		id
		name
		description
		type
		address {
			city {
				id
				name
			}
			country {
				id
				name
			}
			district {
				id
				name
			}
			address
			postalCode
		}
		deliveryTime
		isRemindOutOfStockEnabled
		outOfStockMailList
	}
}`;
