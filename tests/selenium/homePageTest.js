// tests/selenium/homePageTest.js
const { By, until } = require('selenium-webdriver');
const BaseTest = require('./baseTest');
const assert = require('assert');

describe('Tests de la page d\'accueil', function () {
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

    it('devrait charger la page d\'accueil avec le bon titre', async function () {
        await driver.get('http://localhost:8080/index.html');
        const title = await driver.getTitle();
        assert.ok(title.includes('Baay Soose'), 'Le titre devrait contenir "Baay Soose"');
    });

    it('devrait afficher les �l�ments de navigation', async function () {
        await driver.get('http://localhost:8080/index.html');

        // V�rifier la pr�sence de la navigation
        const nav = await driver.findElement(By.css('nav'));
        assert.ok(await nav.isDisplayed(), 'La navigation devrait �tre visible');

        // V�rifier les liens de navigation principaux
        const navLinks = await driver.findElements(By.css('nav a'));
        assert.ok(navLinks.length >= 3, 'Il devrait y avoir au moins 3 liens de navigation');
    });

    it('devrait afficher la section h�ros', async function () {
        await driver.get('http://localhost:8080/index.html');

        // V�rifier la pr�sence de la section h�ros
        const heroSection = await driver.findElement(By.css('.hero, #hero'));
        assert.ok(await heroSection.isDisplayed(), 'La section h�ros devrait �tre visible');

        // V�rifier le titre principal
        const mainHeading = await driver.findElement(By.css('h1'));
        const headingText = await mainHeading.getText();
        assert.ok(headingText.length > 0, 'Le titre principal ne devrait pas �tre vide');
    });

    it('devrait avoir un footer avec des informations de contact', async function () {
        await driver.get('http://localhost:8080/index.html');

        // V�rifier la pr�sence du footer
        const footer = await driver.findElement(By.css('footer'));
        assert.ok(await footer.isDisplayed(), 'Le footer devrait �tre visible');

        // V�rifier les informations de contact ou les r�seaux sociaux
        const contactInfo = await driver.findElements(By.css('footer a'));
        assert.ok(contactInfo.length > 0, 'Le footer devrait contenir des liens');
    });
});