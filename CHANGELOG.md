## [Unreleased]

### Fixed
- [ENGINEERS-1150] Fix resource reservation expected status

## [2.3.1] - 2023-02-17

### Fixed
- [ENGINEERS-1088] Checking dependency specs over specs on strategy to fail fast

### Added
- [ENGINEERS-1065] Added cy.qe command for write logs
- For shopper location, location availability, quickorder - Use cy.qe command to write logs

### Changed
- [ENGINEERS-1097] In adyen tests, for refunds testcase use lower rate products

### Added
- [ENGINEERS-1087] Added send invoice test in refund

## [2.3.0] - 2023-01-23

### Fixed
- [ENGINEERS-1074] Detection of base folder to start the test
- [ENGINEERS-1075] Detection of missing specs before start the test
- [ENGINEERS-1076] Detection of mixed path specs before start the test

### Changed
- Validate $ in minicart
- In organization request, add delay in typing for postalcode and street
- For create organization request update hardRetries from 2 to 1

## [2.2.1] - 2023-01-18

### Changed
- Improvement of shopper location & location availability

### Changed

- [ENGINEERS-1062]
   - Once organization request been approved from cypress tests we create same organization request again and verify the approved toast message
   (Because of one2many feature tests are failing - Disable the tests)
   - Improvements

### Removed

- [ENGINEERS-1058] Don't login with the user which we would be assigning to a b2b organization

## [2.2.0] - 2023-01-09

### Added
- [ENGINEERS-1037] Added affirm promo test

## [2.1.0] - 2023-01-06

### Removed
- [ENGINEERS-1033] Drop duplicate organization request testcase

### Changed
- Paypal cypress improvement

### Changed
- Verify Fedex Shipping prices code improvements

## [2.0.1] - 2022-12-27

### Fixed
- Bump decode-uri-component to 0.2.2

## [2.0.0] - 2022-12-27

### Added
- Added verify excel data testcase 

## [1.0.4] - 2022-12-27

### Fixed
- [ENGINEERS-987] Fix fork message for PRN

### Changed
- [ENGINEERS-985] & [ENGINEERS-986] Affirm selectors improvement

### Changed
- Fedex Shipping tests run time improvements

## [1.0.3] - 2022-12-19

### Fixed
- [ENGINEERS-962] Fix on label for PR from forks (created vs authorized)

### Fixed
- [ENGINEERS-975] Improve b2b checkout tests

### Fixed
- [ENGINEERS-975] Improve b2b checkout tests
### Fixed
- [ENGINEERS-962] Proper identification when a PR is from Fork

### Added
- [ENGINEERS-990] [ENGINEERS-991] - Added graphQL validation to be not null

### Added
- Improved Shopper location and location availability testcase

### Added
- [ENGINEERS-954] - Added graphQL common function & improved postsetup ,adyenLogin function

### Added
- [ENGINEERS-875] & [ENGINEERS-876] - Added more quickorder cypress tests

### Added
- Affirm payments cancellation testcase 

### Changed
- Fedex Shipping improvements

### Changed
- Prepend empty characters in address line
- In refund, workflow delay from 4s to 5s

### Added
- Added defaultDeliveryEstimateInDays new field in fedex app settings

### Added
- Added wipe testcase & improved 2.3 ,2.4 shopper location testcases.

### Added
- Added checkout ui custom configuration in checkout_ui_custom.js

### Changed
- Moved gmail to common folder
- In, commonGraphlValidation() added expect(response.body).to.not.equal('OK')
- Rename graphql_utils.js to graphql_operations.js

### Added
- Removed delayBetweenRetries + Added reload then fillContact info first then shipping info

### Added
- Added package optimization tests inside cy-runner

### Added
- Added quickorder tests inside cy-runner

### Added
- Move fedex shipping cypress tests inside cy-runner

### Added
- Changes in addNewLocation function in commands.js

### Removed
- [ENGINEERS-886] - Removed cartTimeline click in one of the place of updateShippingInformation

### Added
- Store orderForm information in _orderFormDebug.json

### Added
- Verifying search input field is displayed after placed an order

### Added
- Move updating shipping policy function to common folder

### Added
- Add log false for adyen creds

### Added
- Added Adyen Tests

### Added
- For updateShippingInformation, Add 10s delay between retries

### Changed
- Replace {retries: } with updateRetry
- Fix 2.4 title
- For create quotes, 20 seconds timeout
- Use force true for button click

### Changed
- Handle both province dropdown and text field

### Changed
- Added a link for Notion page on errors

### Changed
- Use Sync Checkout UI Custom via API everywhere

### Changed
- In Shopper Location testcase, we are getting different city name for poland postal code
So, updated the testcase

### Changed
- Selectors in affirm payment flow got changed. So, we need to update the selectors in cypress
- Use syncCheckoutUICustomAPI instead of syncCheckoutUICustom 

### Changed
- Reorder sales user / organization admin cypress tests

### Changed
- Split bindings testcase into two files

### Added
- For SyncCheckout UI Custom testcase - intercept GetHistory graphql

### Added
- Shorter report on PR decorator
- Enable quickOrderBySkuAnd51QuantityTestCase - Instead of toast message verify tooltip message

### Changed
- Stop validating dollar in minicart

### Added
- Group logs features

## [2.0.0] - 2022-10-02

### Fixed
- New way to lock account resources.
