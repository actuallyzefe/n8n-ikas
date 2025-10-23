import type { IExecuteFunctions } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';

import { ikasGraphQLRequest } from '../../GenericFunctions';
import { SaveCustomerMutation } from '../../graphql/mutations/SaveCustomer';
import type { CustomerInput } from '../../types/customer.types';

/**
 * Builds the basic customer input object with required fields only
 */
function buildBasicCustomerInput(
	context: IExecuteFunctions,
	itemIndex: number,
): Partial<CustomerInput> {
	const customerInput: Partial<CustomerInput> = {
		firstName: context.getNodeParameter('firstName', itemIndex) as string,
	};

	// Add optional basic fields if provided
	const lastName = context.getNodeParameter('lastName', itemIndex) as string;
	if (lastName) {
		customerInput.lastName = lastName;
	}

	const email = context.getNodeParameter('email', itemIndex) as string;
	if (email) {
		customerInput.email = email;
	}

	const phone = context.getNodeParameter('phone', itemIndex) as string;
	if (phone) {
		customerInput.phone = phone;
	}

	return customerInput;
}

/**
 * Processes and adds additional fields to the customer input
 */
function processAdditionalFields(
	context: IExecuteFunctions,
	itemIndex: number,
	customerInput: Partial<CustomerInput>,
): void {
	const additionalFields = context.getNodeParameter('additionalFields', itemIndex) as Record<
		string,
		unknown
	>;

	if (!additionalFields || Object.keys(additionalFields).length === 0) {
		return;
	}

	// Account Status
	if (additionalFields.accountStatus) {
		customerInput.accountStatus = additionalFields.accountStatus as CustomerInput['accountStatus'];
	}

	// B2B Status
	if (additionalFields.b2bStatus) {
		customerInput.b2bStatus = additionalFields.b2bStatus as CustomerInput['b2bStatus'];
	}

	// Birth Date
	if (additionalFields.birthDate) {
		customerInput.birthDate = new Date(additionalFields.birthDate as string).getTime();
	}

	// Customer Group IDs
	if (additionalFields.customerGroupIds) {
		const groupIds = (additionalFields.customerGroupIds as string)
			.split(',')
			.map((id: string) => id.trim())
			.filter((id: string) => id.length > 0);
		if (groupIds.length > 0) {
			customerInput.customerGroupIds = groupIds;
		}
	}

	// Email Subscription Status
	if (additionalFields.subscriptionStatus) {
		const status = String(additionalFields.subscriptionStatus).toUpperCase();
		customerInput.subscriptionStatus = status as CustomerInput['subscriptionStatus'];
	}

	// Full Name
	if (additionalFields.fullName) {
		customerInput.fullName = additionalFields.fullName as string;
	}

	// Gender
	if (additionalFields.gender) {
		customerInput.gender = additionalFields.gender as CustomerInput['gender'];
	}

	// Note
	if (additionalFields.note) {
		customerInput.note = additionalFields.note as string;
	}

	// Phone Subscription Status
	if (additionalFields.phoneSubscriptionStatus) {
		const pstatus = String(additionalFields.phoneSubscriptionStatus).toUpperCase();
		customerInput.phoneSubscriptionStatus = pstatus as CustomerInput['phoneSubscriptionStatus'];
	}

	// Preferred Language
	if (additionalFields.preferredLanguage) {
		customerInput.preferredLanguage = additionalFields.preferredLanguage as string;
	}

	// Price List ID
	if (additionalFields.priceListId) {
		customerInput.priceListId = additionalFields.priceListId as string;
	}

	// Registration Source
	if (additionalFields.registrationSource) {
		const src = String(additionalFields.registrationSource).toUpperCase();
		customerInput.registrationSource = src as CustomerInput['registrationSource'];
	}

	// SMS Subscription Status
	if (additionalFields.smsSubscriptionStatus) {
		const sstatus = String(additionalFields.smsSubscriptionStatus).toUpperCase();
		customerInput.smsSubscriptionStatus = sstatus as CustomerInput['smsSubscriptionStatus'];
	}

	// Tag IDs
	if (additionalFields.tagIds) {
		const tagIds = (additionalFields.tagIds as string)
			.split(',')
			.map((id: string) => id.trim())
			.filter((id: string) => id.length > 0);
		if (tagIds.length > 0) {
			customerInput.tagIds = tagIds;
		}
	}
}

export async function createCustomer(
	this: IExecuteFunctions,
	itemIndex: number,
): Promise<Record<string, unknown>> {
	try {
		// Build basic customer input
		const customerInput = buildBasicCustomerInput(this, itemIndex);

		// Process additional fields
		processAdditionalFields(this, itemIndex, customerInput);

		// Basic validation: ensure at least one contact method present
		if (!customerInput.email && !customerInput.phone) {
			throw new NodeOperationError(
				this.getNode(),
				'Customer creation requires at least one of: Email or Phone',
				{ itemIndex },
			);
		}

		// Create the customer
		this.logger.info(JSON.stringify(customerInput, null, 2), {
			message: 'Customer create input',
		});
		const response = await ikasGraphQLRequest.call(this, SaveCustomerMutation, {
			input: customerInput,
		});

		this.logger.info(JSON.stringify(response, null, 2), {
			message: 'Customer create response',
		});

		const responseData = response.data?.saveCustomer || {};

		return responseData;
	} catch (error: unknown) {
		const errObj = error as { response?: { body?: unknown; status?: number } } | undefined;
		const body = errObj?.response?.body as unknown;
		const status = errObj?.response?.status;
		const details = body ? JSON.stringify(body).slice(0, 1000) : '';
		const msg = error instanceof Error ? error.message : 'Unknown error';
		throw new NodeOperationError(
			this.getNode(),
			`Failed to create customer: ${msg}${status ? ' | Status: ' + status : ''}${details ? ' | Details: ' + details : ''}`,
			{ itemIndex },
		);
	}
}
