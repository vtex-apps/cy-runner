import { PRODUCTS } from '../common/utils'

export default {
  singleProduct: {
    prefix: 'singleProduct',
    postalCode: '33180',
    totalAmount: '$ 1,160.95',
    productPrice: '540.00',
    subTotal: '$ 1,080.00',
    productName: PRODUCTS.coconut,
    productQuantity: '2',
    totalProductPrice: '1085.00',
    totalWithoutTax: '$ 1,085.00',
    refundedAmount: 108500,
  },
  multiProduct: {
    prefix: 'multiProduct',
    postalCode: '33180',
    totalAmount: '$ 1,416.00',
    subTotal: '$ 1,180.00',
    product1Name: PRODUCTS.coconut,
    product2Name: PRODUCTS.orange,
    totalWithoutTax: '$ 1,180.00',
    productQuantity: '2',
    product1Price: '540.00',
    product2Price: '100.00',
    totalProductPrice: '1,180.00',
    refundedAmount: 108500,
  },
  discountProduct: {
    prefix: 'discountProduct',
    postalCode: '33180',
    totalAmount: '$ 1,160.95',
    taxWithoutExemption: '$ 75.95',
    productPrice: '540.00',
    subTotal: '$ 1,080.00',
    // singleProduct, taxExemption, vatNumber,multiProduct,refund,externalSeller uses below product
    productName: PRODUCTS.cauliflower,
    productQuantity: '2',
    totalProductPrice: '1085.00',
    totalWithoutTax: '$ 1,085.00',
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
