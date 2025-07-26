export const FulfillOrderMutation = `
  mutation FulfillOrder($input: FulFillOrderInput!) {
    fulfillOrder(input: $input) {
      id
      orderNumber
      status
      orderPackageStatus
      orderPaymentStatus
      totalFinalPrice
      totalPrice
      currencyCode
      currencySymbol
      orderedAt
      cancelledAt
      cancelReason
      archived
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
        taxNumber
        taxOffice
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
          slug
        }
        options {
          name
          values {
            name
            value
          }
        }
      }
      orderPackages {
        id
        orderPackageNumber
        orderPackageFulfillStatus
        stockLocationId
        trackingInfo {
          barcode
          cargoCompany
          cargoCompanyId
          trackingLink
          trackingNumber
        }
        note
        orderLineItemIds
        createdAt
        updatedAt
      }
      shippingLines {
        title
        price
        taxValue
        shippingSettingsId
        shippingZoneRateId
        isRefunded
      }
      paymentMethods {
        type
        price
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
      stockLocation {
        id
        name
      }
      taxLines {
        rate
        price
      }
      orderAdjustments {
        name
        type
        appliedOrderLines {
          orderLineId
        }
      }
      invoices {
        id
        invoiceNumber
        createdAt
      }
      note
      giftPackageNote
      isGiftPackage
      giftPackageLines {
        price
        taxValue
      }
      itemCount
      customerOrderCount
      lastActivityDate
      createdBy
      cartId
      cartStatus
      checkoutId
      clientIp
      couponCode
      currencyRates {
        rate
      }
      dueDate
      host
      marketingCampaignId
      merchantId
      orderSequence
      orderTagIds
      priceList {
        id
        name
      }
      recoverEmailStatus
      recoveryStatus
      sessionInfo {
        countryCode
        durationMS
        end
        host
        ip
        referer
        salesChannelId
        sessionId
        start
        storefrontId
        trafficSource {
          source
          type
        }
        userAgent {
          deviceType
          name
          os
        }
        utm {
          campaign
          content
          medium
          source
          term
        }
        visitorId
      }
      sourceId
      terminalId
      userAgent
      attributes {
        value
      }
      availableShippingMethods {
        price
      }
      branch {
        id
        name
      }
      branchSession {
        id
        name
      }
      branchSessionId
      staff {
        id
        firstName
        lastName
        email
      }
      storefrontRouting {
        id
        domain
        locale
        path
        priceListId
      }
      storefrontTheme {
        id
        name
        themeId
        themeVersionId
      }
      abandonedCartFlows {
        authorizedAppId
        campaignId
        canApplicable
        couponId
        customerFilters {
          sendOnlyActiveAccount
          sendOnlySubscribedToEmail
        }
        flowId
        mailSendDate
        mailTranslationId
        messageType
        recoverEmailStatus
        sendAfter
        smsTranslationId
      }
    }
  }
`;
