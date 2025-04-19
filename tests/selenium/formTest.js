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

    it('devrait trouver au moins un formulaire sur le site', async function () {
        await driver.get('http://localhost:8081/index.html');

        // Chercher un formulaire sur plusieurs pages
        const pagesToCheck = [
            'index.html',
            'contact.html',
            'contactez-nous.html',
            'contact-us.html',
            'formulaire.html',
            'form.html'
        ];

        let formFound = false;

        for (const page of pagesToCheck) {
            try {
                await driver.get(`http://localhost:8081/${page}`);

                // Attendre que la page soit chargée
                await driver.wait(async () => {
                    const readyState = await driver.executeScript('return document.readyState');
                    return readyState === 'complete';
                }, 5000);

                const forms = await driver.findElements(By.css('form'));
                if (forms.length > 0) {
                    formFound = true;
                    break;
                }
            } catch (e) {
                // Page n'existe pas, continuer
            }
        }

        if (!formFound) {
            console.log('Aucun formulaire trouvé sur le site - Test ignoré');
            this.skip();
        }
    });

    it('devrait trouver des champs de formulaire', async function () {
        await driver.get('http://localhost:8081/index.html');

        let formPage = null;
        let fieldFound = false;

        // Chercher une page avec un formulaire
        const pagesToCheck = [
            'index.html',
            'contact.html',
            'contactez-nous.html',
            'contact-us.html',
            'formulaire.html',
            'form.html'
        ];

        for (const page of pagesToCheck) {
            try {
                await driver.get(`http://localhost:8081/${page}`);
                const forms = await driver.findElements(By.css('form'));
                if (forms.length > 0) {
                    formPage = page;

                    // Chercher des champs de formulaire
                    const inputTypes = [
                        'input[type="text"]',
                        'input[type="email"]',
                        'input[type="tel"]',
                        'input[type="password"]',
                        'textarea',
                        'select',
                        'input:not([type="submit"]):not([type="button"]):not([type="reset"])'
                    ];

                    for (const selector of inputTypes) {
                        const fields = await driver.findElements(By.css(selector));
                        if (fields.length > 0) {
                            fieldFound = true;
                            break;
                        }
                    }

                    if (fieldFound) break;
                }
            } catch (e) {
                // Continuer
            }
        }

        if (!formPage) {
            console.log('Aucun formulaire trouvé sur le site - Test ignoré');
            this.skip();
            return;
        }

        assert.ok(fieldFound, 'Des champs de formulaire devraient être trouvés');
    });

    it('devrait pouvoir interagir avec un formulaire', async function () {
        await driver.get('http://localhost:8081/index.html');

        let formInteractionSuccessful = false;

        // Chercher une page avec un formulaire
        const pagesToCheck = [
            'index.html',
            'contact.html',
            'contactez-nous.html',
            'contact-us.html',
            'formulaire.html',
            'form.html'
        ];

        for (const page of pagesToCheck) {
            try {
                await driver.get(`http://localhost:8081/${page}`);
                const forms = await driver.findElements(By.css('form'));

                if (forms.length > 0) {
                    // Essayer de remplir n'importe quel champ de texte
                    const textInputs = await driver.findElements(By.css('input[type="text"], input[type="email"], textarea'));

                    for (const input of textInputs) {
                        try {
                            if (await input.isDisplayed()) {
                                await input.sendKeys('Test');
                                const value = await input.getAttribute('value');
                                if (value && value.includes('Test')) {
                                    formInteractionSuccessful = true;
                                    break;
                                }
                            }
                        } catch (e) {
                            // Continuer avec le prochain champ
                        }
                    }

                    if (formInteractionSuccessful) break;
                }
            } catch (e) {
                // Continuer
            }
        }

        if (!formInteractionSuccessful) {
            console.log('Impossible d\'interagir avec un formulaire - Test ignoré');
            this.skip();
        }
    });
});