export const SaveCustomerMutation = `
	mutation SaveCustomer($input: CustomerInput!) {
		saveCustomer(input: $input) {
			id
			firstName
			lastName
			email
			phone
			createdAt
			updatedAt
		}
	}
`;
