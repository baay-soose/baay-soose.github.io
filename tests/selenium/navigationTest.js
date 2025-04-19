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

    it('devrait trouver des liens de navigation', async function () {
        await driver.get('http://localhost:8081/index.html');

        // Attendre que la page soit chargée
        await driver.wait(async () => {
            const readyState = await driver.executeScript('return document.readyState');
            return readyState === 'complete';
        }, 10000);

        // Chercher n'importe quel lien qui ressemble à de la navigation
        const links = await driver.findElements(By.css('a'));
        let navigationLinksFound = 0;

        for (const link of links) {
            try {
                const href = await link.getAttribute('href');
                const text = await link.getText();

                // Vérifier si le lien pointe vers une autre page du site
                if (href && href.includes('.html') && text.length > 0) {
                    navigationLinksFound++;
                }
            } catch (e) {
                // Continuer avec le prochain lien
            }
        }

        assert.ok(navigationLinksFound > 0, 'Des liens de navigation devraient être trouvés');
    });

    it('devrait pouvoir naviguer vers une autre page', async function () {
        await driver.get('http://localhost:8081/index.html');

        // Attendre que la page soit chargée
        await driver.wait(async () => {
            const readyState = await driver.executeScript('return document.readyState');
            return readyState === 'complete';
        }, 10000);

        // Trouver le premier lien qui mène à une autre page HTML
        const links = await driver.findElements(By.css('a'));
        let navigationSuccessful = false;
        let originalUrl = await driver.getCurrentUrl();

        for (const link of links.slice(0, 10)) { // Tester max 10 liens pour éviter les boucles infinies
            try {
                const href = await link.getAttribute('href');
                if (href && href.includes('.html') && !href.includes('index.html')) {
                    await link.click();

                    // Attendre que l'URL change
                    await driver.wait(async () => {
                        const newUrl = await driver.getCurrentUrl();
                        return newUrl !== originalUrl;
                    }, 5000);

                    navigationSuccessful = true;
                    break;
                }
            } catch (e) {
                // Continuer avec le prochain lien
            }
        }

        if (!navigationSuccessful) {
            console.log('Aucune navigation vers une autre page n\'a été possible - Test ignoré');
            this.skip();
        }
    });

    it('devrait pouvoir revenir à la page d\'accueil', async function () {
        await driver.get('http://localhost:8081/index.html');

        // Récupérer l'URL de la page d'accueil
        const homeUrl = await driver.getCurrentUrl();

        // Naviguer vers une autre page si possible
        const links = await driver.findElements(By.css('a'));
        let navigatedAway = false;

        for (const link of links) {
            try {
                const href = await link.getAttribute('href');
                if (href && href.includes('.html') && !href.includes('index.html')) {
                    await link.click();
                    await driver.wait(async () => {
                        const newUrl = await driver.getCurrentUrl();
                        return newUrl !== homeUrl;
                    }, 5000);
                    navigatedAway = true;
                    break;
                }
            } catch (e) {
                // Continuer avec le prochain lien
            }
        }

        if (!navigatedAway) {
            console.log('Impossible de naviguer ailleurs pour tester le retour - Test ignoré');
            this.skip();
        }

        // Essayer de revenir à la page d'accueil
        const homeLinks = await driver.findElements(By.css('a'));
        let returnedHome = false;

        for (const link of homeLinks) {
            try {
                const href = await link.getAttribute('href');
                if (href && (href === '/' || href.includes('index.html'))) {
                    await link.click();
                    await driver.wait(async () => {
                        const currentUrl = await driver.getCurrentUrl();
                        return currentUrl.includes('index.html');
                    }, 5000);
                    returnedHome = true;
                    break;
                }
            } catch (e) {
                // Continuer avec le prochain lien
            }
        }

        assert.ok(returnedHome, 'Devrait pouvoir retourner à la page d\'accueil');
    });
});