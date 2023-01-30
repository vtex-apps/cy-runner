import { PRODUCTS } from '../common/utils.js'

export default {
  createAccount: {
    accountHolderCode: `saravanantestqa${Date.now()
      .toString()
      .substring(6, 13)}`,
    sellerId: 'productusqa2',
    country: 'US',
    legalBusinessName: 'saravanan',
    email: 'saravanan.reddy@vtex.com.br',
    legalEntity: 'Business',
    processingTier: 0,
  },
  sellerAccount: 'productusqa2',
  schedule: 'MONTHLY',
  hook: {
    live: 'false',
    notificationItems: [
      {
        NotificationRequestItem: {
          eventCode: 'AUTHORISATION',
          success: 'true',
          eventDate: '2019-06-28T18:03:50+01:00',
          merchantAccountCode: 'YOUR_MERCHANT_ACCOUNT',
          pspReference: '7914073381342284',
          merchantReference: 'YOUR_REFERENCE',
          amount: {
            value: 1130,
            currency: 'EUR',
          },
        },
      },
    ],
  },

  singleProduct: {
    prefix: 'singleProduct',
    postalCode: '33180',
    productName: PRODUCTS.onion,
    productQuantity: '2',
    total: '$ 105.00',
  },
  multiProduct: {
    prefix: 'multiProduct',
    postalCode: '33180',
    total: '$ 203.33',
    product1Name: PRODUCTS.onion,
    product2Name: PRODUCTS.orange,
    productQuantity: '2',
  },
  discountProduct: {
    prefix: 'discountProduct',
    postalCode: '33180',
    total: '$ 95.00',
    productQuantity: '1',
    productName: PRODUCTS.cauliflower,
    env: 'discountProductEnv',
  },
  discountShipping: {
    prefix: 'discountShipping',
    postalCode: '90290',
    total: '$ 109.50',
    productQuantity: '1',
    productName: PRODUCTS.orange,
    env: 'discountShippingOrder',
  },
  externalSeller: {
    prefix: 'externalSeller',
    postalCode: '33180',
    product1Name: PRODUCTS.coconut,
    product2Name: PRODUCTS.tshirt,
    productQuantity: '2',
    directSaleEnv: 'directSaleEnv',
    externalSaleEnv: 'externalSaleEnv',
  },
  promotionProduct: {
    prefix: 'promotionalProduct',
    postalCode: '90290',
    total: '$ 24.77',
    productName: PRODUCTS.greenConventional,
    productQuantity: '2',
    env: 'promotionProductEnv',
  },
  requestRefund: {
    // orderId variable name for getFullRefundTotal
    fullRefundEnv: 'order1',
    // orderId variable name for getPartialRefund
    partialRefundEnv: 'order2',
    getFullRefundTotal: 10500,
    getPartialRefundTotal: 10500,
  },
}
