import { PRODUCTS } from './utils.js'

export default {
  singleProduct: {
    prefix: 'singleProduct',
    postalCode: '33180',
    totalAmount: '$ 1,160.95',
    tax: '0',
    taxWithoutExemption: '$ 75.95',
    productPrice: '540.00',
    subTotal: '$ 1,080.00',
    // singleProduct, taxExemption, vatNumber,multiProduct,refund,externalSeller uses below product
    productName: PRODUCTS.coconut,
    productQuantity: '2',
    totalProductPrice: '1085.00',
    totalWithoutTax: '$ 1,085.00',
  },
  multiProduct: {
    prefix: 'multiProduct',
    postalCode: '93200',
    pickUpPostalCode: '33180',
    totalAmount: '$ 1,416.00',
    tax: '0',
    taxWithoutExemption: '$ 236.00',
    subTotal: '$ 1,180.00',
    product1Name: PRODUCTS.coconut,
    product2Name: PRODUCTS.orange,
    totalWithoutTax: '$ 1,180.00',
    productQuantity: '2',
    product1Price: '540.00',
    product2Price: '100.00',
    totalProductPrice: '1,180.00',
  },
  discountProduct: {
    prefix: 'discountProduct',
    postalCode: '33180',
    totalAmount: '$ 101.65',
    tax: '$ 6.65',
    subTotal: '$ 100.00',
    totalWithoutTax: '$ 100.00',
    productQuantity: '1',
    productPrice: '100.00',
    productName: PRODUCTS.cauliflower,
    env: 'discountProductEnv',
  },
  discountShipping: {
    prefix: 'discountShipping',
    postalCode: '90290',
    totalAmount: '$ 109.50',
    tax: '$ 9.50',
    subTotal: '$ 100.00',
    productQuantity: '1',
    totalWithoutTax: '$ 100.00',
    productPrice: '100.00',
    shippingLabel: 'Free',
    productName: PRODUCTS.orange,
    env: 'discountShippingOrder',
  },
  addressVerificationAPIConstants: {
    invalidCountryValidation: (response) => {
      expect(response.status).to.equal(200)
      expect(response.body[0].summary).to.have.string('Not a valid country')
    },
    invalidDataResponse: (response) => {
      expect(response.status).to.equal(200)
      expect(response.body.isValidAddress).to.be.false
      expect(response.body.messages[0].source).to.equal('Avalara.AvaTax.Common')
      expect(response.body.messages[0].severity).to.equal('Error')
    },
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
  europeanShipping: {
    postalCode: '93200',
    totalAmount: '$ 1,296.00',
    subTotal: '$ 1,080.00',
    tax: '$ 216.00',
    totalWithoutTax: '$ 1,080.00',
  },
  requestRefund: {
    // orderId variable name for getFullRefundTotal
    fullRefundEnv: 'order1',
    // orderId variable name for getPartialRefund
    partialRefundEnv: 'order2',
    getFullRefundTotal: 108500,
    getPartialRefundTotal: 108500,
    subTotal: '$ 1,080.00',
  },
  promotionProduct: {
    prefix: 'promotionalProduct',
    postalCode: '90290',
    totalAmount: '$ 26.65',
    tax: '$ 1.88',
    salesTax: '$ 1.88',
    amount: '24.77',
    subTotal: '$ 39.54',
    discount: '$ -19.77',
    totalWithoutTax: '$ 26.65',
    productName: PRODUCTS.greenConventional,
    productQuantity: '2',
    productPrice: '19.77',
    env: 'promotionProductEnv',
  },
}
