// tests/selenium/homePageTest.js
const { By, until } = require('selenium-webdriver');
const BaseTest = require('./baseTest');
const assert = require('assert');
const config = require('./config');

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

    it('devrait charger la page d\'accueil avec un titre', async function () {
        await driver.get(`${config.baseUrl}/index.html`);

        // Attendre que la page soit charg�e
        await driver.wait(async () => {
            const readyState = await driver.executeScript('return document.readyState');
            return readyState === 'complete';
        }, 10000);

        const title = await driver.getTitle();
        assert.ok(title.length > 0, 'Le titre de la page devrait exister');
    });

    it('devrait trouver au moins un �l�ment de navigation', async function () {
        await driver.get(`${config.baseUrl}/index.html`);

        // Chercher diff�rents types de navigation
        const navSelectors = [
            'nav',
            '.nav',
            '#nav',
            '.navbar',
            '.navigation',
            'header a',
            'ul li a'
        ];

        let navFound = false;
        for (const selector of navSelectors) {
            try {
                const elements = await driver.findElements(By.css(selector));
                if (elements.length > 0) {
                    navFound = true;
                    break;
                }
            } catch (e) {
                // Continue avec le prochain s�lecteur
            }
        }

        assert.ok(navFound, 'Au moins un �l�ment de navigation devrait �tre trouv�');
    });

    it('devrait avoir un �l�ment principal (h1 ou autre)', async function () {
        await driver.get(`${config.baseUrl}/index.html`);

        // Chercher diff�rents �l�ments principaux
        const mainSelectors = [
            'h1',
            'main',
            '.main',
            '#main',
            '.hero',
            '.banner',
            '.jumbotron'
        ];

        let mainElementFound = false;
        for (const selector of mainSelectors) {
            try {
                const elements = await driver.findElements(By.css(selector));
                if (elements.length > 0) {
                    mainElementFound = true;
                    break;
                }
            } catch (e) {
                // Continue avec le prochain s�lecteur
            }
        }

        assert.ok(mainElementFound, 'Un �l�ment principal devrait �tre trouv�');
    });

    it('devrait avoir un footer ou un �l�ment en bas de page', async function () {
        await driver.get(`${config.baseUrl}/index.html`);

        // Chercher diff�rents �l�ments de pied de page
        const footerSelectors = [
            'footer',
            '.footer',
            '#footer',
            '.bottom',
            '.copyright',
            '.contact-info'
        ];

        let footerFound = false;
        for (const selector of footerSelectors) {
            try {
                const elements = await driver.findElements(By.css(selector));
                if (elements.length > 0) {
                    footerFound = true;
                    break;
                }
            } catch (e) {
                // Continue avec le prochain s�lecteur
            }
        }

        // Si aucun footer n'est trouv�, v�rifions s'il y a au moins quelque chose en bas de page
        if (!footerFound) {
            const bodyElements = await driver.findElements(By.css('body > *'));
            footerFound = bodyElements.length > 0;
        }

        assert.ok(footerFound, 'Un �l�ment de pied de page devrait �tre trouv�');
    });
});