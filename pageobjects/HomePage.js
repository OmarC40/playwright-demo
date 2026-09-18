import { expect } from '@playwright/test';

export class HomePage {

  constructor(page) {

    this.page = page;


    this.registerLink = page.locator('[data-role="customer-login-state"]:visible')
    this.newCustomerSection = page.getByText('New Customer?')
    this.createAccountButton = page.getByRole('link', { name: 'Create Account' })

  }


  // ============================================================
  // METHODS
  // ============================================================
  async goto() {

    await this.page.goto('/');

  }

  async expectHomePageDisplayed() {

    await expect(this.page).toHaveURL(/mcstaging\.accentdecor\.com/);

  }

  async clickRegister() {

    await this.registerLink.click();

  }

  async expectNewCustomerSectionDisplayed() {

    await expect(this.newCustomerSection).toBeVisible();

  }

  async clickCreateAccount() {

    await this.createAccountButton.click();

  }

}