## [Unreleased]

### Changed
- Moved gmail to common folder
- In, commonGraphlValidation() added expect(response.body).to.not.equal('OK')

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
