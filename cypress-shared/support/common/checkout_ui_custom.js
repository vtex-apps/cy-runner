const getConfiguration = (workspace) => {
  if (!workspace) throw new Error('Workspace should be passed to this function')

  return {
    email: 'syed.mujeeb@vtex.com.br',
    workspace,
    layout: {
      type: 'vertical',
      accordionPayments: false,
      deliveryDateFormat: false,
      showCartQuantityPrice: false,
      showNoteField: false,
      hideEmailStep: true,
      customAddressForm: false,
      fontSize: '12px',
      borderRadius: '8px',
      btnBorderRadius: '32px',
      maxWrapper: '980px',
      inputHeight: '40px',
      bordersContainers: 'none',
      fontFamily: '"Roboto", sans-serif',
      currentPreview:
        'https://productusqa.vtexassets.com/_v/public/assets/v1/published/vtex.checkout-ui-custom@0.8.14/public/react/cdabb94cf787f1e2c9fdbc50a6365dc5.png',
    },
    javascript:
      "function updateOrderForm(method, exemptionNumber) {\n  let orderFormID = vtexjs.checkout.orderFormId\n  $.ajax({\n    url:\n      window.location.origin +\n      '/api/checkout/pub/orderForm/' +\n      orderFormID +\n      '/customData/avalara/exemptionNumber',\n    type: method,\n    data: { value: exemptionNumber },\n    success: function () {\n      vtexjs.checkout.getOrderForm().done(function (orderForm) {\n        if (orderForm.customData) {\n          //doSomething()\n          $('.tax-exemption__form').addClass('js-success')\n        } else {\n          //doSomethingElse()\n          $('.tax-exemption__input').val('')\n          $('.tax-exemption__form').removeClass('js-success')\n        }\n        //refresh the summary\n        vtexjs.checkout.getOrderForm().then(function (orderForm) {\n          var clientProfileData = orderForm.clientProfileData\n          return vtexjs.checkout.sendAttachment(\n            'clientProfileData',\n            clientProfileData\n          )\n        })\n      })\n    },\n  })\n}\n\nlet taxExemptionFieldHtml = `\n  <div class=\"tax-exemption\">\n    <p>Tax Exemption Certificate Number</p>\n    <form class=\"tax-exemption__form\">\n      <input type=\"text\" required maxlength=\"25\" class=\"tax-exemption__input\" name=\"tax-exemption__input\"/>\n      <input type=\"submit\"  class=\"tax-exemption__button btn btn-primary\" value=\"OK\" />\n      <button class=\"tax-exemption__button--remove\">remove</button>\n    </form>\n  </div>\n`\n\nfunction taxExemptionBinds() {\n  $('.tax-exemption__form').on('submit', function (e) {\n    e.preventDefault()\n    let exptN = $('.tax-exemption__input').val()\n    if (exptN) updateOrderForm('PUT', exptN)\n    return false\n  })\n\n  $('.tax-exemption__button--remove').on('click', function (e) {\n    e.preventDefault()\n    updateOrderForm('DELETE', '')\n  })\n}\n\nfunction taxExemptionValidateForm(inputVal) {\n  if (inputVal) {\n    $('.tax-exemption__form').addClass('js-success')\n    $('.tax-exemption__input').val(inputVal)\n  }\n}\n\nfunction appendField() {\n  if (\n    ~window.location.hash.indexOf('#/payment') &&\n    !$('.tax-exemption').length\n  ) {\n    let customTaxVal = vtexjs.checkout.orderForm?.customData\n      ? vtexjs.checkout.orderForm.customData.customApps\n        ? vtexjs.checkout.orderForm.customData.customApps.find(\n            (app) => app.id == 'avalara'\n          )\n        : ''\n      : ''\n    customTaxVal = customTaxVal ? customTaxVal.fields.exemptionNumber : ''\n    if (\n      !customTaxVal &&\n      !vtexjs.checkout.orderForm?.totalizers.find((x) => x.id === 'CustomTax')\n    )\n      return false\n    $('#payment-data form.form-step.box-new').prepend(taxExemptionFieldHtml)\n    taxExemptionValidateForm(customTaxVal)\n    taxExemptionBinds()\n  }\n}\n\n$(window).on('hashchange', function () {\n  appendField()\n})\n\n$(window).load(function () {\n  appendField()\n})\n\n\nfunction updateOrderFormVAT(method, vat) {\n  let orderFormID = vtexjs.checkout.orderFormId\n  $.ajax({\n    url:\n      window.location.origin +\n      '/api/checkout/pub/orderForm/' +\n      orderFormID +\n      '/customData/avalara/vatNumber',\n    type: method,\n    data: { value: vat },\n    success: function () {\n      vtexjs.checkout.getOrderForm().done(function (orderForm) {\n        if (orderForm.customData) {\n          //doSomething()\n          $('.business-vat__form').addClass('js-success')\n        } else {\n          //doSomethingElse()\n          $('.vat-number__input').val('')\n          $('.business-vat__form').removeClass('js-success')\n        }\n        //refresh the summary\n        vtexjs.checkout.getOrderForm().then(function (orderForm) {\n          var clientProfileData = orderForm.clientProfileData\n          return vtexjs.checkout.sendAttachment(\n            'clientProfileData',\n            clientProfileData\n          )\n        })\n      })\n    },\n  })\n}\n\nlet vatFieldHtml = `\n  <div class=\"vat-number\">\n    <p>Business VAT Number</p>\n    <form class=\"business-vat__form\">\n      <input type=\"text\" required maxlength=\"25\" class=\"vat-number__input\" name=\"vat-number__input\"/>\n      <input type=\"submit\"  class=\"vat-number__button btn btn-primary\" value=\"OK\" />\n      <button class=\"vat-number__button--remove\">remove</button>\n    </form>\n  </div>\n`\n\nfunction vatBinds() {\n  $('.business-vat__form').on('submit', function (e) {\n    e.preventDefault()\n    let vat = $('.vat-number__input').val()\n    if (vat) updateOrderFormVAT('PUT', vat)\n    return false\n  })\n\n  $('.vat-number__button--remove').on('click', function (e) {\n    e.preventDefault()\n    updateOrderFormVAT('DELETE', '')\n  })\n}\n\nfunction vatValidateForm() {\n  $('.business-vat__form').addClass('js-success')\n}\n\nfunction appendFieldVAT() {\n  if (~window.location.hash.indexOf('#/payment') && !$('.vat-number').length) {\n    $('#payment-data form.form-step.box-new').prepend(vatFieldHtml)\n    vatValidateForm()\n    vatBinds()\n  }\n}\n\n$(window).on('hashchange', function () {\n  appendFieldVAT()\n})\n\n$(window).load(function () {\n  appendFieldVAT()\n})",
    css: '.tax-exemption {\n  margin-bottom: 10px;\n}\n.tax-exemption__form {\n  display: flex;\n}\n.tax-exemption__button {\n  margin-left: 10px;\n  border-radius: 4px;\n}\n\n.tax-exemption__button--remove {\n  margin-left: 10px;\n  border-radius: 4px;\n  background: transparent;\n  border: none;\n  color: #ff4c4c;\n  display: none;\n}\n\n.tax-exemption__form.js-success {\n}\n.tax-exemption__form.js-success input.tax-exemption__input {\n  border: none !important;\n  box-shadow: none;\n  pointer-events: none;\n  font-weight: bold;\n}\n.tax-exemption__form.js-success .tax-exemption__button {\n  display: none;\n}\n.tax-exemption__form.js-success .tax-exemption__button--remove {\n  display: block;\n  text-decoration: underline;\n}\n\n.vat-number {\n  margin-bottom: 10px;\n}\n.business-vat__form {\n  display: flex;\n}\n.vat-number__button {\n  margin-left: 10px;\n  border-radius: 4px;\n}\n\n.vat-number__button--remove {\n  margin-left: 10px;\n}\n\n.vat-number__form.js-success input.vat-number__input {\n  border: none !important;\n  box-shadow: none;\n  pointer-events: none;\n  font-weight: bold;\n}\n.vat-number__form.js-success .vat-number__button {\n  display: none;\n}\n.vat-number__form.js-success .vat-number__button--remove {\n  display: block;\n  text-decoration: underline;\n}',
    javascriptActive: true,
    cssActive: true,
    colors: {
      base: '#f4f2f2',
      baseInverted: '#21364f',
      actionPrimary: '#1a73e8',
      actionPrimaryDarken: '#1d63be',
      actionSecondary: '#f1f7ff',
      emphasis: '#000000',
      disabled: '#999999',
      success: '#2fba2d',
      successDarken: '#269e24',
      successFaded: '#beffa5',
      danger: '#ff4c4c',
      dangerFaded: '#ffe6e6',
      warning: '#ffb100',
      warningFaded: '#fff6e0',
      muted1: '#323232',
      muted2: '#676767',
      muted3: '#999999',
      muted4: '#cbcbcb',
      muted5: '#eeeeee',
      muted6: '#f3f3f3',
    },
  }
}

export default getConfiguration
