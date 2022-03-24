export default {
  // *************HomePage Constants start here************ //

  SignInBtn: '.vtex-login-2-x-container > div >button',
  Email: 'input[name=email]',
  Password: '[class*=emailVerifi] > form > div input[type=password]',
  ForgotPassword: 'a[class*=forgot]',
  PasswordValidation: '.w-80',
  SignInFormBtn: 'div[class*=sendButton] > button',
  SignInLabel: '.vtex-login-2-x-label',
  ProfileLabel: 'span[class*=profile]',
  LogoutBtn: '[data-test="logout"]',
  Search: 'input[placeholder=Search]',
  OpenCart: 'span[class*=minicart]',
  MyAccount: '.vtex-login-2-x-accountOptions >div >a >button > span',
  Logout:
    '.vtex-login-2-x-accountOptions >div:last-child > button > div > span',
  ProductDiv: 'article > div',
  ProductRating: 'article >div  div[class*=vtex-reviews-and-ratings]',
  PayPaliframe: 'iframe[name*=paypal]',
  PayPalImg: "button[aria-label*='PayPal Pay Later Message']",
  AddtoCart: 'span[class*=vtex-add-to-cart-button]',
  TotalPrice: '#total-price > .vtex-checkout-summary-0-x-price',
  RemoveProduct: 'div[class*="removeButton"]',
  PickupInStore: '.srp-toggle__pickup',
  PickupItems: '.srp-items',
  ProductsQAShipping: "input[value='Productusqa2']",
  CloseCart: '.vtex-minicart-2-x-closeIconButton',
  // Below products are from sandboxusdev
  AddtoCartBtnForHat: "a[href*='003/p'] > article > button",
  AddtoCartBtnForAdidas: "a[href*='adidas01/p'] > article > button",
  AddtoCartBtnForAdidasv5: "a[href*='adidas01v5/p'] > article > button",
  // Below product is from external seller
  AddtoCartBtnForTShirt: "a[href*='adidas-women'] > article > button",
  // Below products are from productusqa
  AddtoCartBtnForOnion: "a[href*='onion'] > article > button",
  AddtoCartBtnForCoconut: "a[href*='coconut'] > article > button",
  AddtoCartBtnForOrange: "a[href*='frutas'] > article > button",
  AddtoCartBtnForMelon: "a[href*='watermelon'] > article > button",
  // *************HomePage Constants end here************ //

  // *************Search Results Constants end here************ //
  BrandFilter: 'label[for*=brand]',
  ProductAnchorElement: 'section[class*=summary] >a',
  generateAddtoCartSelector: (href) => {
    return `a[href='${href}'] > article > button`
  },
  searchResult: 'h1[class*=vtex-search]',
  // *************Search Results Constants end here************ //

  // *************Cart Sidebar Constants starts here************ //
  ProductQuantity:
    'div[class*=quantityDropdownContainer] > div > label > div > select',
  Paypal: 'div[class*=paypal]',
  SummaryText: 'span[class*=summarySmall]',
  ProceedtoCheckout: '#proceed-to-checkout',
  NewPayPal: 'div[class*=paypal] > span > iframe[name*=paypal]',
  QuantityBadgeInCart: 'span[class*=minicartQuantityBadge]',
  // *************Cart Sidebar Constants end here************ //

  // ************* New Cart - PayPal Constants end here************ //
  ItemQuantity: '#items-quantity',
  // ************* New Cart - PayPal Constants end here************ //

  // *************Product Page Constants starts here************ //
  AddressForm: 'div[class*=addressForm]',
  NormalShipping: "input[value='Normal']",
  FilterHeading: 'h5[class*="filter"]',

  // *************Product Page Constants end here************ //

  // *************Order Form Page Constants starts here************ //

  // Progress bar

  CartTimeline: 'span[class*=item_cart] > span',

  // *************Contact Form Page Constants starts here************ //
  ContactForm: '.form-step.box-edit',
  FirstName: '#client-first-name',
  LastName: '#client-last-name',
  Phone: '#client-phone',
  ProceedtoShipping: '#go-to-shipping',
  GoToPayment: '#go-to-payment',
  // *************Contact Form Page Constants end here************ //

  // *************Shipping Section Constants starts here************ //
  ShippingPreview: '#shipping-preview-container',
  ShippingCalculateLink:
    '#shipping-preview-container > div #shipping-calculate-link',
  ProductQuantityInCheckout: (position) => {
    return `tr:nth-child(${position}) > div > td.quantity > input`
  },
  ItemRemove: (position) => {
    return `tr:nth-child(${position}) > div > td.item-remove`
  },
  giftCheckbox: '.available-gift-items > tr > td:nth-child(2) > i',
  PostalCodeFinishedLoading: '#postalCode-finished-loading',
  EditShipping: 'a[id=edit-shipping-data]',
  OpenShipping: '#open-shipping',
  NewAddressBtn: '#new-address-button',
  UpdateSelectedAddressBtn: '#edit-address-button',
  ShippingSectionTitle: 'p[class*=shippingSectionTitle]',
  ShipCountry: '#ship-country',
  ShipStreet: '#ship-street',
  ShipAddressQuery: '#ship-addressQuery',
  ShipCity: '#ship-city',
  ShipState: '#ship-state',
  PostalCodeInput: '#ship-postalCode',
  CalculateBtn: '#cart-shipping-calculate',
  ContinueShipping: '#btn-go-to-shippping-method',
  CalculateShipping: 'button[class*=btnDelivery]',
  ForceShippingFields: '#force-shipping-fields',
  DeliveryAddress: '#deliver-at-text',
  ReceiverName: '#ship-receiverName',
  DeliveryAddressText: '#deliver-at-text > a',
  ChangeShippingAddress: 'button[data-i18n="modal.editShipping"]',

  // *************Shipping Section Constants end here************ //

  // *************Summary Section Constants starts here************ //
  QuantityBadge: '.quantity.badge',
  SummaryCart: 'div[class*=summary-cart] .product-name',
  Discounts: 'tr.Discounts',
  ProceedtoPaymentBtn: 'a[id=cart-to-orderform]',
  ShippingAmtLabel:
    'td[data-i18n="totalizers.Shipping"] ~ td[data-bind="text: valueLabel"]',
  TaxAmtLabel: ".CustomTax > td[data-bind='text: customTaxTotalLabel']",
  TotalLabel: 'td[data-bind="text: totalLabel"]',
  ShippingSummary: 'td[data-bind="text: valueLabel"]',
  GotoPaymentBtn: '#btn-go-to-payment',
  SubTotal:
    '.cart-template > .summary-template-holder > div > .totalizers > div table tr.Items > td.monetary',
  DeliveryUnavailable: 'p[id="shp-unavailable-delivery-available-pickup"]>span',
  // *************Summary Section Constants end here************ //

  //* ************Payment Section Constants starts here************ //
  ExemptionInput: '[name=tax-exemption__input]',
  SubmitExemption: 'input[class*=tax-exemption__button]',
  VatInput: '[name=vat-number__input]',
  SubmitVat: 'input[class*=vat-number__button]',
  TaxClass: '.CustomTax',
  Net90PaymentBtn: 'a[data-name=Net90]',
  Net90Label: '.payment-description',
  PromissoryPayment: '[data-name=Promissory]',
  BuyNowBtn: '#payment-data-submit > span',
  PaymentConfirmationLabel: '.vtex-order-placed-2-x-confirmationTitle',
  OrderIdLabel: '.vtex-order-placed-2-x-orderNumber',
  PaymentMethodIFrame: '.payment-method iframe',
  CardExist: '#use-another-card',
  CreditCard: 'a[data-name*=American]',
  CreditCardNumber: '[name=cardNumber]',
  CreditCardHolderName: "[name='ccName']",
  CreditCardExpirationMonth: '[name=cardExpirationMonth]',
  CreditCardExpirationYear: '[name=cardExpirationYear]',
  CreditCardCode: '#creditCardpayment-card-0Code',
  PaymentUnAuthorized: 'div[class*=payment-unauthorized]',
  // *************Payment Section Constants end here************ //

  // *************Order Form Page Constants end here************ //

  // *************B2B Constants starts here************ //
  SignEmail: 'div[class*=emailPassw]',
  Menu: 'div[role=presentation]  > svg > use[href*="menu"]',
  OrganisationSignup: 'a[href*=request] > span',
  AccessCode: 'div[class*=access]',
  Header: 'h3[class*=Title]',
  Submit: 'div[class*=login] > button[type=submit]',
  Token: 'input[name=token]',
  OrganizationName: 'div.layout__container > div:nth-child(1) input[type=text]',
  FirstNameinB2B:
    'div.layout__container > div:nth-child(2) div[class*=b2b]:nth-child(1) input[type=text]',
  LastNameinB2B:
    'div.layout__container > div:nth-child(2) div[class*=b2b]:nth-child(2) input[type=text]',
  EmailinB2B:
    'div.layout__container > div:nth-child(2) div[class*=b2b]:nth-child(3) input[type=text]',
  CostCenter:
    'div.layout__container > div:nth-child(3) div[class*=b2b]:nth-child(1) input[type=text]',
  PostalCode: 'input[name=postalCode]',
  Street: 'input[name=street]',
  Country: 'select[name=country]',
  City: 'input[name=city]',
  State: 'select[name=state]',
  ReceiverNameinB2B: 'input[name=receiverName]',
  SubmitOrganization: 'div[class*=Submit] button',
  PopupMsg: '.items-start .ph5',
  BuyNowBtnInB2B: 'span[class*=buy]',
  MyQuote: 'a[href*=quote]:nth-child(1)',
  CreateQuote: 'a[href*=quote]',
  PageHeader: 'div[class*=vtex-pageHeader__title]',
  // *************B2B Account: My Organization Constants start here************ //
  Profile: 'a[href*=profile]',
  MyOrganization: 'a[href*=organization]',
  MyOrganizationCostCenterUserDiv:
    '.ReactVirtualized__Grid__innerScrollContainer',
  PageNotFound: 'div[class*=notFound]',

  // *************B2B Account: My Organization - Add Cost Center Constants start here************ //
  AddCostCenter:
    'div[class*=layout__container] > div:nth-child(1) #toolbar button',
  CostCenterName:
    'div[class*=scroll] > div:nth-of-type(1) div[class*=input] input[type=text]',
  CostCenterHeader: 'div[class*=vtex-pageHeader]',
  CloseModal: 'div[class*=modal__close]',
  SubmitCostCenter: '.nowrap > span:last-child > button',
  PromissoryCheckbox: '.mv4:nth-child(1) input[type=checkbox]',
  SaveChangesInCostCenter: '.mr4 div',
  AddAddress: 'div[class*=vtex-card] > div > button[type=button]',
  ToastMsgInB2B: 'div[class*=vtex-toast] .pr5',
  ModalConfirmation: 'div[class*=modal__confirm]',
  ModalClose: 'div[class*=modal__close]',
  DeleteCostCenter: 'div[class*=modal__confirm]',
  Remove: 'button[class*=danger]',
  CostCenterAddressEditOption: 'button[data-testid="menu-option-0"]',
  CostCenterAddressDeleteOption: 'button[data-testid="menu-option-1"]',
  CostCenterOption: '.vtex-card .relative button',
  // *************B2B Account: My Organization - Add Cost Center Constants end here************ //
  // *************B2B Account: My Organization - Add User Constants start here************ //
  AddUser: 'div[class*=layout__container] > div:nth-child(2) #toolbar button',
  UserName:
    'div[class*=scroll] > div:nth-of-type(1) div[class*=input] input[type=text]',
  UserEmail:
    'div[class*=scroll] > div:nth-of-type(2) div[class*=input] input[type=text]',
  UserCostCenter:
    'div[class*=scroll] > div:nth-of-type(3) div[class*=dropdown] > select',
  UserRole:
    'div[class*=scroll] > div:nth-of-type(4) div[class*=dropdown] > select',
  SubmitUser: '.nowrap > span:nth-child(2) button',
  RemoveUser: '.nowrap > span:nth-child(2) button',
  UpdateUser: '.nowrap > span:nth-child(3) button',
  // *************B2B Account: My Organization - Add User Constants start here************ //
  // *************B2B Account: My Organization - Edit User Constants start here************ //
  CostCenterDropDownInEdit:
    'div[class*=scroll] > div:nth-of-type(2) div[class*=dropdown] > select',
  RoleDropDownInEdit:
    'div[class*=scroll] > div:nth-of-type(3) div[class*=dropdown] > select',
  // *************B2B Account: My Organization - Edit User Constants end here************ //
  // *************B2B Account: My Organization Constants end here************ //
  // *************B2B Product Constants start here************ //
  B2BAddtoCart: 'span[class*=add-to-cart]',
  // *************B2B Product Constants end here************ //

  QuickOrder: 'a[href*=quick]',
  QuickOrderPage: () => {
    return {
      popupMsgSelector: 'div[class*=toast-container] div[class*=copy]',
      popupMsg: 'Products successfuly added to the cart',
      skus: {
        textArea: 'label[class*=textarea] > textarea',
        validate: 'div[class*=validate i]:nth-of-type(1) > button',
        addtoCart: 'div[class*=buttonsBlock] > button:nth-child(2)',
        invalid: 'span[class*=danger]',
        content: 'div[class*=vtex-table] input[type=text]',
        tableContainer: '.vtex-table__container',
        button: 'div[class*=vtex-button]',
        remove: 'button[class*=remove]',
        title: '.vtex-rich-text-0-x-heading--quickTitle',
      },
      uploadXLS: {
        menu: '.vtex-store-drawer-0-x-menuIcon',
        title: '.vtex-rich-text-0-x-heading--quickTitle',
        link: '.vtex-store-link-0-x-link--quickLink',
        file: 'input[type=file]',
        validate: 'div[class*=validate i]:nth-of-type(2) > button',
      },
      oneByOne: {
        search: 'input[placeholder*=product]',
        quantity: 'input[type=number]',
        add: 'div[class*=third] > div[class*=Add]',
        clear: '.vtex__icon-clear',
      },
      categories: {
        title: '.vtex-rich-text-0-x-heading--quickTitle',
        product: 'Sporting',
        quantity: 'div[class*=category] input[type=text]',
        addtoCart: 'div[class*=categoryProduct] button',
      },
    }
  },
  generateAddtoCartB2BSelector: (href) => {
    return `a[href='${href}'] > article button`
  },
  QuoteName: 'input[data-test=string]',
  QuoteNotFound:
    '[data-testid=totalizer-item-subtotal] [data-testid=totalizer-value]',
  Notes: '.vtex-textarea > textarea',
  RequestQuote: 'div[class*=request i] > button',
  SaveForLater: 'div[class*=SaveQuote i] > button',
  QuoteStatus: 'div[class*=vtex-tag]',
  CurrencyContainer: 'span[class*=currencyContainer]',
  QuoteStatusInMyQuotesPage:
    '.ReactVirtualized__Grid:nth-child(2) div[role="rowgroup"] > div[class*=items] div[class*=tag]',
  QuoteFromMyQuotesPage: '.flex-column div[role=grid] div div[class*=br]',
  updateHistory: '.vtex-card > p',
  ToggleFields: '#toggleFieldsBtn',
  // *************B2B Constants My Quotes start here************ //
  MyQuotes: 'span[class*=orderQuote]',
  QuoteSearch: 'input[type=search]',
  QuotesToolBar: '#toolbar',
  QuotesFilterByStatus: '.ma2:nth-child(1) button',
  StatusLabel: 'label[class*=label]',
  QuotesFilterByMoreOptions: '.ma2:nth-child(2) button',
  // *************B2B Constants My Quotes - Filter start here************ //
  FilterLabel: 'div[class*=singleValue]',
  FilterInput: '.flex-auto div[class*=input-prefix__group] > input',
  Datas: '.ReactVirtualized__Grid:nth-of-type(2) div',
  ClearFilter: '.vtex__icon-clear',
  // *************B2B Constants My Quotes - Filter end here************ //
  // *************B2B Constants My Quotes section end here************ //
  // *************B2B Constants Quote Details section start here************ //
  PriceField: 'input[name=price]',
  QuoteTotal: 'div[data-testid=totalizer-value]',
  NewProductPrice: '.new-product-price',
  DiscountSliderContainer: '.vtex-slider__selector-container',
  SliderSelector: '.vtex-slider__selector',
  SliderToolTip: '.vtex-slider__selector-tooltip',
  SliderContainer: '.vtex-slider-container',
  QuantityField: 'input[name=quantity]',
  Decline: '.nowrap > span:nth-child(1) button',
  SaveQuote: '.nowrap > span:nth-child(2) button',
  SubmitToSalesRep: 'Submit',
  UseQuote: 'Use Quote',
  BackBtn: 'div[class*=pageHeader] span',
  UseQuoteButton: '.nowrap > span:nth-child(3) button',
  // *************B2B Constants Quote Details section end here************ //
  // *************B2B Constants Checkout section start here************ //
  PostalCodeText: 'div[class*=address-summary] .postalCode',
  ShippingAddressList: 'label.address-item',
  BackToAddressList: '#back-to-address-list',
  StreetInAddressList: 'span.street',
  PostalCodeInAddressList: 'span.postalCode',
  AccessDenied: 'div[class*=denied]',
  // *************B2B Constants Checkout section end here************ //
  QuantityInCart: 'div[class*=quantityInputContainer] input[id*=quantity]',
  ItemsPriceInCart: '#items-price',
  // *************B2B Constants end here************ //
}
