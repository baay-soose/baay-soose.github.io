// tests/selenium/formTest.js
const { By, until } = require('selenium-webdriver');
const BaseTest = require('./baseTest');
const assert = require('assert');

describe('Tests de formulaire', function () {
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

    it('devrait valider le formulaire de contact', async function () {
        await driver.get('http://localhost:8080/contact.html');

        // Remplir le formulaire
        await driver.findElement(By.css('input[name="name"], #name')).sendKeys('John Doe');
        await driver.findElement(By.css('input[name="email"], #email')).sendKeys('john@example.com');
        await driver.findElement(By.css('textarea[name="message"], #message')).sendKeys('Test message pour Selenium');

        // Soumettre le formulaire
        const submitButton = await driver.findElement(By.css('button[type="submit"], input[type="submit"]'));
        await submitButton.click();

        // Attendre la confirmation ou le message de succès
        await driver.wait(until.elementLocated(By.css('.success, .alert-success, #success-message')), 5000);
        const successMessage = await driver.findElement(By.css('.success, .alert-success, #success-message'));
        const messageText = await successMessage.getText();
        assert.ok(messageText.includes('succès') || messageText.includes('envoyé'), 'Le message de succès devrait être affiché');
    });

    it('devrait valider les champs requis', async function () {
        await driver.get('http://localhost:8080/contact.html');

        // Tenter de soumettre le formulaire vide
        const submitButton = await driver.findElement(By.css('button[type="submit"], input[type="submit"]'));
        await submitButton.click();

        // Vérifier que des messages d'erreur apparaissent
        const hasRequiredAttrs = await driver.executeScript(
            'return Array.from(document.querySelectorAll("input, textarea")).some(el => el.hasAttribute("required"))'
        );

        if (hasRequiredAttrs) {
            // Si les champs ont l'attribut required, le navigateur devrait bloquer la soumission
            const nameField = await driver.findElement(By.css('input[name="name"], #name'));
            const isNameValid = await driver.executeScript('return arguments[0].validity.valid', nameField);
            assert.strictEqual(isNameValid, false, 'Le champ nom devrait être invalide quand vide');
        } else {
            // Si pas d'attribut required, vérifier une validation JavaScript personnalisée
            const errorMessage = await driver.findElement(By.css('.error, .alert-danger, .error-message'));
            assert.ok(await errorMessage.isDisplayed(), 'Un message d\'erreur devrait être affiché');
        }
    });

    it('devrait valider le format de l\'email', async function () {
        await driver.get('http://localhost:8080/contact.html');

        // Entrer un email invalide
        await driver.findElement(By.css('input[name="email"], #email')).sendKeys('invalid-email');

        // Remplir les autres champs pour éviter les erreurs
        await driver.findElement(By.css('input[name="name"], #name')).sendKeys('John Doe');
        await driver.findElement(By.css('textarea[name="message"], #message')).sendKeys('Test message');

        // Tenter de soumettre
        const submitButton = await driver.findElement(By.css('button[type="submit"], input[type="submit"]'));
        await submitButton.click();

        // Vérifier la validation de l'email
        const emailField = await driver.findElement(By.css('input[name="email"], #email'));
        const isEmailValid = await driver.executeScript('return arguments[0].validity.valid', emailField);

        if (!isEmailValid) {
            assert.strictEqual(isEmailValid, false, 'L\'email devrait être invalide');
        } else {
            // Vérifier si une validation JavaScript personnalisée existe
            const errorMessage = await driver.findElements(By.css('.error, .invalid-feedback'));
            assert.ok(errorMessage.length > 0, 'Un message d\'erreur pour l\'email devrait être affiché');
        }
    });
});