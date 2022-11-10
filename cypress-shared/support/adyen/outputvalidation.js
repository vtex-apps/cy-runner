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
}
