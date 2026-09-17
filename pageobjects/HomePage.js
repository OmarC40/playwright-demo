import { expect } from '@playwright/test';

export class RegistrationPage {

  constructor(page) {

    this.page = page;


    // ACCOUNT INFORMATION

    this.accountInformationSection =
      page.getByText(/account & contact info/i);

    this.firstNameInput =
      page.getByLabel(/first name/i);

    this.lastNameInput =
      page.getByLabel(/last name/i);

    this.einInput =
      page.getByLabel(/federal tax id|ein/i);

    this.companyNameInput =
      page.getByLabel(/company name/i).first();

    this.yearInBusinessInput =
      page.getByLabel(/year in business/i);

    this.websiteInput =
      page.getByLabel(/website|social media|portfolio/i);

    this.businessTypeSelect =
      page.getByLabel(/business type/i);

    this.hearAboutUsSelect =
      page.getByLabel(/how did you hear about us/i);

    this.accountPhoneInput =
      page.getByLabel(/phone number/i).first();

    this.faxInput =
      page.getByLabel(/fax/i);

    this.emailInput =
      page.getByLabel(/email address/i);

    this.passwordInput =
      page.getByLabel(/create a personal password/i);

    this.confirmPasswordInput =
      page.getByLabel(/confirm password/i);

    this.newsletterCheckbox =
      page.getByLabel(/sign up for newsletter/i);

    this.keepSignedInCheckbox =
      page.getByLabel(/keep me signed in/i);


    // BUTTONS

    this.continueButton =
      page.getByRole('button', { name: /continue/i });

    this.createAccountButton =
      page.getByRole('button', { name: /create account/i }).last();


    // BILLING INFORMATION

    this.billingSection =
      page.getByText(/address information/i);

    this.billingPhoneInput =
      page.getByLabel(/phone number/i).nth(1);

    this.billingCompanyInput =
      page.getByLabel(/company name/i).nth(1);

    this.billingStreetInput =
      page.getByLabel(/street address/i).first();

    this.billingCityInput =
      page.getByLabel(/^city$/i).first();

    this.billingStateSelect =
      page.getByLabel(/state\/province/i).first();

    this.billingZipInput =
      page.getByLabel(/zip\/postal code/i).first();

    this.billingCountrySelect =
      page.getByLabel(/country/i).first();


    // SHIPPING INFORMATION

    this.shippingSection =
      page.getByText(/shipping address information/i);

    this.sameAsBillingCheckbox =
      page.getByLabel(/same as billing/i);

    this.shippingPhoneInput =
      page.getByLabel(/phone number/i).last();

    this.shippingCompanyInput =
      page.getByLabel(/company name/i).last();

    this.shippingStreetInput =
      page.getByLabel(/street address/i).last();

    this.shippingCityInput =
      page.getByLabel(/^city$/i).last();

    this.shippingStateSelect =
      page.getByLabel(/state\/province/i).last();

    this.shippingZipInput =
      page.getByLabel(/zip\/postal code/i).last();

    this.shippingCountrySelect =
      page.getByLabel(/country/i).last();


    // VALIDATION ERRORS

    this.requiredFieldErrors =
      page.getByText(/required field|required/i);

  }


  async expectRegistrationPageDisplayed() {

    await expect(this.page)
      .toHaveURL(/customer\/account\/create/);

    await expect(
      this.accountInformationSection
    ).toBeVisible();

  }


  async expectRegistrationUrl() {

    await expect(this.page)
      .toHaveURL(/customer\/account\/create/);

  }


  async fillAccountInformation(data) {

    await this.firstNameInput.fill(data.firstName);

    await this.lastNameInput.fill(data.lastName);

    await this.einInput.fill(data.ein);

    await this.companyNameInput.fill(data.companyName);

    await this.yearInBusinessInput.fill(
      data.yearInBusiness
    );

    await this.websiteInput.fill(data.website);

    await this.businessTypeSelect.selectOption({
      label: data.businessType
    });

    await this.hearAboutUsSelect.selectOption({
      label: data.hearAboutUs
    });

    await this.accountPhoneInput.fill(data.phone);

    if (data.fax) {
      await this.faxInput.fill(data.fax);
    }

    await this.emailInput.fill(data.email);

    await this.passwordInput.fill(data.password);

    await this.confirmPasswordInput.fill(
      data.password
    );

  }


  async fillBillingInformation(data) {

    await this.billingPhoneInput.fill(data.phone);

    await this.billingCompanyInput.fill(
      data.company
    );

    await this.billingStreetInput.fill(
      data.street
    );

    await this.billingCityInput.fill(data.city);

    await this.billingStateSelect.selectOption({
      label: data.state
    });

    await this.billingZipInput.fill(data.zip);

    await this.billingCountrySelect.selectOption({
      label: data.country
    });

  }


  async fillShippingInformation(data) {

    if (data.sameAsBilling) {

      await this.sameAsBillingCheckbox.check();

      return;
    }

    await this.sameAsBillingCheckbox.uncheck();

    await this.shippingPhoneInput.fill(data.phone);

    await this.shippingCompanyInput.fill(
      data.company
    );

    await this.shippingStreetInput.fill(
      data.street
    );

    await this.shippingCityInput.fill(data.city);

    await this.shippingStateSelect.selectOption({
      label: data.state
    });

    await this.shippingZipInput.fill(data.zip);

    await this.shippingCountrySelect.selectOption({
      label: data.country
    });

  }


  async continueToBilling() {

    await this.continueButton.click();

  }


  async continueToShipping() {

    await this.continueButton.click();

  }


  async createAccount() {

    await this.createAccountButton.click();

  }


  async expectBillingSectionDisplayed() {

    await expect(
      this.billingSection
    ).toBeVisible();

  }


  async expectShippingSectionDisplayed() {

    await expect(
      this.shippingSection
    ).toBeVisible();

  }


  async setSameAsBilling(value) {

    if (value) {

      await this.sameAsBillingCheckbox.check();

    } else {

      await this.sameAsBillingCheckbox.uncheck();

    }

  }


  async expectAccountRequiredFieldErrors() {

    await expect(
      this.requiredFieldErrors.first()
    ).toBeVisible();

  }


  async expectBillingRequiredFieldErrors() {

    await expect(
      this.requiredFieldErrors.first()
    ).toBeVisible();

  }


  async expectShippingRequiredFieldErrors() {

    await expect(
      this.requiredFieldErrors.first()
    ).toBeVisible();

  }

}