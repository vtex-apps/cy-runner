export const transactionConstants = {
  COMPLETED: 'COMPLETED',
  SHIPPING: 'SHIPPING',
  NAME: 'Syed Mujeeb',
  ONLINE: 'online',
  CANCELLED: 'Cancelled',

  // Transaction endpoint constants ends here
  SETTLING: 'Settling',
  INTENT: 'CAPTURE',
  // Transaction endpoint constants ends here

  // Transaction/interaction endpoint constants starts here
  PaymentAuthorizationWorker: 'PaymentAuthorizationWorker',
  PaymentGateway: 'PaymentGateway',
  // statuses
  TransactionFinished: {
    Status: 'Transaction Finished',
    Message: 'Transaction settlement finished',
  },
  TransactionCancelled: {
    Status: 'Transaction Cancelled',
    Message: 'Transaction cancelation has finished',
  },
  TransactionSettling: {
    Status: 'Transaction Settling',
    Message: 'Transaction settlement finished',
  },
  PaymentFinished: {
    Status: 'Payment Finished',
    Message: 'Payment settlement finished',
  },

  // Transaction/interaction endpoint constants ends here

  // Transaction/payment endpoint starts here
  FINISHED: 'Finished',
  APPROVED: 'Approved',
  PayPalCP: 'PayPalCP',
  IMMEDIATECAPTURE: 'IMMEDIATECAPTURE',
  // Transaction/payment endpoint ends here

  // Transaction/settlement endpoint starts here
  AutoSettlement: 'auto-settlement',
  UpOnRquest: 'upon-request',
  // Transaction/settlement endpoint ends here

  // Transaction/refund endpoint starts here
  REFUNDED: 'REFUNDED',
  INVOICED: 'invoiced',
  RefundConnectorResponse: 'refundingConnectorResponse',
  // Transaction/refund endpoint ends here
}
