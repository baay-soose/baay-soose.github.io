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
            await nameField.sendKeys('Soce Ndiaye');
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
            await messageField.sendKeys('Ce travail a ete realise par Soce Ndiaye');
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