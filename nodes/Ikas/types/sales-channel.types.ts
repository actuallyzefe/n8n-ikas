type SalesChannelPaymentGateway = {
	id: string;
	order: number;
};

type SalesChannelStockLocation = {
	id: string;
	order: number;
};

enum SalesChannelTypeEnum {
	ADMIN,
	APP,
	B2B_STOREFRONT,
	FACEBOOK,
	GOOGLE,
	POS,
	STOREFRONT,
}

export interface SalesChannel {
	id: string;
	name: string;
	paymentGateways: SalesChannelPaymentGateway[];
	priceListId: string;
	stockLocations: SalesChannelStockLocation[];
	type: SalesChannelTypeEnum;
}
