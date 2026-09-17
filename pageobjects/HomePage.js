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


  // Abre la página principal de Accent Decor.
  //
  // Usa "/" porque la URL principal debería estar definida
  // como baseURL dentro de playwright.config.js.
  async goto() {

    await this.page.goto('/');

  }


  // Valida que la página principal se haya abierto correctamente.
  //
  // Actualmente valida solamente que la URL pertenezca
  // a mcstaging.accentdecor.com.
  async expectHomePageDisplayed() {

    await expect(this.page).toHaveURL(/mcstaging\.accentdecor\.com/);

  }


  // Hace click en REGISTER desde la página principal.
  async clickRegister() {

    await this.registerLink.click();

  }


  // Valida que después de hacer click en REGISTER
  // aparezca la sección NEW CUSTOMER.
  async expectNewCustomerSectionDisplayed() {

    await expect(
      this.newCustomerSection
    ).toBeVisible();

  }


  // Hace click en CREATE ACCOUNT dentro de NEW CUSTOMER.
  //
  // Este método debe llevar al formulario completo
  // de registro del cliente.
  async clickCreateAccount() {

    await this.createAccountButton.click();

  }

}