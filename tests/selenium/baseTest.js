// tests/selenium/baseTest.js
const { Builder, Browser, Capabilities } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const assert = require('assert');
const config = require('./config');
const fs = require('fs');

class BaseTest {
    constructor() {
        this.driver = null;
    }

    async setup() {
        console.log('Initialisation du driver Chrome...');

        try {
            const options = new chrome.Options();
            config.chromeOptions().forEach(arg => {
                console.log(`Ajout de l'option Chrome: ${arg}`);
                options.addArguments(arg);
            });

            // Ajouter des options suppl�mentaires pour la stabilit�
            options.addArguments('--disable-infobars');
            options.addArguments('--ignore-certificate-errors');
            options.addArguments('--start-maximized');

            console.log('Cr�ation du driver...');

            this.driver = await new Builder()
                .forBrowser(Browser.CHROME)
                .setChromeOptions(options)
                .build();

            console.log('Driver cr�� avec succ�s');

            // Configuration des timeouts
            await this.driver.manage().setTimeouts({
                implicit: 10000,
                pageLoad: 30000,
                script: 30000
            });

            console.log('Timeouts configur�s');

            // V�rifier que le driver fonctionne
            await this.driver.getTitle();
            console.log('Driver test� avec succ�s');

        } catch (error) {
            console.error('Erreur lors de l\'initialisation du driver:', error);

            // Capturer une trace compl�te de l'erreur
            if (error.stack) {
                console.error('Stack trace:', error.stack);
            }

            // V�rifier si Chrome est install�
            try {
                const { execSync } = require('child_process');
                execSync('where chrome || where google-chrome');
                console.log('Chrome est install�');
            } catch (e) {
                console.error('Chrome n\'est pas trouv� dans le PATH');
            }

            throw error;
        }
    }

    async teardown() {
        console.log('Nettoyage du driver...');
        if (this.driver) {
            try {
                // Capturer une derni�re capture d'�cran avant de fermer
                const screenshot = await this.driver.takeScreenshot();
                const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
                const filename = `screenshots/teardown-${timestamp}.png`;
                fs.writeFileSync(filename, screenshot, 'base64');
                console.log(`Capture d'�cran finale sauvegard�e: ${filename}`);
            } catch (e) {
                console.error('Erreur lors de la capture d\'�cran finale:', e.message);
            }

            try {
                await this.driver.quit();
                console.log('Driver ferm� avec succ�s');
            } catch (e) {
                console.error('Erreur lors de la fermeture du driver:', e.message);
            }
        }
    }

    getDriver() {
        return this.driver;
    }
}

module.exports = BaseTest;