## [Unreleased]

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
