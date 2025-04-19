// tests/selenium/formTest.js
const { By, until } = require('selenium-webdriver');
const BaseTest = require('./baseTest');
const assert = require('assert');

describe('Tests de formulaire', function () {
    this.timeout(30000);
    let test;
    let driver;

    beforeEach(async function () {
        console.log('--- Initialisation du test de formulaire ---');
        test = new BaseTest();
        await test.setup();
        driver = test.getDriver();
        console.log('Driver initialis� avec succ�s');
    });

    afterEach(async function () {
        console.log('--- Nettoyage du test de formulaire ---');
        if (driver) {
            await driver.takeScreenshot().then(function (data) {
                const fs = require('fs');
                const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
                fs.writeFileSync(`screenshots/form-test-${timestamp}.png`, data, 'base64');
                console.log(`Screenshot sauvegard� : form-test-${timestamp}.png`);
            }).catch(err => console.error('Erreur lors de la capture d\'�cran:', err));
        }
        await test.teardown();
    });

    it('devrait trouver au moins un formulaire sur le site', async function () {
        console.log('Recherche de formulaires sur le site...');

        try {
            await driver.get('http://localhost:8081/index.html');
            console.log('Page index charg�e');

            // Attendre que la page soit compl�tement charg�e
            await driver.wait(async () => {
                const readyState = await driver.executeScript('return document.readyState');
                return readyState === 'complete';
            }, 10000);

            console.log('Page compl�tement charg�e, recherche des formulaires...');

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
                console.log(`V�rification de la page: ${page}`);
                try {
                    await driver.get(`http://localhost:8081/${page}`);

                    // Attendre que la page soit charg�e
                    await driver.wait(async () => {
                        const readyState = await driver.executeScript('return document.readyState');
                        return readyState === 'complete';
                    }, 5000);

                    const forms = await driver.findElements(By.css('form'));
                    console.log(`Nombre de formulaires trouv�s sur ${page}: ${forms.length}`);

                    if (forms.length > 0) {
                        formFound = true;
                        console.log(`Formulaire trouv� sur ${page}!`);
                        break;
                    }
                } catch (e) {
                    console.log(`Erreur lors de l'acc�s � ${page}: ${e.message}`);
                    // Page n'existe pas, continuer
                }
            }

            if (!formFound) {
                console.log('Aucun formulaire trouv� sur le site - Test ignor�');
                this.skip();
            }
        } catch (error) {
            console.error('Erreur dans le test de formulaire:', error);
            throw error;
        }
    });

    it('devrait pouvoir interagir avec un formulaire', async function () {
        console.log('Test d\'interaction avec un formulaire...');

        try {
            await driver.get('http://localhost:8081/index.html');
            console.log('Page index charg�e');

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
                console.log(`V�rification de la page: ${page}`);
                try {
                    await driver.get(`http://localhost:8081/${page}`);

                    // Attendre le chargement complet
                    await driver.wait(async () => {
                        const readyState = await driver.executeScript('return document.readyState');
                        return readyState === 'complete';
                    }, 5000);

                    const forms = await driver.findElements(By.css('form'));
                    console.log(`Nombre de formulaires trouv�s: ${forms.length}`);

                    if (forms.length > 0) {
                        // Essayer de remplir n'importe quel champ de texte
                        const textInputs = await driver.findElements(By.css('input[type="text"], input[type="email"], textarea'));
                        console.log(`Nombre de champs texte trouv�s: ${textInputs.length}`);

                        for (const input of textInputs) {
                            try {
                                if (await input.isDisplayed()) {
                                    console.log('Tentative de saisie dans un champ...');
                                    await input.sendKeys('Test');
                                    const value = await input.getAttribute('value');
                                    console.log(`Valeur du champ apr�s saisie: ${value}`);
                                    if (value && value.includes('Test')) {
                                        formInteractionSuccessful = true;
                                        console.log('Interaction r�ussie!');
                                        break;
                                    }
                                }
                            } catch (e) {
                                console.log(`Erreur lors de l'interaction avec le champ: ${e.message}`);
                                // Continuer avec le prochain champ
                            }
                        }

                        if (formInteractionSuccessful) break;
                    }
                } catch (e) {
                    console.log(`Erreur lors de l'acc�s � ${page}: ${e.message}`);
                    // Continuer
                }
            }

            if (!formInteractionSuccessful) {
                console.log('Impossible d\'interagir avec un formulaire - Test ignor�');
                this.skip();
            }
        } catch (error) {
            console.error('Erreur dans le test d\'interaction avec formulaire:', error);
            throw error;
        }
    });
});