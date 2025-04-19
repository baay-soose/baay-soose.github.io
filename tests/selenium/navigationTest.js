// tests/selenium/navigationTest.js
const { By, until } = require('selenium-webdriver');
const BaseTest = require('./baseTest');
const assert = require('assert');

describe('Tests de navigation', function () {
    this.timeout(30000);
    let test;
    let driver;

    beforeEach(async function () {
        test = new BaseTest();
        await test.setup();
        driver = test.getDriver();
    });

    afterEach(async function () {
        await test.teardown();
    });

    it('devrait naviguer vers la page � propos', async function () {
        await driver.get('http://localhost:8080/index.html');

        // Trouver et cliquer sur le lien � propos
        const aboutLink = await driver.findElement(By.xpath("//a[contains(text(), '� propos') or contains(text(), 'About')]"));
        await aboutLink.click();

        // Attendre que la page se charge et v�rifier l'URL
        await driver.wait(until.urlContains('about'), 5000);
        const currentUrl = await driver.getCurrentUrl();
        assert.ok(currentUrl.includes('about'), 'L\'URL devrait contenir "about"');
    });

    it('devrait naviguer vers la page Services', async function () {
        await driver.get('http://localhost:8080/index.html');

        // Trouver et cliquer sur le lien Services
        const servicesLink = await driver.findElement(By.xpath("//a[contains(text(), 'Services')]"));
        await servicesLink.click();

        // Attendre que la page se charge et v�rifier le contenu
        await driver.wait(until.urlContains('services'), 5000);
        const servicesHeader = await driver.findElement(By.css('h1, h2'));
        const headerText = await servicesHeader.getText();
        assert.ok(headerText.toLowerCase().includes('services'), 'Le titre devrait contenir "services"');
    });

    it('devrait naviguer vers la page Contact', async function () {
        await driver.get('http://localhost:8080/index.html');

        // Trouver et cliquer sur le lien Contact
        const contactLink = await driver.findElement(By.xpath("//a[contains(text(), 'Contact')]"));
        await contactLink.click();

        // Attendre que la page se charge et v�rifier la pr�sence d'un formulaire
        await driver.wait(until.elementLocated(By.css('form')), 5000);
        const form = await driver.findElement(By.css('form'));
        assert.ok(await form.isDisplayed(), 'Le formulaire de contact devrait �tre visible');
    });

    it('devrait revenir � la page d\'accueil via le logo', async function () {
        await driver.get('http://localhost:8080/about.html');

        // Cliquer sur le logo ou le lien vers l'accueil
        const logo = await driver.findElement(By.css('.logo, #logo, a[href="index.html"], a[href="/"]'));
        await logo.click();

        // V�rifier que nous sommes revenus � la page d'accueil
        await driver.wait(until.urlMatches(/index\.html$|\/$/), 5000);
        const currentUrl = await driver.getCurrentUrl();
        assert.ok(currentUrl.endsWith('index.html') || currentUrl.endsWith('/'), 'Devrait �tre revenu � la page d\'accueil');
    });
});