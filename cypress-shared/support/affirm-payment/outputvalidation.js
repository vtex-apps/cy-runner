import { PRODUCTS } from '../common/utils'

export default {
  orderInfo: {
    inboundUrl:
      'https://productusqa.vtexpayments.com.br/payment-provider/transactions/786095C9CBE0432F9B5C8FA531CCD323/payments/2C047F00488E4FEAACDF51B1162074A3/inbound-request/:action',
    orderId: '1254652160546',
    callbackUrl:
      'https://productusqa.vtexpayments.com.br/payment-provider/transactions/786095C9CBE0432F9B5C8FA531CCD323/payments/2C047F00488E4FEAACDF51B1162074A3/retry',
  },
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
}
