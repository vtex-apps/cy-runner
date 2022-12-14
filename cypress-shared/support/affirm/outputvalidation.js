import { PRODUCTS } from '../common/utils'

export default {
  singleProduct: {
    prefix: 'singleProduct',
    postalCode: '33180',
    productPrice: '540.00',
    productName: PRODUCTS.coconut,
    productQuantity: '2',
    totalProductPrice: '1085.00',
    refundedAmount: 108500,
    refundType: 'refunded',
  },
  multiProduct: {
    prefix: 'multiProduct',
    postalCode: '33180',
    product1Name: PRODUCTS.coconut,
    product2Name: PRODUCTS.orange,
    productQuantity: '2',
    product1Price: '540.00',
    product2Price: '100.00',
    totalProductPrice: '1,183.33',
    refundedAmount: 108500,
    refundType: 'partially_refunded',
  },
  discountProduct: {
    prefix: 'discountProduct',
    postalCode: '33180',
    productName: PRODUCTS.cauliflower,
    productQuantity: '1',
    totalProductPrice: '95.00',
    totalAmount: '$ 95.00',
    refundedAmount: 9500,
    refundType: 'refunded',
  },
  discountShipping: {
    prefix: 'discountShipping',
    postalCode: '90290',
    productQuantity: '1',
    shippingLabel: 'Free',
    productName: PRODUCTS.orange,
    env: 'discountShippingOrder',
    totalProductPrice: '100.00',
  },
  externalSeller: {
    prefix: 'externalSeller',
    postalCode: '33180',
    product1Name: PRODUCTS.coconut,
    product2Name: PRODUCTS.tshirt,
    totalAmount: '$ 1,266.88',
    tax: '$ 82.88',
    directSaleAmount: '$ 1,160.95',
    directSaleTax: '$ 75.95',
    directSaleEnv: 'directSale',
    externalSellerAmount: '$ 105.93',
    externalSellerTax: '$ 6.93',
    externalSaleEnv: 'externalSale',
    subTotal: '$ 1,174.00',
    productQuantity: '2',
    product1Price: '540.00',
  },
}
