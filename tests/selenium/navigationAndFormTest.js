const { By, until } = require('selenium-webdriver');
const BaseTest = require('./baseTest');
const assert = require('assert');
const config = require('./config');

describe('Tests de navigation et formulaire de contact', function () {
    this.timeout(30000);
    let test;
    let driver;

    beforeEach(async function () {
        console.log('--- Initialisation du test de navigation et formulaire ---');
        test = new BaseTest();
        await test.setup();
        driver = test.getDriver();
        console.log('Driver initialisé avec succès');
    });

    afterEach(async function () {
        console.log('--- Nettoyage du test de navigation et formulaire ---');
        await test.teardown();
    });

    it('devrait cliquer sur tous les liens de navigation', async function () {
        console.log('Test des clics sur les liens de navigation...');

        try {
            await driver.get(`${config.baseUrl}/index.html`);
            console.log('Page index chargée');

            // Attendre que la page soit complètement chargée
            await driver.wait(async () => {
                const readyState = await driver.executeScript('return document.readyState');
                return readyState === 'complete';
            }, 10000);

            // Clic sur Accueil
            console.log('Clic sur Accueil...');
            const accueilLink = await driver.findElement(By.css('a[href="#main-header"]'));
            await accueilLink.click();
            await driver.sleep(2000); // Petite pause pour voir l'animation

            // Clic sur Nos Services
            console.log('Clic sur Nos Services...');
            const servicesLink = await driver.findElement(By.css('a[href="#feature"]'));
            await servicesLink.click();
            await driver.sleep(2000);

            // Clic sur Nos travaux
            console.log('Clic sur Nos travaux...');
            const travauxLink = await driver.findElement(By.css('a[href="#portfolio"]'));
            await travauxLink.click();
            await driver.sleep(2000);

            // Clic sur Contactez-nous
            console.log('Clic sur Contactez-nous...');
            const contactLink = await driver.findElement(By.css('a[href="#contact"]'));
            await contactLink.click();
            await driver.sleep(2000);

            console.log('Navigation réussie!');

        } catch (error) {
            console.error('Erreur dans le test de navigation:', error);
            throw error;
        }


        try {
            await driver.get(`${config.baseUrl}/index.html`);
            console.log('Page index chargée');

            // Attendre que la page soit complètement chargée
            await driver.wait(async () => {
                const readyState = await driver.executeScript('return document.readyState');
                return readyState === 'complete';
            }, 10000);

            // Naviguer vers la section portfolio
            const portfolioLink = await driver.findElement(By.css('a[href="#portfolio"]'));
            await portfolioLink.click();
            await driver.sleep(2000); // Attendre la fin de l'animation de scroll

            // Trouver toutes les images du portfolio
            const portfolioItems = await driver.findElements(By.css('.portfolio-item img'));
            console.log(`Nombre d'images trouvées: ${portfolioItems.length}`);

            // Tester le survol sur chaque image
            for (let i = 0; i < portfolioItems.length && i < 3; i++) { // Limiter à 3 images pour le test
                const image = portfolioItems[i];

                // Obtenir les propriétés CSS avant le survol
                console.log(`Test de l'image ${i + 1}...`);
                const initialOpacity = await image.getCssValue('opacity');
                const initialTransform = await image.getCssValue('transform');

                // Survoler l'image
                await driver.actions().move({ origin: image }).perform();
                await driver.sleep(500); // Attendre que l'animation CSS se produise

                // Obtenir les propriétés CSS après le survol
                const hoverOpacity = await image.getCssValue('opacity');
                const hoverTransform = await image.getCssValue('transform');

                console.log(`Image ${i + 1} - Avant survol: opacity=${initialOpacity}, transform=${initialTransform}`);
                console.log(`Image ${i + 1} - Après survol: opacity=${hoverOpacity}, transform=${hoverTransform}`);

                // Vérifier si les propriétés ont changé (indiquant un effet hover)
                if (initialOpacity !== hoverOpacity || initialTransform !== hoverTransform) {
                    console.log(`✓ Effet hover détecté sur l'image ${i + 1}`);
                } else {
                    // Vérifier aussi d'autres propriétés qui pourraient changer
                    const initialFilter = await image.getCssValue('filter');
                    const hoverFilter = await image.getCssValue('filter');
                    if (initialFilter !== hoverFilter) {
                        console.log(`✓ Effet hover (filter) détecté sur l'image ${i + 1}`);
                    }
                }

                // Déplacer la souris ailleurs pour réinitialiser
                await driver.actions().move({ x: 0, y: 0 }).perform();
                await driver.sleep(500);
            }

            // Tester également le survol sur les figures (qui contiennent les figcaption)
            console.log('\nTest des effets sur les figures du portfolio...');
            const figures = await driver.findElements(By.css('.portfolio-item figure'));

            if (figures.length > 0) {
                const figure = figures[0];

                // Vérifier l'état initial du figcaption
                const figcaption = await figure.findElement(By.css('figcaption'));
                const initialDisplay = await figcaption.getCssValue('display');
                const initialVisibility = await figcaption.getCssValue('visibility');
                const initialOpacityFigcaption = await figcaption.getCssValue('opacity');

                console.log(`Figcaption avant survol: display=${initialDisplay}, visibility=${initialVisibility}, opacity=${initialOpacityFigcaption}`);

                // Survoler la figure
                await driver.actions().move({ origin: figure }).perform();
                await driver.sleep(1000); // Attendre plus longtemps pour les animations CSS

                // Vérifier l'état après survol
                const hoverDisplay = await figcaption.getCssValue('display');
                const hoverVisibility = await figcaption.getCssValue('visibility');
                const hoverOpacityFigcaption = await figcaption.getCssValue('opacity');

                console.log(`Figcaption après survol: display=${hoverDisplay}, visibility=${hoverVisibility}, opacity=${hoverOpacityFigcaption}`);

                // Vérifier si le figcaption est devenu visible
                if ((initialDisplay !== hoverDisplay) ||
                    (initialVisibility !== hoverVisibility) ||
                    (parseFloat(initialOpacityFigcaption) !== parseFloat(hoverOpacityFigcaption))) {
                    console.log('✓ Effet hover détecté sur le figcaption');
                }
            }

            console.log('Test des effets CSS terminé avec succès!');

        } catch (error) {
            console.error('Erreur dans le test des effets CSS:', error);
            throw error;
        }

        try {
            await driver.get(`${config.baseUrl}/index.html`);
            console.log('Page index chargée');

            // Attendre que la page soit complètement chargée
            await driver.wait(async () => {
                const readyState = await driver.executeScript('return document.readyState');
                return readyState === 'complete';
            }, 10000);

            // Aller directement à la section contact
            console.log('Navigation vers la section contact...');
            const contactLink = await driver.findElement(By.css('a[href="#contact"]'));
            await contactLink.click();
            await driver.sleep(2000); // Attendre que le scroll soit terminé

            // Remplir le formulaire
            console.log('Remplissage du formulaire...');

            // Remplir le champ Nom
            const nameField = await driver.findElement(By.css('input[name="name"]'));
            await driver.executeScript("arguments[0].scrollIntoView(true);", nameField);
            await nameField.sendKeys('Socé Ndiaye');
            console.log('Nom saisi');

            // Remplir le champ Email
            const emailField = await driver.findElement(By.css('input[name="email"]'));
            await emailField.sendKeys('ndiayesoce212@gmail.com');
            console.log('Email saisi');

            // Remplir le champ Sujet
            const subjectField = await driver.findElement(By.css('input[name="subject"]'));
            await subjectField.sendKeys('Construction batiment avec Turtle');
            console.log('Sujet saisi');

            // Remplir le champ Message
            const messageField = await driver.findElement(By.css('textarea[name="message"]'));
            await messageField.sendKeys('Ce travail a été realisé par Socé Ndiaye');
            console.log('Message saisi');

            // Capture d'écran avant soumission
            const screenshot = await driver.takeScreenshot();
            const fs = require('fs');
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            fs.writeFileSync(`screenshots/contact-form-${timestamp}.png`, screenshot, 'base64');
            console.log(`Capture d'écran du formulaire sauvegardée`);

            // Soumettre le formulaire
            console.log('Soumission du formulaire...');
            const submitButton = await driver.findElement(By.css('button[type="submit"]'));
            await submitButton.click();
            console.log('Formulaire soumis');

            // Attendre un peu pour voir le résultat
            await driver.sleep(4000);

            console.log('Test du formulaire terminé avec succès!');

        } catch (error) {
            console.error('Erreur dans le test du formulaire:', error);
            throw error;
        }
    });

   
});