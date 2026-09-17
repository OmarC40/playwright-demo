import { test } from '@playwright/test';

import { HomePage } from '../pageobjects/HomePage.js';
import { RegistrationPage } from '../pageobjects/RegistrationPage.js';

import { registrationData } from '../data/registrationData.js';


let homePage;
let registrationPage;


test.beforeEach(async ({ page }) => {

  homePage = new HomePage(page);
  registrationPage = new RegistrationPage(page);

});


test('REG-001 New customer registration, all valid fields', async () => {

  await test.step('Open customer registration', async () => {

    await homePage.goto();

    await homePage.expectHomePageDisplayed();

    await homePage.clickRegister();

    await homePage.expectNewCustomerSectionDisplayed();

    await homePage.clickCreateAccount();

    await registrationPage.expectRegistrationPageDisplayed();

  });


  await test.step('Complete account information', async () => {

    await registrationPage.fillAccountInformation(
      registrationData
    );

    await registrationPage.continueToBilling();

  });


  await test.step('Complete billing information', async () => {

    await registrationPage.fillBillingInformation(
      registrationData.billing
    );

    await registrationPage.continueToShipping();

  });


  await test.step('Complete shipping information', async () => {

    await registrationPage.fillShippingInformation(
      registrationData.shipping
    );

  });


  await test.step('Create customer account', async () => {

    await registrationPage.createAccount();

  });

});


test('REG-002 Registration with missing required fields', async () => {

  await test.step('Open customer registration', async () => {

    await homePage.goto();

    await homePage.expectHomePageDisplayed();

    await homePage.clickRegister();

    await homePage.expectNewCustomerSectionDisplayed();

    await homePage.clickCreateAccount();

    await registrationPage.expectRegistrationPageDisplayed();

  });


  await test.step(
    'Validate required Account Information fields',
    async () => {

      // Leave required Account Information fields empty
      await registrationPage.continueToBilling();

      await registrationPage.expectAccountRequiredFieldErrors();

      await registrationPage.expectRegistrationPageDisplayed();

    }
  );


  await test.step('Complete account information', async () => {

    await registrationPage.fillAccountInformation(
      registrationData
    );

    await registrationPage.continueToBilling();

    await registrationPage.expectBillingSectionDisplayed();

  });


  await test.step(
    'Validate required Billing Information fields',
    async () => {

      // Leave required Billing Information fields empty
      await registrationPage.continueToShipping();

      await registrationPage.expectBillingRequiredFieldErrors();

      await registrationPage.expectBillingSectionDisplayed();

    }
  );


  await test.step('Complete billing information', async () => {

    await registrationPage.fillBillingInformation(
      registrationData.billing
    );

    await registrationPage.continueToShipping();

    await registrationPage.expectShippingSectionDisplayed();

  });


  await test.step(
    'Validate required Shipping Information fields',
    async () => {

      await registrationPage.setSameAsBilling(false);

      // Leave required Shipping Information fields empty
      await registrationPage.createAccount();

      await registrationPage.expectShippingRequiredFieldErrors();

      await registrationPage.expectShippingSectionDisplayed();

      await registrationPage.expectRegistrationUrl();

    }
  );

});