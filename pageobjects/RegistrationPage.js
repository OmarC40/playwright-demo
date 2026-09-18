import { expect } from '@playwright/test';

export class RegistrationPage {

  constructor(page) {

    this.page = page;


    // ============================================================
    // ACCOUNT INFORMATION LOCATORS
    // ============================================================

    this.accountInformationSection = page.getByRole('heading', { name: 'Account & Contact Info' });

    // FIRST NAME input
    this.firstNameInput = page.getByRole('textbox', { name: 'First Name' });

    // LAST NAME input
    // Confirmed DOM id: lastname
    this.lastNameInput = page.locator('#lastname');

    // FEDERAL TAX ID (EIN)
    this.einInput = page.getByRole('textbox', { name: 'Federal Tax ID (EIN)' });

    // COMPANY NAME
    this.companyNameInput = page.locator('[name="companyname"]');

    // YEAR IN BUSINESS
    this.yearInBusinessInput = page.getByLabel('Year in Business');

    // WEBSITE / SOCIAL MEDIA / PORTFOLIO URL
    this.websiteInput = page.getByLabel('Website, Social Media, or Portfolio URL');

    // BUSINESS TYPE dropdown
    this.businessTypeSelect = page.getByRole('combobox', { name: 'Business Type' });

    // HOW DID YOU HEAR ABOUT US dropdown
    this.hearAboutUsSelect = page.getByRole('combobox', {name: 'How Did You Hear About Us?'});

    // ACCOUNT PHONE NUMBER
    this.accountPhoneInput = page.locator('input[name="telephone-mask"]')

    // FAX
    this.faxInput = page.getByRole('textbox', { name: 'Fax' });

    // EMAIL ADDRESS
    this.emailInput = page.getByRole('textbox', { name: 'Your Email Address' });

    // PASSWORD
    this.passwordInput = page.getByRole('textbox', {name: 'Create a Personal Password'});

    // CONFIRM PASSWORD
    this.confirmPasswordInput = page.getByRole('textbox', { name: 'Confirm Password' });

    // NEWSLETTER checkbox
    this.newsletterCheckbox = page.getByRole('checkbox', {name: 'Sign Up for Newsletter'});

    // KEEP ME SIGNED IN checkbox
    this.keepSignedInCheckbox = page.locator('#remember_meKLuHvKC2rU');

    // CONTINUE button
    this.continueButton = page.getByRole('button', { name: 'Continue' });

    // Final CREATE AN ACCOUNT button
    this.createAccountButton = page.getByRole('button', { name: 'Create an Account' });


    // ============================================================
    // BILLING INFORMATION LOCATORS
    // ============================================================

    this.billingSection = page.locator(':text-is("Address Information")');

    this.billingPhoneInput = page.locator('#telephone_billing');

    this.billingCompanyInput = page.locator('#company');

    this.billingStreetInput = page.locator('#street_1');

    this.billingCityInput = page.locator('#city');

    this.billingStateSelect = page.locator('#region_id');

    this.billingZipInput = page.locator('#zip');

    this.billingCountrySelect = page.locator('#country');


    // ============================================================
    // SHIPPING INFORMATION LOCATORS
    // ============================================================

    this.shippingSection =page.getByRole('heading', {name: 'Shipping Address Information'});

    this.sameAsBillingCheckbox = page.locator('#shipping_same_billing');

    this.shippingPhoneInput = page.locator('#telephone_shipping');

    this.shippingCompanyInput = page.locator('#company_shipping');

    this.shippingStreetInput = page.locator('#street_1_shipping');

    this.shippingCityInput = page.locator('#city_shipping');

    this.shippingStateSelect = page.locator('#region_id_shipping');

    this.shippingZipInput = page.locator('#zip_shipping');

    this.shippingCountrySelect = page.locator('#country_shipping');


    // ============================================================
    // REGISTRATION SUCCESS LOCATORS
    // ============================================================

    this.registrationSuccessTitle =
      page.getByText(/thank you for registering with accent decor/i);

    this.registrationSuccessMessage =
      page.getByText(/we have received your message/i);


    // ============================================================
    // VALIDATION LOCATORS
    // ============================================================

    // Temporary until we confirm the exact validation message
    this.requiredFieldErrors =
      page.getByText(/required field|required/i);

  }


  // ============================================================
  // PAGE VALIDATION METHODS
  // ============================================================

  async expectRegistrationPageDisplayed() {

    await expect(this.page).toHaveURL(/customer\/account\/create/);

    await expect(this.accountInformationSection).toBeVisible();

  }


  async expectRegistrationUrl() {

    await expect(this.page).toHaveURL(/customer\/account\/create/);

  }


  // ============================================================
  // ACCOUNT INFORMATION METHODS
  // ============================================================

  async fillAccountInformation(data) {

    await this.firstNameInput.fill(data.firstName);


    // Temporary checks to diagnose the Last Name timeout.
    await expect(this.lastNameInput).toBeVisible();

    await expect(this.lastNameInput).toBeEditable();

    await this.lastNameInput.scrollIntoViewIfNeeded();

    await this.lastNameInput.fill(data.lastName);

    await this.einInput.fill(data.ein);

    await this.companyNameInput.fill(data.companyName);

    await this.yearInBusinessInput.fill(data.yearInBusiness);

    await this.websiteInput.fill(data.website);

    await this.businessTypeSelect.selectOption({label: data.businessType});

    await this.hearAboutUsSelect.selectOption({label: data.hearAboutUs});

    await this.accountPhoneInput.fill(data.phone);

    await this.faxInput.fill(data.fax);

    await this.emailInput.fill(data.email);

    await this.passwordInput.fill(data.password);

    await this.confirmPasswordInput.fill(data.password);

  }


  // ============================================================
  // BILLING METHODS
  // ============================================================

  async fillBillingInformation(data) {

    await this.billingPhoneInput.fill(data.phone);

    await this.billingCompanyInput.fill(data.company);

   await this.billingStreetInput.fill(data.address);

    await this.billingCityInput.fill(data.city);

    await this.billingStateSelect.selectOption({label: data.state});

    await this.billingZipInput.fill(data.zip);

    await this.billingCountrySelect.selectOption({label: data.country});

  }


  // ============================================================
  // SHIPPING METHODS
  // ============================================================

  async fillShippingInformation(data) {

    if (data.sameAsBilling) {

      await this.sameAsBillingCheckbox.check();

      return;

    }


    await this.sameAsBillingCheckbox.uncheck();


    await this.shippingPhoneInput.fill(data.phone);

    await this.shippingCompanyInput.fill(data.company);

    await this.shippingStreetInput.fill(data.address);

    await this.shippingCityInput.fill(data.city);

    await this.shippingStateSelect.selectOption({label: data.state});

    await this.shippingZipInput.fill(data.zip);

    await this.shippingCountrySelect.selectOption({label: data.country});

  }


  // ============================================================
  // NAVIGATION METHODS
  // ============================================================

  async continueToBilling() {

    await this.continueButton.click();

  }


  async continueToShipping() {

    await this.continueButton.click();

  }


  async createAccount() {
    console.log("Hola")
    //await this.createAccountButton.click();

  }


  // ============================================================
  // SECTION VALIDATION METHODS
  // ============================================================

  async expectBillingSectionDisplayed() {

    await expect(this.billingSection).toBeVisible();

  }


  async expectShippingSectionDisplayed() {

    await expect(this.shippingSection).toBeVisible();

  }


  async expectRegistrationSuccess() {

    await expect(this.registrationSuccessTitle).toBeVisible();

    await expect(this.registrationSuccessMessage).toBeVisible();

  }


  // ============================================================
  // CHECKBOX METHODS
  // ============================================================

  async setSameAsBilling(value) {

    if (value) {

      await this.sameAsBillingCheckbox.check();

    } else {

      await this.sameAsBillingCheckbox.uncheck();

    }

  }


  // ============================================================
  // REQUIRED FIELD VALIDATION METHODS
  // ============================================================

  async expectAccountRequiredFieldErrors() {

    await expect(
      this.requiredFieldErrors.first()
    ).toBeVisible();

  }


  async expectBillingRequiredFieldErrors() {

    await expect(this.requiredFieldErrors.first()).toBeVisible();
  }


  async expectShippingRequiredFieldErrors() {

    await expect(this.requiredFieldErrors.first()).toBeVisible();

  }

}